-- Per-shop product pricing (same catalog, different prices per location)
CREATE TABLE IF NOT EXISTS shop_product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (shop_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_product_prices_shop ON shop_product_prices(shop_id);
