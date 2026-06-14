package com.owaspguard.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for dashboard summary statistics.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryResponse {
    private long totalScans;
    private long totalVulnerabilities;
    private long highCount;
    private long mediumCount;
    private long lowCount;
}
