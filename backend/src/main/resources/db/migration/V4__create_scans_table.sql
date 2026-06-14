-- Add scan_type column to existing scans table

ALTER TABLE scans
    ADD COLUMN scan_type VARCHAR(50) NOT NULL DEFAULT 'FULL';