
-- Add more beverages
INSERT INTO products (name, unit_price, cost_price, current_stock, minimum_stock, maximum_stock, category_id, description) VALUES
('Sprite 8oz', 15.00, 12.00, 20, 10, 100, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Lemon-lime soda 8oz bottle'),
('Royal 8oz', 12.00, 9.00, 25, 10, 100, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Orange flavored soda 8oz'),
('C2 Green Tea', 25.00, 20.00, 15, 8, 80, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Ready to drink green tea'),
('Zesto Orange', 8.00, 6.00, 30, 15, 120, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Orange juice drink'),
('Nestea Iced Tea', 20.00, 16.00, 18, 10, 80, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Lemon iced tea'),

-- Add more noodle varieties
('Nissin Cup Noodles Beef', 22.00, 18.00, 24, 12, 100, (SELECT id FROM categories WHERE name = 'Noodles' LIMIT 1), 'Instant cup noodles beef flavor'),
('Maggi Magic Sarap Noodles', 15.00, 12.00, 20, 10, 80, (SELECT id FROM categories WHERE name = 'Noodles' LIMIT 1), 'Chicken flavored instant noodles'),
('Payless Pancit Canton', 12.00, 9.00, 35, 15, 100, (SELECT id FROM categories WHERE name = 'Noodles' LIMIT 1), 'Budget pancit canton noodles'),

-- Add snack items
('Piattos Cheese', 35.00, 28.00, 12, 8, 60, (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1), 'Hexagon potato chips cheese flavor'),
('Nova Multigrain', 8.00, 6.00, 40, 20, 150, (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1), 'Multigrain snack'),
('Chippy BBQ', 8.00, 6.00, 35, 20, 150, (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1), 'Corn chips BBQ flavor'),
('Ricoa Flat Tops', 2.00, 1.50, 50, 25, 200, (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1), 'Chocolate wafer'),
('Richeese Nabati', 12.00, 9.00, 28, 15, 100, (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1), 'Cheese flavored snack'),

-- Add more household items
('Ariel Detergent Powder 35g', 12.00, 9.00, 25, 15, 100, (SELECT id FROM categories WHERE name = 'Household' LIMIT 1), 'Laundry detergent powder sachet'),
('Joy Dishwashing Liquid 25ml', 5.00, 3.50, 45, 25, 200, (SELECT id FROM categories WHERE name = 'Household' LIMIT 1), 'Dishwashing liquid sachet'),
('Downy Fabric Conditioner 27ml', 8.00, 6.00, 30, 18, 150, (SELECT id FROM categories WHERE name = 'Household' LIMIT 1), 'Fabric conditioner sachet'),
('Zonrox Bleach 60ml', 15.00, 12.00, 20, 12, 80, (SELECT id FROM categories WHERE name = 'Household' LIMIT 1), 'Chlorine bleach'),

-- Add more canned goods
('CDO Corned Beef 150g', 45.00, 38.00, 15, 8, 50, (SELECT id FROM categories WHERE name = 'Canned Goods' LIMIT 1), 'Corned beef 150g can'),
('Argentina Corned Beef 175g', 55.00, 45.00, 12, 6, 40, (SELECT id FROM categories WHERE name = 'Canned Goods' LIMIT 1), 'Premium corned beef'),
('555 Sardines in Tomato Sauce', 18.00, 15.00, 25, 12, 80, (SELECT id FROM categories WHERE name = 'Canned Goods' LIMIT 1), 'Sardines in tomato sauce'),
('Century Tuna Flakes in Oil', 25.00, 20.00, 18, 10, 60, (SELECT id FROM categories WHERE name = 'Canned Goods' LIMIT 1), 'Tuna flakes in oil'),

-- Add personal care items (create category if it doesn't exist)
('Close Up Toothpaste 40g', 25.00, 20.00, 20, 10, 80, (SELECT id FROM categories WHERE name = 'Personal Care' LIMIT 1), 'Toothpaste travel size'),
('Safeguard Soap 90g', 15.00, 12.00, 30, 15, 100, (SELECT id FROM categories WHERE name = 'Personal Care' LIMIT 1), 'Antibacterial soap'),
('Head & Shoulders Sachet 12ml', 8.00, 6.00, 35, 20, 150, (SELECT id FROM categories WHERE name = 'Personal Care' LIMIT 1), 'Anti-dandruff shampoo sachet'),
('Palmolive Shampoo Sachet 12ml', 6.00, 4.50, 40, 25, 200, (SELECT id FROM categories WHERE name = 'Personal Care' LIMIT 1), 'Shampoo sachet');

-- Insert Personal Care category if it doesn't exist
INSERT INTO categories (name, description) 
SELECT 'Personal Care', 'Personal hygiene and care products'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Personal Care');

-- Update the personal care products to use the correct category ID
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Personal Care' LIMIT 1)
WHERE name IN ('Close Up Toothpaste 40g', 'Safeguard Soap 90g', 'Head & Shoulders Sachet 12ml', 'Palmolive Shampoo Sachet 12ml');

-- Add some sample sales data for dashboard analytics
INSERT INTO sales (total_amount, amount_paid, change_amount, credit_amount, transaction_type, cashier_id, notes, created_at) VALUES
(85.00, 100.00, 15.00, 0.00, 'sale', (SELECT id FROM profiles LIMIT 1), 'Cash sale', NOW() - INTERVAL '1 day'),
(120.50, 120.50, 0.00, 0.00, 'sale', (SELECT id FROM profiles LIMIT 1), 'Exact change', NOW() - INTERVAL '2 days'),
(67.00, 0.00, 0.00, 67.00, 'sale', (SELECT id FROM profiles LIMIT 1), 'Credit sale to Juan', NOW() - INTERVAL '3 days'),
(45.25, 50.00, 4.75, 0.00, 'sale', (SELECT id FROM profiles LIMIT 1), 'Small purchase', NOW() - INTERVAL '4 days'),
(200.00, 0.00, 0.00, 200.00, 'sale', (SELECT id FROM profiles LIMIT 1), 'Large credit purchase', NOW() - INTERVAL '5 days');

-- Add corresponding sale items for the sales above (using existing product IDs)
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
SELECT 
  s.id,
  p.id,
  2,
  p.unit_price,
  p.unit_price * 2
FROM sales s
CROSS JOIN products p
WHERE s.total_amount = 85.00 AND p.name = 'Lucky Me Pancit Canton Original'
LIMIT 1;

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
SELECT 
  s.id,
  p.id,
  1,
  p.unit_price,
  p.unit_price
FROM sales s
CROSS JOIN products p
WHERE s.total_amount = 85.00 AND p.name = 'Spam Lite 175g'
LIMIT 1;

-- Add some credit records for customers
INSERT INTO credits (customer_id, amount, status, due_date, notes, created_at)
SELECT 
  c.id,
  500.00,
  'pending',
  CURRENT_DATE + INTERVAL '30 days',
  'Monthly credit allowance',
  NOW() - INTERVAL '1 week'
FROM customers c
WHERE c.name = 'Juan Dela Cruz'
LIMIT 1;

INSERT INTO credits (customer_id, amount, status, due_date, notes, created_at)
SELECT 
  c.id,
  300.00,
  'pending',
  CURRENT_DATE + INTERVAL '15 days',
  'Grocery credit',
  NOW() - INTERVAL '3 days'
FROM customers c
WHERE c.name = 'Maria Santos'
LIMIT 1;

-- Add some stock movement records
INSERT INTO stock_movements (product_id, movement_type, quantity, notes, created_by, reference_type, created_at)
SELECT 
  p.id,
  'restock',
  50,
  'Weekly restock',
  (SELECT id FROM profiles LIMIT 1),
  'purchase_order',
  NOW() - INTERVAL '2 days'
FROM products p
WHERE p.name = 'Coca Cola 8oz'
LIMIT 1;

INSERT INTO stock_movements (product_id, movement_type, quantity, notes, created_by, reference_type, created_at)
SELECT 
  p.id,
  'sale',
  -2,
  'Sold via POS',
  (SELECT id FROM profiles LIMIT 1),
  'sale',
  NOW() - INTERVAL '1 day'
FROM products p
WHERE p.name = 'Lucky Me Pancit Canton Original'
LIMIT 1;
