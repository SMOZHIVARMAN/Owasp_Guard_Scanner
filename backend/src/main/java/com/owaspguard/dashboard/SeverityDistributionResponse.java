package com.owaspguard.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for dashboard severity distribution.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SeverityDistributionResponse {
    private long high;
    private long medium;
    private long low;
}
