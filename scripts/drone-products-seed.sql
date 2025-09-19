-- Drone-specific data seed for AeroHive e-commerce platform

-- Clear existing sample data and insert drone categories
DELETE FROM products;
DELETE FROM categories;

-- Insert drone categories
INSERT INTO categories (name, description, slug, image_url, created_at, updated_at) VALUES
('Racing Drones', 'High-speed racing drones for professional pilots and racing enthusiasts', 'racing-drones', '/placeholder.svg?height=200&width=300&text=Racing+Drones', NOW(), NOW()),
('Photography Drones', 'Professional photography and videography drones with advanced cameras', 'photography-drones', '/placeholder.svg?height=200&width=300&text=Photography+Drones', NOW(), NOW()),
('Surveillance Drones', 'Security and surveillance drones for professional monitoring', 'surveillance-drones', '/placeholder.svg?height=200&width=300&text=Surveillance+Drones', NOW(), NOW()),
('Agricultural Drones', 'Specialized drones for farming and agricultural applications', 'agricultural-drones', '/placeholder.svg?height=200&width=300&text=Agricultural+Drones', NOW(), NOW()),
('Delivery Drones', 'Commercial delivery drones for logistics and transportation', 'delivery-drones', '/placeholder.svg?height=200&width=300&text=Delivery+Drones', NOW(), NOW()),
('Industrial Drones', 'Heavy-duty industrial drones for inspection and maintenance', 'industrial-drones', '/placeholder.svg?height=200&width=300&text=Industrial+Drones', NOW(), NOW());

-- Insert featured drone products
INSERT INTO products (
    name, description, short_description, price, compare_price, sku, 
    stock_quantity, category_id, image_url, is_featured, slug, 
    is_active, specifications, created_at, updated_at
) VALUES 

-- Racing Drones
('AeroX Pro 4K Racing Drone', 
'The AeroX Pro 4K is the ultimate racing drone for professional pilots and enthusiasts. Built with carbon fiber construction and equipped with a high-performance flight controller, this drone delivers unmatched speed and agility while maintaining professional-grade video recording capabilities. Features GPS Auto-Return, Obstacle Avoidance, Racing Mode, Sport Mode, and Emergency Landing capabilities.', 
'Ultimate racing drone with 4K camera and carbon fiber construction', 
746.99, 912.99, 'AEROX-PRO-4K-001', 25, 1, '/placeholder.svg?height=400&width=400&text=AeroX+Racing+Drone', true, 'aerox-pro-4k-racing-drone', true,
'{
  "flightTime": "25 minutes",
  "maxSpeed": "120 km/h", 
  "cameraResolution": "4K Ultra HD",
  "range": "8 km",
  "batteryCapacity": "5000mAh",
  "weight": "1.2 kg",
  "dimensions": "350mm x 350mm x 120mm",
  "maxAltitude": "6000m",
  "windResistance": "Level 6 (10.8-13.8 m/s)",
  "chargingTime": "90 minutes"
}', NOW(), NOW()),

('VelocityX Racing Beast', 
'Professional racing drone designed for competitive FPV racing. Ultra-lightweight carbon fiber frame with advanced flight controller and high-speed motors. Built for speed and precision with customizable racing modes and real-time telemetry.',
'Professional FPV racing drone with ultra-lightweight design',
599.99, 749.99, 'VELOX-BEAST-002', 30, 1, '/placeholder.svg?height=400&width=400&text=VelocityX+Beast', true, 'velocityx-racing-beast', true,
'{
  "flightTime": "18 minutes",
  "maxSpeed": "150 km/h",
  "cameraResolution": "1080p FPV",
  "range": "5 km",
  "batteryCapacity": "4000mAh", 
  "weight": "0.8 kg",
  "dimensions": "280mm x 280mm x 90mm",
  "maxAltitude": "5000m",
  "windResistance": "Level 5 (8.0-10.7 m/s)",
  "chargingTime": "60 minutes"
}', NOW(), NOW()),

-- Photography Drones  
('SkyCapture Pro Photography Drone',
'The SkyCapture Pro is designed for professional photographers and videographers who demand the highest quality aerial footage. With its advanced 6K camera and precision gimbal, capture stunning cinematic content with ease. Features Gimbal Stabilization, RAW Photo, HDR Video, Follow Me Mode, Active Track, and Manual Camera Controls.',
'Professional 6K photography drone with precision gimbal',
1078.99, 1244.99, 'SKYCAP-PRO-003', 18, 2, '/placeholder.svg?height=400&width=400&text=SkyCapture+Photography', true, 'skycapture-pro-photography-drone', true,
'{
  "flightTime": "35 minutes",
  "maxSpeed": "65 km/h",
  "cameraResolution": "6K Cinematic", 
  "range": "15 km",
  "batteryCapacity": "6500mAh",
  "weight": "1.8 kg",
  "dimensions": "380mm x 380mm x 140mm",
  "maxAltitude": "7000m",
  "windResistance": "Level 7 (13.9-17.1 m/s)",
  "chargingTime": "120 minutes"
}', NOW(), NOW()),

('CineMaster 8K Elite',
'Hollywood-grade cinematography drone with 8K camera, professional-grade gimbal stabilization, and advanced flight modes. Perfect for commercial film production, real estate photography, and premium content creation.',
'Hollywood-grade 8K cinematography drone',
2199.99, 2599.99, 'CINE-8K-ELITE-004', 12, 2, '/placeholder.svg?height=400&width=400&text=CineMaster+8K', false, 'cinemaster-8k-elite', true,
'{
  "flightTime": "42 minutes",
  "maxSpeed": "70 km/h",
  "cameraResolution": "8K Cinema",
  "range": "20 km", 
  "batteryCapacity": "8000mAh",
  "weight": "2.4 kg",
  "dimensions": "420mm x 420mm x 160mm",
  "maxAltitude": "8000m",
  "windResistance": "Level 8 (17.2-20.7 m/s)",
  "chargingTime": "150 minutes"
}', NOW(), NOW()),

-- Surveillance Drones
('GuardEye Surveillance Drone',
'Advanced surveillance drone with thermal imaging, night vision, and long-range capabilities. Designed for security professionals, law enforcement, and private security applications. Features encrypted data transmission and advanced AI object detection.',
'Professional surveillance drone with thermal imaging and night vision',
1825.99, 2074.99, 'GUARD-EYE-005', 15, 3, '/placeholder.svg?height=400&width=400&text=GuardEye+Surveillance', true, 'guardeye-surveillance-drone', true,
'{
  "flightTime": "60 minutes",
  "maxSpeed": "80 km/h",
  "cameraResolution": "4K + Thermal",
  "range": "25 km",
  "batteryCapacity": "10000mAh",
  "weight": "2.8 kg", 
  "dimensions": "450mm x 450mm x 180mm",
  "maxAltitude": "10000m",
  "windResistance": "Level 8 (17.2-20.7 m/s)",
  "chargingTime": "180 minutes"
}', NOW(), NOW()),

-- Agricultural Drones
('FarmWing Agricultural Drone',
'Specialized agricultural drone for crop monitoring, precision spraying, and field analysis. Equipped with multispectral cameras, GPS mapping, and automated flight patterns for efficient farming operations.',
'Agricultural drone for crop monitoring and precision farming',
3499.99, 3999.99, 'FARM-WING-006', 8, 4, '/placeholder.svg?height=400&width=400&text=FarmWing+Agricultural', false, 'farmwing-agricultural-drone', true,
'{
  "flightTime": "45 minutes",
  "maxSpeed": "50 km/h",
  "cameraResolution": "Multispectral + 4K",
  "range": "12 km",
  "batteryCapacity": "12000mAh",
  "weight": "5.2 kg",
  "dimensions": "1200mm x 1200mm x 200mm",
  "maxAltitude": "5000m",
  "windResistance": "Level 6 (10.8-13.8 m/s)",
  "chargingTime": "240 minutes"
}', NOW(), NOW()),

-- Industrial Drones
('TitanWork Industrial Drone',
'Heavy-duty industrial drone for infrastructure inspection, construction monitoring, and maintenance operations. Built with rugged design, advanced sensors, and long-range capabilities for professional applications.',
'Heavy-duty industrial drone for professional inspections',
4299.99, 4899.99, 'TITAN-WORK-007', 6, 6, '/placeholder.svg?height=400&width=400&text=TitanWork+Industrial', false, 'titanwork-industrial-drone', true,
'{
  "flightTime": "55 minutes",
  "maxSpeed": "60 km/h",
  "cameraResolution": "4K + LiDAR",
  "range": "30 km",
  "batteryCapacity": "15000mAh",
  "weight": "6.8 kg",
  "dimensions": "800mm x 800mm x 250mm",
  "maxAltitude": "8000m",
  "windResistance": "Level 9 (20.8-24.4 m/s)",
  "chargingTime": "300 minutes"
}', NOW(), NOW()),

-- Entry-level drone
('SkyStarter Beginner Drone',
'Perfect entry-level drone for beginners and hobbyists. Easy to fly with intuitive controls, built-in safety features, and HD camera for capturing your first aerial photos and videos.',
'Entry-level drone perfect for beginners',
199.99, 249.99, 'SKY-START-008', 50, 2, '/placeholder.svg?height=400&width=400&text=SkyStarter+Beginner', false, 'skystarter-beginner-drone', true,
'{
  "flightTime": "20 minutes",
  "maxSpeed": "30 km/h",
  "cameraResolution": "1080p HD",
  "range": "2 km",
  "batteryCapacity": "2500mAh",
  "weight": "0.6 kg",
  "dimensions": "240mm x 240mm x 80mm",
  "maxAltitude": "3000m",
  "windResistance": "Level 4 (5.5-7.9 m/s)",
  "chargingTime": "90 minutes"
}', NOW(), NOW());

-- Insert sample admin user (if not exists)
INSERT INTO users (email, password_hash, first_name, last_name, is_admin, created_at, updated_at) 
SELECT 'admin1@gmail.com', '$2a$12$NcKVl4lOUQKy5YzQyLQ0ZOQm95qN6qiQx8yvgQO.Gz0FbdVQ.KJhG', 'Admin', 'User', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin1@gmail.com');

-- Update existing admin if exists  
UPDATE users 
SET password_hash = '$2a$12$NcKVl4lOUQKy5YzQyLQ0ZOQm95qN6qiQx8yvgQO.Gz0FbdVQ.KJhG',
    first_name = 'Admin',
    last_name = 'User',
    is_admin = true,
    updated_at = NOW()
WHERE email = 'admin1@gmail.com';

-- Insert some sample coupons for drone products
INSERT INTO coupons (code, type, value, minimum_amount, usage_limit, starts_at, expires_at, created_at, updated_at) VALUES
('DRONE20', 'percentage', 20.00, 500.00, 100, NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
('FIRSTFLIGHT', 'fixed', 50.00, 200.00, 200, NOW(), NOW() + INTERVAL '60 days', NOW(), NOW()),
('PROFESSIONAL', 'percentage', 15.00, 1000.00, 50, NOW(), NOW() + INTERVAL '45 days', NOW(), NOW());