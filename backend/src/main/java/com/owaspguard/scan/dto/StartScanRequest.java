package com.owaspguard.scan.dto;

import com.owaspguard.common.validation.SafeUrl;
import com.owaspguard.scan.model.ScanType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.validator.constraints.URL;

/**
 * Data Transfer Object for starting a security scan.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StartScanRequest {

    @NotBlank(message = "Target URL is required")
    @URL(message = "Invalid URL format")
    @SafeUrl
    private String targetUrl;

    @NotNull(message = "Scan type is required")
    private ScanType scanType;
}
