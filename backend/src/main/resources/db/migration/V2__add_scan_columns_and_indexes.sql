-- Add columns for progress, error tracking, and ZAP integration
ALTER TABLE scans ADD COLUMN progress INT NOT NULL DEFAULT 0;
ALTER TABLE scans ADD COLUMN error_log TEXT NULL;
ALTER TABLE scans ADD COLUMN zap_scan_id VARCHAR(100) NULL;

-- Database Performance Indexes for Foreign Keys
CREATE INDEX idx_scans_user ON scans(user_id);
CREATE INDEX idx_vulnerabilities_scan ON vulnerabilities(scan_id);
