-- Add new columns to service_requests
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT '';
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';

-- Rename status 'pending' → 'open' for existing rows
UPDATE service_requests SET status = 'open' WHERE status = 'pending';

-- Geographic index for Haversine distance queries
CREATE INDEX IF NOT EXISTS idx_service_requests_location
  ON service_requests (latitude, longitude)
  WHERE status = 'open';

-- Category index for filtering
CREATE INDEX IF NOT EXISTS idx_service_requests_category
  ON service_requests (category)
  WHERE status = 'open';

-- Composite index for customer listing
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_status
  ON service_requests (customer_id, status);

-- Composite index for provider listing
CREATE INDEX IF NOT EXISTS idx_service_requests_provider_status
  ON service_requests (provider_id, status);
