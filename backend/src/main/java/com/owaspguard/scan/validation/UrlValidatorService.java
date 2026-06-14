package com.owaspguard.scan.validation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.URI;

/**
 * Service to validate scan target URLs and prevent SSRF attacks.
 */
@Service
@Slf4j
public class UrlValidatorService {

    /**
     * Programmatic check to determine if a URL is safe and valid.
     */
    public boolean isValidUrl(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        try {
            URI uri = new URI(value);
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                return false;
            }

            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                return false;
            }

            // Resolve host to IP addresses and perform blocklist check (SSRF prevention)
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress address : addresses) {
                if (address.isLoopbackAddress()) {
                    log.warn("Blocked scan target: {} resolves to loopback address {}", value, address.getHostAddress());
                    return false;
                }
                if (address.isSiteLocalAddress()) {
                    log.warn("Blocked scan target: {} resolves to site-local (RFC 1918) address {}", value, address.getHostAddress());
                    return false;
                }
                if (address.isLinkLocalAddress()) {
                    log.warn("Blocked scan target: {} resolves to link-local address {}", value, address.getHostAddress());
                    return false;
                }
                if (address.isAnyLocalAddress()) {
                    log.warn("Blocked scan target: {} resolves to wildcard address {}", value, address.getHostAddress());
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            log.warn("Error resolving or validating target URL: {}", value, e);
            return false;
        }
    }
}
