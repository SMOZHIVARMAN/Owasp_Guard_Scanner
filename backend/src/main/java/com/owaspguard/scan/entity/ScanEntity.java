package com.owaspguard.scan.entity;



import com.owaspguard.scan.model.ScanStatus;

import com.owaspguard.scan.model.ScanType;

import com.owaspguard.user.User;

import jakarta.persistence.*;

import jakarta.validation.constraints.NotBlank;

import jakarta.validation.constraints.NotNull;

import lombok.*;



import java.time.LocalDateTime;



/**

 * Entity representing a security scan run against a target URL.

 */

@Entity

@Table(

        name = "scans",

        indexes = {

                @Index(name = "idx_scans_user", columnList = "user_id"),

                @Index(name = "idx_scans_status", columnList = "status")

        }

)

@Getter

@Setter

@NoArgsConstructor

@AllArgsConstructor

@Builder

public class ScanEntity {



    @Id

    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;



    @NotNull(message = "User is required")

    @ManyToOne(fetch = FetchType.LAZY)

    @JoinColumn(name = "user_id", nullable = false)

    private User user;



    @NotBlank(message = "Target URL is required")

    @Column(name = "target_url", nullable = false)

    private String targetUrl;



    @NotNull(message = "Scan status is required")

    @Enumerated(EnumType.STRING)

    @Column(name = "status", nullable = false)

    private ScanStatus status;



    @NotNull(message = "Scan type is required")

    @Enumerated(EnumType.STRING)

    @Column(name = "scan_type", nullable = false)

    private ScanType scanType;



    @Column(name = "zap_scan_id")

    private String zapScanId;



    @Column(name = "progress", nullable = false)

    @Builder.Default

    private int progress = 0;



    @Column(name = "error_log", columnDefinition = "TEXT")

    private String errorLog;



    @Column(name = "started_at")

    private LocalDateTime startedAt;



    @Column(name = "completed_at")

    private LocalDateTime completedAt;

}