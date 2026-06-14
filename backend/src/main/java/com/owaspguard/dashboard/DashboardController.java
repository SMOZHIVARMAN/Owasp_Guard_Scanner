package com.owaspguard.dashboard;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for dashboard endpoints.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/severity-distribution")
    public ResponseEntity<SeverityDistributionResponse> getSeverityDistribution() {
        return ResponseEntity.ok(dashboardService.getSeverityDistribution());
    }

    @GetMapping("/recent-scans")
    public ResponseEntity<List<RecentScanResponse>> getRecentScans() {
        return ResponseEntity.ok(dashboardService.getRecentScans());
    }
}
