# Serveur SFTP embarqué aux côtés de WireMock (Standalone)

L'objectif : quand WireMock démarre, un **serveur SFTP** démarre aussi sur un port dédié, prêt à recevoir des connexions d'applications externes.

WireMock ne gère que le HTTP. On utilise **Apache MINA SSHD** pour lancer un vrai serveur SFTP au démarrage de WireMock, via une **extension WireMock** ou un **wrapper applicatif**.

---

## Dépendances Maven

```xml
<dependencies>
    <!-- WireMock standalone -->
    <dependency>
        <groupId>org.wiremock</groupId>
        <artifactId>wiremock-standalone</artifactId>
        <version>3.5.4</version>
    </dependency>

    <!-- SFTP embarqué -->
    <dependency>
        <groupId>org.apache.sshd</groupId>
        <artifactId>sshd-sftp</artifactId>
        <version>2.12.1</version>
    </dependency>
</dependencies>
```

---

## Option 1 : Wrapper applicatif (recommandé — simple et direct)

Un `main()` qui démarre les deux serveurs ensemble.

```java
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import org.apache.sshd.server.SshServer;
import org.apache.sshd.server.keyprovider.SimpleGeneratorHostKeyProvider;
import org.apache.sshd.sftp.server.SftpSubsystemFactory;
import org.apache.sshd.common.file.virtualfs.VirtualFileSystemFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class MockServerApp {

    public static void main(String[] args) throws Exception {

        // ========== CONFIG ==========
        int wireMockPort = 8080;
        int sftpPort = 2222;
        String sftpUser = "user";
        String sftpPassword = "password";
        Path sftpRoot = Path.of("sftp-root");

        // Créer le répertoire racine SFTP
        Files.createDirectories(sftpRoot);

        // ========== DÉMARRAGE WIREMOCK ==========
        WireMockServer wireMock = new WireMockServer(
            WireMockConfiguration.wireMockConfig()
                .port(wireMockPort)
                .usingFilesUnderDirectory("wiremock")  // mappings/, __files/
        );
        wireMock.start();
        System.out.println("✅ WireMock démarré sur http://localhost:" + wireMockPort);

        // ========== DÉMARRAGE SFTP ==========
        SshServer sshd = SshServer.setUpDefaultServer();
        sshd.setPort(sftpPort);
        sshd.setKeyPairProvider(
            new SimpleGeneratorHostKeyProvider(Path.of("hostkey.ser"))
        );
        sshd.setPasswordAuthenticator(
            (username, password, session) ->
                sftpUser.equals(username) && sftpPassword.equals(password)
        );
        sshd.setSubsystemFactories(List.of(new SftpSubsystemFactory()));
        sshd.setFileSystemFactory(
            new VirtualFileSystemFactory(sftpRoot.toAbsolutePath())
        );
        sshd.start();
        System.out.println("✅ SFTP démarré sur sftp://localhost:" + sftpPort);
        System.out.println("   User: " + sftpUser + " / Password: " + sftpPassword);
        System.out.println("   Répertoire racine: " + sftpRoot.toAbsolutePath());

        // ========== SHUTDOWN HOOK ==========
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("🛑 Arrêt des serveurs...");
            wireMock.stop();
            try { sshd.stop(); } catch (Exception e) { e.printStackTrace(); }
        }));

        // Garder le process vivant
        Thread.currentThread().join();
    }
}
```

---

## Option 2 : Extension WireMock

Si tu veux que le SFTP soit **intégré dans le lifecycle** de WireMock (démarre/s'arrête avec lui).

```java
import com.github.tomakehurst.wiremock.extension.Extension;
import com.github.tomakehurst.wiremock.extension.ExtensionFactory;
import com.github.tomakehurst.wiremock.extension.MappingsLoaderExtension;
import org.apache.sshd.server.SshServer;
import org.apache.sshd.server.keyprovider.SimpleGeneratorHostKeyProvider;
import org.apache.sshd.sftp.server.SftpSubsystemFactory;
import org.apache.sshd.common.file.virtualfs.VirtualFileSystemFactory;

import java.nio.file.Path;
import java.util.List;

public class SftpExtension implements com.github.tomakehurst.wiremock.extension.Extension {

    private SshServer sshd;

    @Override
    public String getName() {
        return "sftp-server";
    }

    @Override
    public void start() {
        try {
            sshd = SshServer.setUpDefaultServer();
            sshd.setPort(2222);
            sshd.setKeyPairProvider(
                new SimpleGeneratorHostKeyProvider(Path.of("hostkey.ser"))
            );
            sshd.setPasswordAuthenticator(
                (user, pass, session) ->
                    "user".equals(user) && "password".equals(pass)
            );
            sshd.setSubsystemFactories(List.of(new SftpSubsystemFactory()));
            sshd.setFileSystemFactory(
                new VirtualFileSystemFactory(Path.of("sftp-root").toAbsolutePath())
            );
            sshd.start();
            System.out.println("✅ SFTP extension démarrée sur le port 2222");
        } catch (Exception e) {
            throw new RuntimeException("Impossible de démarrer le SFTP", e);
        }
    }

    @Override
    public void stop() {
        if (sshd != null) {
            try { sshd.stop(); } catch (Exception e) { e.printStackTrace(); }
        }
    }
}
```

Enregistrement dans le `main` :

```java
WireMockServer wireMock = new WireMockServer(
    WireMockConfiguration.wireMockConfig()
        .port(8080)
        .extensions(new SftpExtension())
);
wireMock.start();
```

---

## Structure du projet

```
project/
├── src/main/java/
│   └── MockServerApp.java        # ou SftpExtension.java
├── wiremock/
│   ├── mappings/                  # Stubs HTTP WireMock (.json)
│   └── __files/                   # Fichiers statiques WireMock
├── sftp-root/                     # Répertoire exposé via SFTP
│   ├── inbox/
│   │   └── fichier-exemple.csv
│   └── outbox/
├── pom.xml
└── hostkey.ser                    # Généré automatiquement au 1er lancement
```

---

## Test rapide de connexion SFTP

```bash
# Connexion avec le client sftp
sftp -P 2222 user@localhost

# Ou avec curl
curl -u user:password sftp://localhost:2222/inbox/fichier-exemple.csv --insecure
```

---

## Résumé

| Composant | Port | Protocole | Rôle |
|---|---|---|---|
| WireMock | `8080` | HTTP/HTTPS | Mock des API REST |
| Apache MINA SSHD | `2222` | SFTP (SSH) | Mock du serveur SFTP |

Les deux démarrent ensemble. L'application externe se connecte en **HTTP sur le 8080** et en **SFTP sur le 2222** comme si c'étaient de vrais serveurs.
