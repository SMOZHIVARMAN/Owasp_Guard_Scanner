package com.owaspguard.scan;

import com.owaspguard.scan.dto.ScanDetailResponse;
import com.owaspguard.scan.dto.ScanSummaryResponse;
import com.owaspguard.scan.dto.ScanVulnerabilityResponse;
import com.owaspguard.scan.entity.ScanEntity;
import com.owaspguard.scan.entity.VulnerabilityEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper for Scan and Vulnerability related conversions.
 */
@Component
public class ScanMapper {

    public ScanSummaryResponse toSummaryResponse(ScanEntity scan, long vulnerabilityCount) {
        if (scan == null) {
            return null;
        }
        return ScanSummaryResponse.builder()
                .id(scan.getId())
                .targetUrl(scan.getTargetUrl())
                .scanType(scan.getScanType())
                .status(scan.getStatus())
                .progress(scan.getProgress())
                .startedAt(scan.getStartedAt())
                .completedAt(scan.getCompletedAt())
                .vulnerabilityCount(vulnerabilityCount)
                .build();
    }

    public ScanDetailResponse toDetailResponse(ScanEntity scan, long vulnerabilityCount) {
        if (scan == null) {
            return null;
        }
        return ScanDetailResponse.builder()
                .id(scan.getId())
                .targetUrl(scan.getTargetUrl())
                .scanType(scan.getScanType())
                .status(scan.getStatus())
                .progress(scan.getProgress())
                .startedAt(scan.getStartedAt())
                .completedAt(scan.getCompletedAt())
                .vulnerabilityCount(vulnerabilityCount)
                .errorLog(scan.getErrorLog())
                .build();
    }

    public ScanVulnerabilityResponse toVulnerabilityResponse(VulnerabilityEntity vulnerability) {
        if (vulnerability == null) {
            return null;
        }
        return ScanVulnerabilityResponse.builder()
                .id(vulnerability.getId())
                .vulnerabilityName(vulnerability.getName())
                .description(vulnerability.getDescription())
                .severity(vulnerability.getSeverity())
                .owaspCategory(vulnerability.getOwaspCategory())
                .recommendation(vulnerability.getSolution()) // solution is mapped to recommendation
                .build();
    }
}
