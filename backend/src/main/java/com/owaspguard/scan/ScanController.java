package com.owaspguard.scan;

import com.owaspguard.scan.dto.*;
import com.owaspguard.user.User;
import com.owaspguard.user.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

/**
 * Controller exposing security scan endpoints.
 */
@RestController
@RequestMapping("/api/scans")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ScanController {

    private final ScanService scanService;
    private final UserRepository userRepository;

    /**
     * Start a ZAP security scan.
     */
    @PostMapping("/start")
    public ResponseEntity<ScanResponse> startScan(@Valid @RequestBody StartScanRequest request) {
        User user = getCurrentUser();
        ScanResponse response = scanService.startScan(request, user);
        return ResponseEntity.ok(response);
    }

    /**
     * Fetch all scans belonging to the authenticated user with pagination and sorting.
     */
    @GetMapping("/my-scans")
    public ResponseEntity<Page<ScanSummaryResponse>> getMyScans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        User user = getCurrentUser();
        String sortProperty = "startedAt".equalsIgnoreCase(sortBy) || "createdAt".equalsIgnoreCase(sortBy) ? "startedAt" : sortBy;
        Sort sort = "desc".equalsIgnoreCase(sortDir) ? Sort.by(sortProperty).descending() : Sort.by(sortProperty).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ScanSummaryResponse> response = scanService.getUserScans(user, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Fetch a specific scan by ID. Only accessible by the owner.
     */
    @GetMapping("/{scanId}")
    public ResponseEntity<ScanDetailResponse> getScanById(@PathVariable Long scanId) {
        User user = getCurrentUser();
        ScanDetailResponse response = scanService.getScanDetails(scanId, user);
        return ResponseEntity.ok(response);
    }

    /**
     * Fetch the status and progress of a specific scan. Only accessible by the owner.
     */
    @GetMapping("/{scanId}/status")
    public ResponseEntity<ScanStatusResponse> getScanStatus(@PathVariable Long scanId) {
        User user = getCurrentUser();
        ScanStatusResponse response = scanService.getScanStatus(scanId, user);
        return ResponseEntity.ok(response);
    }

    /**
     * Fetch all vulnerabilities for a specific scan. Only accessible by the owner.
     */
    @GetMapping("/{scanId}/vulnerabilities")
    public ResponseEntity<Page<ScanVulnerabilityResponse>> getScanVulnerabilities(
            @PathVariable Long scanId,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "severity") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        User user = getCurrentUser();
        Sort sort = "desc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ScanVulnerabilityResponse> response = scanService.getScanVulnerabilities(scanId, severity, pageable, user);
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
