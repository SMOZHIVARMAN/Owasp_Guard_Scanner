package com.owaspguard.scan.client;

import com.owaspguard.zap.ZapProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * REST Client for communicating with the OWASP ZAP API.
 */
@Component
@Slf4j
public class ZapScanClient {

    private final ZapProperties properties;
    private final RestTemplate restTemplate;

    public ZapScanClient(ZapProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
    }

    private String getBaseUrl() {
        return String.format("http://%s:%d", properties.getHost(), properties.getPort());
    }

    /**
     * Start the ZAP Spider Scan for the target URL.
     * Returns the ZAP Spider scan ID.
     */
    public String startSpider(String targetUrl) {
        String url = getBaseUrl() + "/JSON/spider/action/scan/?apikey={apikey}&url={url}";
        try {
            log.info("Requesting ZAP Spider Scan for URL: {}", targetUrl);
            Map<String, String> params = Map.of(
                    "apikey", properties.getApiKey() != null ? properties.getApiKey() : "",
                    "url", targetUrl
            );
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class, params);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object scanId = response.getBody().get("scan");
                if (scanId != null) {
                    log.info("ZAP Spider Scan started. ID: {}", scanId);
                    return scanId.toString();
                }
            }
            throw new RuntimeException("ZAP responded but failed to return a valid spider scan ID.");
        } catch (Exception e) {
            log.error("Failed to start ZAP Spider Scan: {}", e.getMessage(), e);
            throw new RuntimeException("ZAP Spider execution failed: " + e.getMessage(), e);
        }
    }

    /**
     * Check the status of ZAP Spider Scan.
     * Returns the completion percentage (0 - 100).
     */
    public int getSpiderStatus(String scanId) {
        String url = getBaseUrl() + "/JSON/spider/view/status/?apikey={apikey}&scanId={scanId}";
        try {
            Map<String, String> params = Map.of(
                    "apikey", properties.getApiKey() != null ? properties.getApiKey() : "",
                    "scanId", scanId
            );
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class, params);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object statusObj = response.getBody().get("status");
                if (statusObj != null) {
                    return Integer.parseInt(statusObj.toString());
                }
            }
            return 0;
        } catch (Exception e) {
            log.error("Failed to check ZAP Spider status for scan ID {}: {}", scanId, e.getMessage());
            return 0;
        }
    }

    /**
     * Start the ZAP Active Scan for the target URL.
     * Returns the ZAP Active Scan ID.
     */
    public String startActiveScan(String targetUrl) {
        String url = getBaseUrl() + "/JSON/ascan/action/scan/?apikey={apikey}&url={url}";
        try {
            log.info("Requesting ZAP Active Scan for URL: {}", targetUrl);
            Map<String, String> params = Map.of(
                    "apikey", properties.getApiKey() != null ? properties.getApiKey() : "",
                    "url", targetUrl
            );
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class, params);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object scanId = response.getBody().get("scan");
                if (scanId != null) {
                    log.info("ZAP Active Scan started. ID: {}", scanId);
                    return scanId.toString();
                }
            }
            throw new RuntimeException("ZAP responded but failed to return a valid active scan ID.");
        } catch (Exception e) {
            log.error("Failed to start ZAP Active Scan: {}", e.getMessage(), e);
            throw new RuntimeException("ZAP Active Scan execution failed: " + e.getMessage(), e);
        }
    }

    /**
     * Check the status of ZAP Active Scan.
     * Returns the completion percentage (0 - 100).
     */
    public int getActiveScanStatus(String scanId) {
        String url = getBaseUrl() + "/JSON/ascan/view/status/?apikey={apikey}&scanId={scanId}";
        try {
            Map<String, String> params = Map.of(
                    "apikey", properties.getApiKey() != null ? properties.getApiKey() : "",
                    "scanId", scanId
            );
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class, params);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object statusObj = response.getBody().get("status");
                if (statusObj != null) {
                    return Integer.parseInt(statusObj.toString());
                }
            }
            return 0;
        } catch (Exception e) {
            log.error("Failed to check ZAP Active Scan status for scan ID {}: {}", scanId, e.getMessage());
            return 0;
        }
    }

    /**
     * Fetch alerts/vulnerabilities from the ZAP daemon for a given base URL.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getAlerts(String targetUrl) {
        String url = getBaseUrl() + "/JSON/core/view/alerts/?apikey={apikey}&baseurl={baseurl}";
        try {
            log.info("Fetching ZAP security alerts for base URL: {}", targetUrl);
            Map<String, String> params = Map.of(
                    "apikey", properties.getApiKey() != null ? properties.getApiKey() : "",
                    "baseurl", targetUrl
            );
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class, params);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object alertsObj = response.getBody().get("alerts");
                if (alertsObj instanceof List) {
                    return (List<Map<String, Object>>) alertsObj;
                }
            }
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to fetch alerts from ZAP for URL {}: {}", targetUrl, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}
