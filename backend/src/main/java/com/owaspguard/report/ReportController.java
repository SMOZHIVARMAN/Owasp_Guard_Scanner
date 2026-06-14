package com.owaspguard.report;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.nio.charset.StandardCharsets;

/**
 * Controller for handling report download requests.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/{scanId}/txt")
    public ResponseEntity<Resource> downloadTextReport(@PathVariable Long scanId) {
        String reportContent = reportService.generateTextReport(scanId);
        byte[] content = reportContent.getBytes(StandardCharsets.UTF_8);
        ByteArrayResource resource = new ByteArrayResource(content);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=scan-report-" + scanId + ".txt")
                .contentType(MediaType.TEXT_PLAIN)
                .contentLength(content.length)
                .body(resource);
    }

    @GetMapping("/{scanId}/pdf")
    public ResponseEntity<byte[]> downloadPdfReport(@PathVariable Long scanId) {
        byte[] pdfContent = reportService.generatePdfReport(scanId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=scan-report-" + scanId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfContent.length)
                .body(pdfContent);
    }
}
