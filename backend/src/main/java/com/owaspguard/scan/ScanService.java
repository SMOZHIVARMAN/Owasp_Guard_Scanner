package com.owaspguard.scan;

import com.owaspguard.common.exception.AccessDeniedException;
import com.owaspguard.common.exception.ResourceNotFoundException;
import com.owaspguard.scan.client.ZapScanClient;
import com.owaspguard.scan.dto.*;
import com.owaspguard.scan.entity.ScanEntity;
import com.owaspguard.scan.entity.VulnerabilityEntity;
import com.owaspguard.scan.model.ScanStatus;
import com.owaspguard.scan.model.ScanType;
import com.owaspguard.scan.repository.ScanRepository;
import com.owaspguard.scan.repository.VulnerabilityRepository;
import com.owaspguard.scan.validation.UrlValidatorService;
import com.owaspguard.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service orchestrating the OWASP ZAP scanning lifecycle.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ScanService {

    private final ScanRepository scanRepository;
    private final VulnerabilityRepository vulnerabilityRepository;
    private final ZapScanClient zapScanClient;
    private final UrlValidatorService urlValidatorService;
    private final ScanMapper scanMapper;

    /**
     * Start a new security scan for the user.
     */
    @Transactional
    public ScanResponse startScan(StartScanRequest request, User user) {
        if (!urlValidatorService.isValidUrl(request.getTargetUrl())) {
            throw new IllegalArgumentException("Target URL is invalid or resolved to a restricted internal IP address");
        }

        ScanEntity scan = ScanEntity.builder()
                .user(user)
                .targetUrl(request.getTargetUrl())
                .status(ScanStatus.QUEUED)
                .scanType(request.getScanType())
                .progress(0)
                .build();

        ScanEntity savedScan = scanRepository.save(scan);

        // Async execution of ZAP scan
        executeScanAsync(savedScan.getId());

        return ScanResponse.builder()
                .scanId(savedScan.getId())
                .targetUrl(savedScan.getTargetUrl())
                .status(savedScan.getStatus())
                .startedAt(savedScan.getStartedAt())
                .build();
    }

    /**
     * Fetch a scan by ID, ensuring user ownership.
     */
    public ScanEntity getScanById(Long scanId, User user) {
        ScanEntity scan = scanRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException("Scan not found with ID: " + scanId));

        if (!scan.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to access this scan");
        }
        return scan;
    }

    /**
     * Fetch all scans belonging to the user with pagination.
     */
    public Page<ScanSummaryResponse> getUserScans(User user, Pageable pageable) {
        Page<ScanEntity> scans = scanRepository.findByUser(user, pageable);
        return scans.map(scan -> {
            long vulnerabilityCount = vulnerabilityRepository.countByScanId(scan.getId());
            return scanMapper.toSummaryResponse(scan, vulnerabilityCount);
        });
    }

    /**
     * Fetch complete scan details by ID, validating ownership.
     */
    public ScanDetailResponse getScanDetails(Long scanId, User user) {
        ScanEntity scan = getScanById(scanId, user);
        long vulnerabilityCount = vulnerabilityRepository.countByScanId(scan.getId());
        return scanMapper.toDetailResponse(scan, vulnerabilityCount);
    }

    /**
     * Fetch detailed status of a scan.
     */
    public ScanStatusResponse getScanStatus(Long scanId, User user) {
        ScanEntity scan = getScanById(scanId, user);
        return ScanStatusResponse.builder()
                .scanId(scan.getId())
                .status(scan.getStatus())
                .progress(scan.getProgress())
                .build();
    }

    /**
     * Fetch vulnerabilities for a scan with pagination, sorting, and optional severity filtering.
     */
    public Page<ScanVulnerabilityResponse> getScanVulnerabilities(Long scanId, String severity, Pageable pageable, User user) {
        ScanEntity scan = getScanById(scanId, user);
        Page<VulnerabilityEntity> vulnerabilityPage;
        if (severity != null && !severity.isBlank()) {
            vulnerabilityPage = vulnerabilityRepository.findByScanIdAndSeverity(scan.getId(), severity.toUpperCase(), pageable);
        } else {
            vulnerabilityPage = vulnerabilityRepository.findByScanId(scan.getId(), pageable);
        }
        return vulnerabilityPage.map(scanMapper::toVulnerabilityResponse);
    }

    /**
     * Asynchronously executes the security scan by coordinating ZAP.
     */
    @Async("scanTaskExecutor")
    public void executeScanAsync(Long scanId) {
        ScanEntity scan = scanRepository.findById(scanId).orElse(null);
        if (scan == null) {
            log.error("Unable to execute scan. ScanEntity with ID {} does not exist", scanId);
            return;
        }

        log.info("Starting asynchronous scan execution for scan ID: {}, Type: {}", scanId, scan.getScanType());
        
        try {
            // 1. Mark scan as RUNNING
            scan.setStatus(ScanStatus.RUNNING);
            scan.setStartedAt(LocalDateTime.now());
            scan.setProgress(0);
            scanRepository.save(scan);

            String targetUrl = scan.getTargetUrl();
            ScanType type = scan.getScanType();

            if (type == ScanType.SPIDER) {
                runSpiderScan(scan, targetUrl);
            } else if (type == ScanType.ACTIVE) {
                runActiveScan(scan, targetUrl, 0, 100);
            } else { // FULL
                runSpiderScan(scan, targetUrl);
                // Reload entity to prevent optimistic locking issues
                scan = scanRepository.findById(scanId).orElseThrow();
                runActiveScan(scan, targetUrl, 50, 50);
            }

            // Reload entity
            scan = scanRepository.findById(scanId).orElseThrow();

            // 2. Fetch ZAP Alerts & save them as VulnerabilityEntity
            log.info("Scan ID {} completed execution. Fetching ZAP alerts...", scanId);
            List<Map<String, Object>> alerts = zapScanClient.getAlerts(targetUrl);
            saveVulnerabilities(scan, alerts);

            // 3. Mark scan as COMPLETED
            scan.setStatus(ScanStatus.COMPLETED);
            scan.setProgress(100);
            scan.setCompletedAt(LocalDateTime.now());
            scanRepository.save(scan);
            log.info("Scan ID {} successfully finished and saved.", scanId);

        } catch (Exception e) {
            log.error("Error occurred during scan ID {} execution: {}", scanId, e.getMessage(), e);
            try {
                // Fetch latest state of entity to avoid stale object updates
                ScanEntity failedScan = scanRepository.findById(scanId).orElse(scan);
                failedScan.setStatus(ScanStatus.FAILED);
                failedScan.setProgress(100);
                failedScan.setCompletedAt(LocalDateTime.now());
                failedScan.setErrorLog(e.getMessage() != null ? e.getMessage() : e.getClass().getName());
                scanRepository.save(failedScan);
            } catch (Exception dbEx) {
                log.error("Failed to persist failed scan state for ID {}", scanId, dbEx);
            }
        }
    }

    private void runSpiderScan(ScanEntity scan, String targetUrl) throws InterruptedException {
        String zapSpiderId = zapScanClient.startSpider(targetUrl);
        scan.setZapScanId(zapSpiderId);
        scanRepository.save(scan);

        int progressWeight = (scan.getScanType() == ScanType.FULL) ? 2 : 1;

        while (true) {
            int spiderProgress = zapScanClient.getSpiderStatus(zapSpiderId);
            int overallProgress = spiderProgress / progressWeight;

            scan.setProgress(overallProgress);
            scanRepository.save(scan);

            log.debug("Scan ID {}: Spider Progress = {}%, Overall = {}%", scan.getId(), spiderProgress, overallProgress);

            if (spiderProgress >= 100) {
                break;
            }
            Thread.sleep(2000);
        }
    }

    private void runActiveScan(ScanEntity scan, String targetUrl, int startOffset, int scaleWeight) throws InterruptedException {
        String zapActiveId = zapScanClient.startActiveScan(targetUrl);
        scan.setZapScanId(zapActiveId);
        scanRepository.save(scan);

        while (true) {
            int activeProgress = zapScanClient.getActiveScanStatus(zapActiveId);
            // Calculate scaled progress: e.g. for FULL scan, it starts at 50% and scales the remaining 50%
            int overallProgress = startOffset + (activeProgress * scaleWeight / 100);

            scan.setProgress(overallProgress);
            scanRepository.save(scan);

            log.debug("Scan ID {}: Active Progress = {}%, Overall = {}%", scan.getId(), activeProgress, overallProgress);

            if (activeProgress >= 100) {
                break;
            }
            Thread.sleep(2000);
        }
    }

    private void saveVulnerabilities(ScanEntity scan, List<Map<String, Object>> alerts) {
        log.info("Mapping and saving {} alerts for Scan ID {}", alerts.size(), scan.getId());
        for (Map<String, Object> alertMap : alerts) {
            try {
                String risk = getMapValue(alertMap, "risk");
                String severity = mapRiskToSeverity(risk);

                VulnerabilityEntity vulnerability = VulnerabilityEntity.builder()
                        .scan(scan)
                        .name(getMapValue(alertMap, "alert"))
                        .description(getMapValue(alertMap, "description"))
                        .severity(severity)
                        .solution(getMapValue(alertMap, "solution"))
                        .reference(getMapValue(alertMap, "reference"))
                        .owaspCategory(getMapValue(alertMap, "wascid")) // Maps category/ID
                        .build();

                vulnerabilityRepository.save(vulnerability);
            } catch (Exception e) {
                log.error("Failed to map/save alert to vulnerability: {}", alertMap, e);
            }
        }
    }

    private String getMapValue(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : "";
    }

    private String mapRiskToSeverity(String risk) {
        if (risk == null) {
            return "INFO";
        }
        switch (risk.trim().toLowerCase()) {
            case "high":
                return "HIGH";
            case "medium":
                return "MEDIUM";
            case "low":
                return "LOW";
            case "informational":
            case "info":
            default:
                return "INFO";
        }
    }
}
