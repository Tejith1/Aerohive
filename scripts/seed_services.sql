-- Create table for Drone Services (General)
CREATE TABLE IF NOT EXISTS service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL, -- 'drone_service' or 'repair_center' (simplified for bot list)
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
ON service_catalog FOR SELECT
USING (true);

-- Seed Drone Services (List 1)
INSERT INTO service_catalog (title, category, description) VALUES
('Topographic Survey & Mapping', 'drone_service', 'High-precision topographic surveys'),
('Construction Progress Monitoring', 'drone_service', 'Regular aerial documentation'),
('Crop Health Monitoring', 'drone_service', 'Multispectral analysis'),
('Precision Crop Spraying', 'drone_service', 'Automated precision spraying'),
('Real Estate Aerial Photography', 'drone_service', 'Professional aerial photography'),
('Event Aerial Coverage', 'drone_service', 'Comprehensive aerial documentation'),
('Agricultural Drone Spraying', 'drone_service', 'Efficient aerial spraying'),
('Advanced 3D Mapping & Modeling', 'drone_service', 'High-fidelity 3D models');

-- Seed Repair Services (List 2)
INSERT INTO service_catalog (title, category, description) VALUES
('TechDrone Repair Hub', 'repair_center', 'Authorized repair center for DJI, Autel'),
('AeroDefence Custom Labs', 'repair_center', 'Specialized custom drone manufacturing'),
('Precision Drone Services', 'repair_center', 'Racing and FPV drone repairs'),
('Agricultural Drone Solutions', 'repair_center', 'Agricultural drone maintenance');
