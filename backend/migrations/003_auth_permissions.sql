-- Permissions + cost tracking for profit analytics
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]';

ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- Demo shops (if not already present)
INSERT INTO shops (name, location, phone)
SELECT 'Elijays — Shop One', 'Westlands, Nairobi', '0721844475'
WHERE NOT EXISTS (SELECT 1 FROM shops WHERE name = 'Elijays — Shop One');

INSERT INTO shops (name, location, phone)
SELECT 'Elijays — Shop Two', 'Nairobi CBD', '0721844475'
WHERE NOT EXISTS (SELECT 1 FROM shops WHERE name = 'Elijays — Shop Two');
