package com.owaspguard.dashboard;

import com.owaspguard.scan.entity.ScanEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mapper for converting dashboard analytics entities and values to DTOs.
 */
@Component
public class DashboardMapper {

    public DashboardSummaryResponse toSummaryResponse(long totalScans, long totalVulnerabilities, Map<String, Long> severityCounts) {
        return DashboardSummaryResponse.builder()
                .totalScans(totalScans)
                .totalVulnerabilities(totalVulnerabilities)
                .highCount(severityCounts.getOrDefault("HIGH", 0L))
                .mediumCount(severityCounts.getOrDefault("MEDIUM", 0L))
                .lowCount(severityCounts.getOrDefault("LOW", 0L))
                .build();
    }

    public SeverityDistributionResponse toDistributionResponse(Map<String, Long> severityCounts) {
        return SeverityDistributionResponse.builder()
                .high(severityCounts.getOrDefault("HIGH", 0L))
                .medium(severityCounts.getOrDefault("MEDIUM", 0L))
                .low(severityCounts.getOrDefault("LOW", 0L))
                .build();
    }

    public RecentScanResponse toRecentScanResponse(ScanEntity scan) {
        if (scan == null) {
            return null;
        }
        return RecentScanResponse.builder()
                .id(scan.getId())
                .targetUrl(scan.getTargetUrl())
                .status(scan.getStatus())
                .createdAt(scan.getStartedAt())
                .build();
    }

    public List<RecentScanResponse> toRecentScanResponseList(List<ScanEntity> scans) {
        if (scans == null) {
            return List.of();
        }
        return scans.stream()
                .map(this::toRecentScanResponse)
                .collect(Collectors.toList());
    }
}
