package com.owaspguard.scan.dto;

import com.owaspguard.scan.model.ScanStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing basic response details of a initiated scan.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScanResponse {
    private Long scanId;
    private String targetUrl;
    private ScanStatus status;
    private LocalDateTime startedAt;
}
