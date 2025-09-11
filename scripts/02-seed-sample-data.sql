-- Sample data for testing the e-commerce application

-- Insert sample categories
INSERT INTO categories (name, description, slug, image_url) VALUES
('Electronics', 'Latest electronic gadgets and devices', 'electronics', '/placeholder.svg?height=200&width=300'),
('Clothing', 'Fashion and apparel for all occasions', 'clothing', '/placeholder.svg?height=200&width=300'),
('Home & Garden', 'Everything for your home and garden', 'home-garden', '/placeholder.svg?height=200&width=300'),
('Books', 'Books across all genres and topics', 'books', '/placeholder.svg?height=200&width=300'),
('Sports', 'Sports equipment and fitness gear', 'sports', '/placeholder.svg?height=200&width=300');

-- Insert sample products
INSERT INTO products (name, description, short_description, price, compare_price, sku, stock_quantity, category_id, image_url, is_featured, slug) VALUES
('Wireless Bluetooth Headphones', 'Premium quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.', 'Premium wireless headphones with noise cancellation', 199.99, 249.99, 'WBH-001', 50, 1, '/placeholder.svg?height=400&width=400', true, 'wireless-bluetooth-headphones'),
('Smart Fitness Watch', 'Advanced fitness tracking with heart rate monitor, GPS, and smartphone connectivity. Track your health 24/7.', 'Advanced fitness tracking smartwatch', 299.99, 399.99, 'SFW-002', 30, 1, '/placeholder.svg?height=400&width=400', true, 'smart-fitness-watch'),
('Organic Cotton T-Shirt', 'Comfortable and sustainable organic cotton t-shirt available in multiple colors. Perfect for everyday wear.', 'Comfortable organic cotton t-shirt', 29.99, 39.99, 'OCT-003', 100, 2, '/placeholder.svg?height=400&width=400', false, 'organic-cotton-t-shirt'),
('Premium Coffee Maker', 'Professional-grade coffee maker with programmable settings and thermal carafe. Brew the perfect cup every time.', 'Professional-grade programmable coffee maker', 149.99, 199.99, 'PCM-004', 25, 3, '/placeholder.svg?height=400&width=400', true, 'premium-coffee-maker'),
('JavaScript Programming Guide', 'Comprehensive guide to modern JavaScript programming with practical examples and best practices.', 'Complete JavaScript programming guide', 49.99, 59.99, 'JPG-005', 75, 4, '/placeholder.svg?height=400&width=400', false, 'javascript-programming-guide'),
('Yoga Mat Pro', 'Professional-grade yoga mat with superior grip and cushioning. Perfect for all types of yoga and exercise.', 'Professional yoga mat with superior grip', 79.99, 99.99, 'YMP-006', 40, 5, '/placeholder.svg?height=400&width=400', false, 'yoga-mat-pro');

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, is_admin) VALUES
('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfG', 'Admin', 'User', true);

-- Insert sample regular user (password: user123)
INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES
('user@example.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', '+1234567890');

-- Insert sample coupons
INSERT INTO coupons (code, type, value, minimum_amount, usage_limit, starts_at, expires_at) VALUES
('WELCOME10', 'percentage', 10.00, 50.00, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'),
('SAVE20', 'fixed', 20.00, 100.00, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '14 days');
