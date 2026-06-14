package com.owaspguard.report;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.owaspguard.common.exception.AccessDeniedException;
import com.owaspguard.common.exception.ResourceNotFoundException;
import com.owaspguard.scan.entity.ScanEntity;
import com.owaspguard.scan.entity.VulnerabilityEntity;
import com.owaspguard.scan.repository.ScanRepository;
import com.owaspguard.scan.repository.VulnerabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for generating security reports in TXT and PDF formats.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ScanRepository scanRepository;
    private final VulnerabilityRepository vulnerabilityRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional(readOnly = true)
    public String generateTextReport(Long scanId) {
        ScanEntity scan = validateAndGetScan(scanId);
        List<VulnerabilityEntity> vulnerabilities = vulnerabilityRepository.findByScanId(scanId);

        long total = vulnerabilities.size();
        long high = vulnerabilities.stream().filter(v -> "HIGH".equalsIgnoreCase(v.getSeverity())).count();
        long medium = vulnerabilities.stream().filter(v -> "MEDIUM".equalsIgnoreCase(v.getSeverity())).count();
        long low = vulnerabilities.stream().filter(v -> "LOW".equalsIgnoreCase(v.getSeverity())).count();
        long info = vulnerabilities.stream().filter(v -> "INFO".equalsIgnoreCase(v.getSeverity())).count();

        StringBuilder sb = new StringBuilder();
        sb.append("=====================================================\n");
        sb.append("OWASP GUARD SECURITY SCAN REPORT\n");
        sb.append("=====================================================\n\n");

        sb.append("## SCAN METADATA\n");
        sb.append("Scan ID:        ").append(scan.getId()).append("\n");
        sb.append("Target URL:     ").append(scan.getTargetUrl()).append("\n");
        sb.append("Scan Type:      ").append(scan.getScanType()).append("\n");
        sb.append("Status:         ").append(scan.getStatus()).append("\n");
        sb.append("Progress:       ").append(scan.getProgress()).append("%\n");
        sb.append("Started At:     ").append(scan.getStartedAt() != null ? scan.getStartedAt().format(DATE_FORMATTER) : "N/A").append("\n");
        sb.append("Completed At:   ").append(scan.getCompletedAt() != null ? scan.getCompletedAt().format(DATE_FORMATTER) : "N/A").append("\n\n");

        sb.append("## VULNERABILITY STATISTICS\n");
        sb.append("Total Findings: ").append(total).append("\n");
        sb.append("  - High:       ").append(high).append("\n");
        sb.append("  - Medium:     ").append(medium).append("\n");
        sb.append("  - Low:        ").append(low).append("\n");
        sb.append("  - Info:       ").append(info).append("\n\n");

        sb.append("=====================================================\n");
        sb.append("## DETAILED FINDINGS\n");
        sb.append("=====================================================\n\n");

        if (vulnerabilities.isEmpty()) {
            sb.append("No vulnerabilities were detected for this scan.\n\n");
        } else {
            for (int i = 0; i < vulnerabilities.size(); i++) {
                VulnerabilityEntity v = vulnerabilities.get(i);
                sb.append(i + 1).append(". ").append(v.getName()).append("\n");
                sb.append("   Severity:       ").append(v.getSeverity()).append("\n");
                sb.append("   OWASP Category: ").append(v.getOwaspCategory() != null && !v.getOwaspCategory().isBlank() ? v.getOwaspCategory() : "N/A").append("\n");
                sb.append("   Description:\n");
                sb.append("     ").append(v.getDescription() != null ? v.getDescription().replace("\n", "\n     ") : "").append("\n");
                sb.append("   Recommendation/Solution:\n");
                sb.append("     ").append(v.getSolution() != null && !v.getSolution().isBlank() ? v.getSolution().replace("\n", "\n     ") : "No solution provided.").append("\n");
                if (v.getReference() != null && !v.getReference().isBlank()) {
                    sb.append("   References:\n");
                    sb.append("     ").append(v.getReference().replace("\n", "\n     ")).append("\n");
                }
                sb.append("-----------------------------------------------------\n\n");
            }
        }

        sb.append("=====================================================\n");
        sb.append("## RECOMMENDATIONS SUMMARY\n");
        sb.append("=====================================================\n\n");

        Set<String> uniqueSolutions = vulnerabilities.stream()
                .map(VulnerabilityEntity::getSolution)
                .filter(sol -> sol != null && !sol.isBlank())
                .collect(Collectors.toSet());

        if (uniqueSolutions.isEmpty()) {
            sb.append("No recommendations/remediations are necessary.\n");
        } else {
            int index = 1;
            for (String solution : uniqueSolutions) {
                sb.append(index++).append(". ").append(solution.trim()).append("\n\n");
            }
        }

        sb.append("=====================================================\n");
        sb.append("END OF REPORT\n");
        sb.append("=====================================================\n");

        return sb.toString();
    }

    @Transactional(readOnly = true)
    public byte[] generatePdfReport(Long scanId) {
        ScanEntity scan = validateAndGetScan(scanId);
        List<VulnerabilityEntity> vulnerabilities = vulnerabilityRepository.findByScanId(scanId);

        long total = vulnerabilities.size();
        long high = vulnerabilities.stream().filter(v -> "HIGH".equalsIgnoreCase(v.getSeverity())).count();
        long medium = vulnerabilities.stream().filter(v -> "MEDIUM".equalsIgnoreCase(v.getSeverity())).count();
        long low = vulnerabilities.stream().filter(v -> "LOW".equalsIgnoreCase(v.getSeverity())).count();
        long info = vulnerabilities.stream().filter(v -> "INFO".equalsIgnoreCase(v.getSeverity())).count();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 54);
            PdfWriter.getInstance(document, baos);

            document.open();

            // Colors
            Color primaryColor = new Color(30, 41, 59);   // Slate 800
            Color accentColor = new Color(59, 130, 246);  // Blue 500
            Color textDark = new Color(15, 23, 42);       // Slate 900
            Color bgLight = new Color(241, 245, 249);     // Slate 100

            // Title Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, primaryColor);
            Paragraph title = new Paragraph("OWASP GUARD Security Report", titleFont);
            title.setAlignment(Element.ALIGN_LEFT);
            document.add(title);

            // Subtitle
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Paragraph subtitle = new Paragraph("Automated Security Scan Findings & Remediation Guide", subtitleFont);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Horizontal Line
            Paragraph line = new Paragraph();
            line.add(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(1f, 100, accentColor, Element.ALIGN_CENTER, -2)));
            line.setSpacingAfter(20);
            document.add(line);

            // Section: Scan Info
            Font sectionHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, primaryColor);
            Paragraph scanInfoTitle = new Paragraph("Scan Information", sectionHeaderFont);
            scanInfoTitle.setSpacingAfter(10);
            document.add(scanInfoTitle);

            // Table of Scan Metadata
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setWidths(new float[]{1.5f, 3.5f});
            metaTable.setSpacingAfter(20);

            addMetaRow(metaTable, "Scan ID", String.valueOf(scan.getId()), bgLight, textDark);
            addMetaRow(metaTable, "Target URL", scan.getTargetUrl(), Color.WHITE, textDark);
            addMetaRow(metaTable, "Scan Type", String.valueOf(scan.getScanType()), bgLight, textDark);
            addMetaRow(metaTable, "Status", String.valueOf(scan.getStatus()), Color.WHITE, textDark);
            addMetaRow(metaTable, "Progress", scan.getProgress() + "%", bgLight, textDark);
            addMetaRow(metaTable, "Scan Started", scan.getStartedAt() != null ? scan.getStartedAt().format(DATE_FORMATTER) : "N/A", Color.WHITE, textDark);
            addMetaRow(metaTable, "Scan Completed", scan.getCompletedAt() != null ? scan.getCompletedAt().format(DATE_FORMATTER) : "N/A", bgLight, textDark);

            document.add(metaTable);

            // Section: Vulnerability Statistics
            Paragraph statsTitle = new Paragraph("Findings Statistics", sectionHeaderFont);
            statsTitle.setSpacingAfter(10);
            document.add(statsTitle);

            PdfPTable statsTable = new PdfPTable(4);
            statsTable.setWidthPercentage(100);
            statsTable.setSpacingAfter(25);

            addStatsCell(statsTable, "HIGH", String.valueOf(high), new Color(239, 68, 68), Color.WHITE);
            addStatsCell(statsTable, "MEDIUM", String.valueOf(medium), new Color(245, 158, 11), Color.WHITE);
            addStatsCell(statsTable, "LOW", String.valueOf(low), new Color(34, 197, 94), Color.WHITE);
            addStatsCell(statsTable, "INFO", String.valueOf(info), new Color(99, 102, 241), Color.WHITE);

            document.add(statsTable);

            // Section: Detailed Findings Table
            Paragraph findingsTitle = new Paragraph("Detailed Findings", sectionHeaderFont);
            findingsTitle.setSpacingAfter(10);
            document.add(findingsTitle);

            if (vulnerabilities.isEmpty()) {
                Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, textDark);
                Paragraph noFindings = new Paragraph("No security vulnerabilities were detected on the target server.", normalFont);
                noFindings.setSpacingAfter(20);
                document.add(noFindings);
            } else {
                PdfPTable findingsTable = new PdfPTable(4);
                findingsTable.setWidthPercentage(100);
                findingsTable.setWidths(new float[]{3.5f, 1f, 2f, 3.5f});
                findingsTable.setSpacingAfter(20);

                addTableHeader(findingsTable, "Vulnerability Name", primaryColor);
                addTableHeader(findingsTable, "Severity", primaryColor);
                addTableHeader(findingsTable, "OWASP Category", primaryColor);
                addTableHeader(findingsTable, "Recommendation / Solution", primaryColor);

                for (VulnerabilityEntity v : vulnerabilities) {
                    findingsTable.addCell(v.getName());
                    findingsTable.addCell(v.getSeverity());
                    findingsTable.addCell(v.getOwaspCategory() != null && !v.getOwaspCategory().isBlank() ? v.getOwaspCategory() : "N/A");
                    findingsTable.addCell(v.getSolution() != null && !v.getSolution().isBlank() ? v.getSolution() : "No solution provided.");
                }
                document.add(findingsTable);
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private void addMetaRow(PdfPTable table, String field, String value, Color bgColor, Color textColor) {
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, textColor);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, textColor);

        PdfPCell cell1 = new PdfPCell(new Phrase(field, boldFont));
        cell1.setBackgroundColor(bgColor);
        cell1.setPadding(6);
        cell1.setBorderColor(Color.LIGHT_GRAY);

        PdfPCell cell2 = new PdfPCell(new Phrase(value != null ? value : "", normalFont));
        cell2.setBackgroundColor(bgColor);
        cell2.setPadding(6);
        cell2.setBorderColor(Color.LIGHT_GRAY);

        table.addCell(cell1);
        table.addCell(cell2);
    }

    private void addStatsCell(PdfPTable table, String label, String value, Color bgColor, Color textColor) {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, textColor);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, textColor);

        Paragraph cellContent = new Paragraph();
        cellContent.add(new Phrase(label + "\n", labelFont));
        cellContent.add(new Phrase(value, valueFont));
        cellContent.setAlignment(Element.ALIGN_CENTER);

        PdfPCell cell = new PdfPCell(cellContent);
        cell.setBackgroundColor(bgColor);
        cell.setPadding(10);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorderColor(Color.WHITE);

        table.addCell(cell);
    }

    private void addTableHeader(PdfPTable table, String headerTitle, Color bgColor) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
        PdfPCell header = new PdfPCell(new Phrase(headerTitle, headerFont));
        header.setBackgroundColor(bgColor);
        header.setBorderWidth(1);
        header.setBorderColor(Color.WHITE);
        header.setPadding(8);
        table.addCell(header);
    }

    private ScanEntity validateAndGetScan(Long scanId) {
        ScanEntity scan = scanRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException("Scan not found with ID: " + scanId));

        String authenticatedEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!scan.getUser().getEmail().equals(authenticatedEmail)) {
            throw new AccessDeniedException("Unauthorized: You do not have permission to access this report");
        }

        return scan;
    }
}
