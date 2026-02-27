

```json
package com.mock.sftp;

import com.github.tomakehurst.wiremock.common.FileSource;
import com.github.tomakehurst.wiremock.extension.Parameters;
import com.github.tomakehurst.wiremock.extension.ResponseTransformer;
import com.github.tomakehurst.wiremock.http.Request;
import com.github.tomakehurst.wiremock.http.Response;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Transformer pour POST /api/sftp/send/{codeOrg}/{fileName}
 * Body attendu : {"content": "..."}
 *
 * Stocke dans FileStateStore et retourne un JSON de confirmation.
 */
public class SftpSendTransformer extends ResponseTransformer {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String getName() {
        return "sftp-send-transformer";
    }

    @Override
    public boolean applyGlobally() {
        return false; // activé uniquement sur les mappings qui le déclarent
    }

    @Override
    public Response transform(Request request, Response response, FileSource files, Parameters parameters) {
        try {
            // Parse URL : /api/sftp/send/{codeOrg}/{fileName}
            String[] segments = request.getUrl().split("/");
            // segments: ["", "api", "sftp", "send", "{codeOrg}", "{fileName}"]
            if (segments.length < 6) {
                return errorResponse(response, 400, "URL invalide, attendu: /api/sftp/send/{codeOrg}/{fileName}");
            }

            String codeOrg = segments[4];
            String fileName = segments[5];
            String key = codeOrg + "/" + fileName;

            // Parse body
            String content = "";
            String body = request.getBodyAsString();
            if (body != null && !body.isBlank()) {
                JsonNode node = MAPPER.readTree(body);
                if (node.has("content")) {
                    content = node.get("content").asText();
                }
            }

            // Stocke
            Map<String, String> state = new HashMap<>();
            state.put("codeOrg", codeOrg);
            state.put("fileName", fileName);
            state.put("content", content);
            state.put("status", "DELIVERED");
            state.put("sentAt", Instant.now().toString());

            FileStateStore.getInstance().put(key, state);

            // Réponse
            String json = MAPPER.writeValueAsString(Map.of(
                    "status", "ACCEPTED",
                    "codeOrg", codeOrg,
                    "fileName", fileName
            ));

            return Response.Builder.like(response)
                    .but()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(json)
                    .build();

        } catch (Exception e) {
            return errorResponse(response, 500, "Erreur interne: " + e.getMessage());
        }
    }

    private Response errorResponse(Response response, int status, String message) {
        return Response.Builder.like(response)
                .but()
                .status(status)
                .header("Content-Type", "application/json")
                .body("{\"error\": \"" + message + "\"}")
                .build();
    }
}




```
