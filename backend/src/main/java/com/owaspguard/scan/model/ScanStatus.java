package com.owaspguard.scan.model;

/**
 * Enumeration representing the current lifecycle status of a security scan.
 */
public enum ScanStatus {
    QUEUED,
    RUNNING,
    COMPLETED,
    FAILED,
    CANCELLED
}
