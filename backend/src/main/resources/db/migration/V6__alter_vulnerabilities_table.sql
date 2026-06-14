-- Non-destructive migration to update vulnerabilities table
ALTER TABLE vulnerabilities ADD COLUMN solution TEXT NULL;
ALTER TABLE vulnerabilities ADD COLUMN reference TEXT NULL;
ALTER TABLE vulnerabilities ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add index on severity for statistical reporting
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);
