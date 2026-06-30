-- Elijays does not sell shoes — remove category tree and linked catalog/sales data.

WITH RECURSIVE shoe_tree AS (
    SELECT id FROM categories WHERE slug = 'shoes'
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN shoe_tree st ON c.parent_id = st.id
),
shoe_products AS (
    SELECT id FROM products WHERE category_id IN (SELECT id FROM shoe_tree)
),
shoe_variants AS (
    SELECT pv.id FROM product_variants pv
    WHERE pv.product_id IN (SELECT id FROM shoe_products)
)
DELETE FROM sales_transactions
WHERE product_variant_id IN (SELECT id FROM shoe_variants);

WITH RECURSIVE shoe_tree AS (
    SELECT id FROM categories WHERE slug = 'shoes'
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN shoe_tree st ON c.parent_id = st.id
),
shoe_products AS (
    SELECT id FROM products WHERE category_id IN (SELECT id FROM shoe_tree)
),
shoe_variants AS (
    SELECT pv.id FROM product_variants pv
    WHERE pv.product_id IN (SELECT id FROM shoe_products)
)
DELETE FROM stock_movements
WHERE product_variant_id IN (SELECT id FROM shoe_variants);

WITH RECURSIVE shoe_tree AS (
    SELECT id FROM categories WHERE slug = 'shoes'
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN shoe_tree st ON c.parent_id = st.id
),
shoe_products AS (
    SELECT id FROM products WHERE category_id IN (SELECT id FROM shoe_tree)
),
shoe_variants AS (
    SELECT pv.id FROM product_variants pv
    WHERE pv.product_id IN (SELECT id FROM shoe_products)
)
DELETE FROM daily_stock_snapshots
WHERE product_variant_id IN (SELECT id FROM shoe_variants);

WITH RECURSIVE shoe_tree AS (
    SELECT id FROM categories WHERE slug = 'shoes'
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN shoe_tree st ON c.parent_id = st.id
),
shoe_products AS (
    SELECT id FROM products WHERE category_id IN (SELECT id FROM shoe_tree)
),
shoe_variants AS (
    SELECT pv.id FROM product_variants pv
    WHERE pv.product_id IN (SELECT id FROM shoe_products)
)
DELETE FROM inventory
WHERE product_variant_id IN (SELECT id FROM shoe_variants);

WITH RECURSIVE shoe_tree AS (
    SELECT id FROM categories WHERE slug = 'shoes'
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN shoe_tree st ON c.parent_id = st.id
),
shoe_products AS (
    SELECT id FROM products WHERE category_id IN (SELECT id FROM shoe_tree)
)
DELETE FROM shop_product_prices
WHERE product_id IN (SELECT id FROM shoe_products);

WITH RECURSIVE shoe_tree AS (
    SELECT id FROM categories WHERE slug = 'shoes'
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN shoe_tree st ON c.parent_id = st.id
),
shoe_products AS (
    SELECT id FROM products WHERE category_id IN (SELECT id FROM shoe_tree)
)
DELETE FROM product_variants
WHERE product_id IN (SELECT id FROM shoe_products);

WITH RECURSIVE shoe_tree AS (
    SELECT id FROM categories WHERE slug = 'shoes'
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN shoe_tree st ON c.parent_id = st.id
)
DELETE FROM products
WHERE category_id IN (SELECT id FROM shoe_tree);

DELETE FROM categories
WHERE parent_id IN (SELECT id FROM categories WHERE slug = 'shoes');

DELETE FROM categories WHERE slug = 'shoes';
