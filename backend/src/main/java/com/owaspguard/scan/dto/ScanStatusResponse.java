package com.owaspguard.scan.dto;

import com.owaspguard.scan.model.ScanStatus;
import lombok.*;

/**
 * Data Transfer Object representing the detailed progress status of a scan.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScanStatusResponse {
    private Long scanId;
    private ScanStatus status;
    private int progress;
}
