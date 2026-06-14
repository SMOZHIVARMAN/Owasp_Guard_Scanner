package com.owaspguard.dashboard;

import com.owaspguard.scan.model.ScanStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO representing a recent scan in dashboard analytics.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecentScanResponse {
    private Long id;
    private String targetUrl;
    private ScanStatus status;
    private LocalDateTime createdAt;
}
