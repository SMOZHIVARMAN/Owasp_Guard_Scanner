ALTER TABLE scans
    MODIFY COLUMN status
    ENUM(
    'QUEUED',
    'RUNNING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
    ) NOT NULL;