

```json
package com.mock.sftp;

import com.github.tomakehurst.wiremock.common.FileSource;
import com.github.tomakehurst.wiremock.extension.Parameters;
import com.github.tomakehurst.wiremock.extension.ResponseTransformer;
import com.github.tomakehurst.wiremock.http.Request;
import com.github.tomakehurst.wiremock.http.Response;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Transformer pour GET /api/sftp/check/{codeOrg}/{fileName}
 *
 * Lit dans FileStateStore :
 *   - trouvé   → 200 + données
 *   - pas trouvé → 404
 */
public class SftpCheckTransformer extends ResponseTransformer {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String getName() {
        return "sftp-check-transformer";
    }

    @Override
    public boolean applyGlobally() {
        return false;
    }

    @Override
    public Response transform(Request request, Response response, FileSource files, Parameters parameters) {
        try {
            String[] segments = request.getUrl().split("/");
            if (segments.length < 6) {
                return buildResponse(response, 400,
                        Map.of("error", "URL invalide, attendu: /api/sftp/check/{codeOrg}/{fileName}"));
            }

            String codeOrg = segments[4];
            String fileName = segments[5];
            String key = codeOrg + "/" + fileName;

            Map<String, String> state = FileStateStore.getInstance().get(key);

            if (state != null) {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("found", true);
                body.putAll(state);
                return buildResponse(response, 200, body);
            } else {
                return buildResponse(response, 404, Map.of(
                        "found", false,
                        "codeOrg", codeOrg,
                        "fileName", fileName,
                        "status", "NOT_FOUND"
                ));
            }

        } catch (Exception e) {
            return buildResponse(response, 500,
                    Map.of("error", "Erreur interne: " + e.getMessage()));
        }
    }

    private Response buildResponse(Response original, int status, Map<String, ?> body) {
        try {
            return Response.Builder.like(original)
                    .but()
                    .status(status)
                    .header("Content-Type", "application/json")
                    .body(MAPPER.writeValueAsString(body))
                    .build();
        } catch (Exception e) {
            return Response.Builder.like(original).but().status(500).body("{}").build();
        }
    }
}



```
