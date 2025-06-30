
-- First, let's check and insert categories only if they don't exist
INSERT INTO categories (name, description) 
SELECT 'Beverages', 'Drinks and liquid refreshments'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Beverages');

INSERT INTO categories (name, description) 
SELECT 'Noodles', 'Instant noodles and pasta products'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Noodles');

INSERT INTO categories (name, description) 
SELECT 'Snacks', 'Chips, crackers, and light snacks'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Snacks');

INSERT INTO categories (name, description) 
SELECT 'Household', 'Cleaning supplies and household items'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Household');

INSERT INTO categories (name, description) 
SELECT 'Canned Goods', 'Preserved and canned food items'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Canned Goods');

-- Now let's add the sample products using individual category lookups
INSERT INTO products (name, unit_price, cost_price, current_stock, minimum_stock, maximum_stock, category_id, description) VALUES
('Coca Cola 8oz', 15.00, 12.00, 24, 10, 100, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Classic Coca Cola 8oz bottle'),
('Coca Cola 12oz', 25.00, 20.00, 18, 10, 100, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Classic Coca Cola 12oz bottle'),
('Coca Cola 1.5L', 65.00, 50.00, 12, 5, 50, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Classic Coca Cola 1.5L bottle'),
('Lucky Me Pancit Canton Original', 18.00, 15.00, 32, 15, 100, (SELECT id FROM categories WHERE name = 'Noodles' LIMIT 1), 'Original flavor instant pancit canton'),
('Lucky Me Pancit Canton Sweet & Spicy', 18.00, 15.00, 28, 15, 100, (SELECT id FROM categories WHERE name = 'Noodles' LIMIT 1), 'Sweet and spicy flavor instant pancit canton'),
('Lucky Me Pancit Canton Chilimansi', 18.00, 15.00, 25, 15, 100, (SELECT id FROM categories WHERE name = 'Noodles' LIMIT 1), 'Chilimansi flavor instant pancit canton'),
('Lucky Me Pancit Canton Kalamansi', 18.00, 15.00, 22, 15, 100, (SELECT id FROM categories WHERE name = 'Noodles' LIMIT 1), 'Kalamansi flavor instant pancit canton'),
('Rebisco Crackers', 25.00, 20.00, 32, 10, 80, (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1), 'Crispy crackers from Rebisco'),
('Tide Detergent Sachet', 8.00, 6.00, 5, 20, 150, (SELECT id FROM categories WHERE name = 'Household' LIMIT 1), 'Single use detergent sachet'),
('Bear Brand Milk', 22.00, 18.00, 16, 12, 80, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Sterilized milk drink'),
('Spam Lite 175g', 85.00, 70.00, 3, 8, 40, (SELECT id FROM categories WHERE name = 'Canned Goods' LIMIT 1), 'Reduced sodium spam 175g can');

-- Add some sample customers for utang functionality
INSERT INTO customers (name, phone, address, credit_limit) VALUES
('Juan Dela Cruz', '09123456789', '123 Main St, Barangay 1', 2000.00),
('Maria Santos', '09987654321', '456 Oak Ave, Barangay 2', 1500.00),
('Pedro Garcia', '09111222333', '789 Pine Rd, Barangay 3', 3000.00);
