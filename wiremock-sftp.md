

```json
package com.mock.sftp;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Store clé-valeur en mémoire, persisté en JSON sur disque.
 * Clé : "{codeOrg}/{fileName}"
 * Valeur : Map de propriétés (content, status, sentAt, etc.)
 *
 * Fichier configurable via -Dwiremock.state.file (défaut : ./sftp-state.json)
 */
public class FileStateStore {

    private static final FileStateStore INSTANCE = new FileStateStore();

    private final ConcurrentHashMap<String, Map<String, String>> store = new ConcurrentHashMap<>();
    private final Path filePath;
    private final ObjectMapper mapper;

    private FileStateStore() {
        this.filePath = Paths.get(System.getProperty("wiremock.state.file", "sftp-state.json"));
        this.mapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
        load();
    }

    public static FileStateStore getInstance() {
        return INSTANCE;
    }

    /** Stocke un enregistrement et flush sur disque. */
    public void put(String key, Map<String, String> value) {
        store.put(key, value);
        flush();
    }

    /** Récupère un enregistrement, null si absent. */
    public Map<String, String> get(String key) {
        return store.get(key);
    }

    public boolean exists(String key) {
        return store.containsKey(key);
    }

    /** Charge le fichier JSON au démarrage. */
    private void load() {
        if (Files.exists(filePath)) {
            try {
                var data = mapper.readValue(filePath.toFile(),
                        new TypeReference<ConcurrentHashMap<String, Map<String, String>>>() {});
                store.putAll(data);
                System.out.println("[SftpStateStore] Loaded " + store.size() + " entries from " + filePath);
            } catch (IOException e) {
                System.err.println("[SftpStateStore] Failed to load state: " + e.getMessage());
            }
        }
    }

    /** Écrit tout le store sur disque (synchronisé pour éviter les écritures concurrentes). */
    private synchronized void flush() {
        try {
            mapper.writeValue(filePath.toFile(), store);
        } catch (IOException e) {
            System.err.println("[SftpStateStore] Failed to persist state: " + e.getMessage());
        }
    }
}






```
