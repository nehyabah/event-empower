ALTER TABLE vendor_services
  ADD COLUMN price_min DECIMAL(12, 2),
  ADD COLUMN price_max DECIMAL(12, 2);

-- Migrate existing price data to price_min
UPDATE vendor_services SET price_min = price WHERE price IS NOT NULL;
