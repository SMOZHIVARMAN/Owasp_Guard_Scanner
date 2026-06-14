package com.owaspguard.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.extern.slf4j.Slf4j;

import java.net.InetAddress;
import java.net.URI;
import java.net.URL;

@Slf4j
public class SafeUrlValidator implements ConstraintValidator<SafeUrl, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // Let @NotBlank handle nulls/blanks
        }

        try {
            // Validate basic URL syntax and protocol
            URI uri = new URI(value);
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                return false;
            }

            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                return false;
            }

            // Resolve host to IP addresses
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress address : addresses) {
                // Check against SSRF Blacklist
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
