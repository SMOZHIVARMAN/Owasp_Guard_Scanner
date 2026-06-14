package com.owaspguard.scan.dto;

import com.owaspguard.scan.model.ScanStatus;
import com.owaspguard.scan.model.ScanType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for the detailed scan response.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScanDetailResponse {
    private Long id;
    private String targetUrl;
    private ScanType scanType;
    private ScanStatus status;
    private int progress;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private long vulnerabilityCount;
    private String errorLog;
}
