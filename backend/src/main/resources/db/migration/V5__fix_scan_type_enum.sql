ALTER TABLE scans
    MODIFY COLUMN scan_type ENUM(
    'SPIDER',
    'ACTIVE',
    'FULL'
    ) NOT NULL DEFAULT 'FULL';