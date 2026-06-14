package com.owaspguard.scan.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing a request to start a new scan.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScanRequest {

    @NotBlank(message = "URL is required")
    @URL(message = "Invalid URL format")
    private String url;
}
