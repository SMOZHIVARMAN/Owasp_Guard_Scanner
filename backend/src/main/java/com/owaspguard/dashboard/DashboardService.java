package com.owaspguard.dashboard;

import com.owaspguard.scan.entity.ScanEntity;
import com.owaspguard.scan.repository.ScanRepository;
import com.owaspguard.scan.repository.VulnerabilityRepository;
import com.owaspguard.user.User;
import com.owaspguard.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for dashboard analytics.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ScanRepository scanRepository;
    private final VulnerabilityRepository vulnerabilityRepository;
    private final UserRepository userRepository;
    private final DashboardMapper dashboardMapper;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        User user = getCurrentUser();
        long totalScans = scanRepository.countByUser(user);
        long totalVulnerabilities = vulnerabilityRepository.countByScanUser(user);
        Map<String, Long> severityCounts = getSeverityCountsMap(user);
        return dashboardMapper.toSummaryResponse(totalScans, totalVulnerabilities, severityCounts);
    }

    @Transactional(readOnly = true)
    public SeverityDistributionResponse getSeverityDistribution() {
        User user = getCurrentUser();
        Map<String, Long> severityCounts = getSeverityCountsMap(user);
        return dashboardMapper.toDistributionResponse(severityCounts);
    }

    @Transactional(readOnly = true)
    public List<RecentScanResponse> getRecentScans() {
        User user = getCurrentUser();
        List<ScanEntity> recentScans = scanRepository.findTop5ByUserOrderByStartedAtDesc(user);
        return dashboardMapper.toRecentScanResponseList(recentScans);
    }

    private Map<String, Long> getSeverityCountsMap(User user) {
        List<Object[]> rawCounts = vulnerabilityRepository.countSeveritiesByUser(user);
        Map<String, Long> countsMap = new HashMap<>();
        for (Object[] row : rawCounts) {
            if (row[0] != null) {
                String severity = ((String) row[0]).toUpperCase();
                Long count = (Long) row[1];
                countsMap.put(severity, count);
            }
        }
        return countsMap;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
