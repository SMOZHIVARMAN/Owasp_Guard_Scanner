package com.owaspguard.zap;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class ZapClient {

    private final ZapProperties properties;
    private final RestTemplate restTemplate;

    public ZapClient(ZapProperties properties) {
        this.properties = properties;

        SimpleClientHttpRequestFactory factory =
                new SimpleClientHttpRequestFactory();

        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);

        this.restTemplate = new RestTemplate(factory);
    }

    private String getBaseUrl() {
        return String.format(
                "http://%s:%d",
                properties.getHost(),
                properties.getPort()
        );
    }

    /**
     * Returns ZAP version if reachable.
     */
    public String getVersion() {

        String url =
                getBaseUrl()
                        + "/JSON/core/view/version/?apikey="
                        + properties.getApiKey();

        try {

            log.info("Calling ZAP URL: {}", url);

            ResponseEntity<Map> response =
                    restTemplate.getForEntity(
                            url,
                            Map.class
                    );

            if (response.getStatusCode().is2xxSuccessful()
                    && response.getBody() != null) {

                Object version =
                        response.getBody().get("version");

                if (version != null) {

                    log.info(
                            "Connected to ZAP successfully. Version: {}",
                            version
                    );

                    return version.toString();
                }
            }

            log.warn("ZAP responded but version field was missing.");

        } catch (Exception e) {

            log.error(
                    "Failed to connect to ZAP at {}",
                    url,
                    e
            );
        }

        return null;
    }

    /**
     * Health check.
     */
    public boolean isHealthy() {
        return getVersion() != null;
    }

    /**
     * Startup validation.
     */
    public void verifyConnection() {

        String hostInfo =
                properties.getHost()
                        + ":"
                        + properties.getPort();

        String version = getVersion();

        if (version != null) {

            log.info(
                    "Successfully connected to OWASP ZAP Daemon at {}",
                    hostInfo
            );

            log.info(
                    "OWASP ZAP Version: {}",
                    version
            );

        } else {

            log.warn(
                    "OWASP ZAP Daemon is offline or unreachable at {}. Real security scanning features will be disabled.",
                    hostInfo
            );
        }
    }
}