``
import org.apache.sshd.server.SshServer;
import org.apache.sshd.server.keyprovider.SimpleGeneratorHostKeyProvider;
import org.apache.sshd.sftp.server.SftpSubsystemFactory;
import org.apache.sshd.server.auth.password.AcceptAllPasswordAuthenticator;

SshServer sshd = SshServer.setUpDefaultServer();
sshd.setPort(2222);
sshd.setKeyPairProvider(new SimpleGeneratorHostKeyProvider(Path.of("hostkey.ser")));
sshd.setPasswordAuthenticator(AcceptAllPasswordAuthenticator.INSTANCE);
sshd.setSubsystemFactories(List.of(new SftpSubsystemFactory()));
sshd.start();



<dependency>
    <groupId>com.github.stefanbirkner</groupId>
    <artifactId>fake-sftp-server-rule</artifactId>
    <version>2.0.1</version>
    <scope>test</scope>
</dependency>


@Rule
public final FakeSftpServerRule sftpServer = new FakeSftpServerRule()
    .setPort(2222)
    .addUser("user", "password");

@Test
public void testSftp() {
    sftpServer.putFile("/remote/file.txt", "contenu du fichier", UTF_8);
    // ton code qui se connecte en SFTP...
}

``
