-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Drone Pilots Table (Enhanced)
-- This table stores pilot metadata and their current real-time location.
CREATE TABLE IF NOT EXISTS drone_pilots_production (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    specialization TEXT CHECK (specialization IN ('Agriculture', 'Photography', 'Mapping', 'Repair')),
    hourly_rate DECIMAL(10,2) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 5.0,
    current_location GEOGRAPHY(POINT, 4326),
    is_available BOOLEAN DEFAULT TRUE,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast proximity searches
CREATE INDEX IF NOT EXISTS idx_pilot_location ON drone_pilots_production USING GIST (current_location);

-- 2. Bookings Table (Enhanced)
-- human-readable ID DRN-AGR-2025-XXXX
CREATE TABLE IF NOT EXISTS bookings_production (
    id TEXT PRIMARY KEY, 
    client_id UUID REFERENCES auth.users(id),
    pilot_id UUID REFERENCES drone_pilots_production(id),
    service_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours INTEGER NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    requirements JSONB,
    payment_method TEXT CHECK (payment_method IN ('UPI', 'Cash')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for location-based booking lookup
CREATE INDEX IF NOT EXISTS idx_booking_location ON bookings_production USING GIST (location);

-- 3. Live Pilot Tracking Table
-- Stores historical movement during an active booking.
CREATE TABLE IF NOT EXISTS pilot_tracking_production (
    id BIGSERIAL PRIMARY KEY,
    booking_id TEXT REFERENCES bookings_production(id) ON DELETE CASCADE,
    pilot_id UUID REFERENCES drone_pilots_production(id),
    location GEOGRAPHY(POINT, 4326),
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_booking ON pilot_tracking_production(booking_id);

-- 4. Geospatial Search Function (Radius Matching)
-- Returns pilots within a given radius (meters) sorted by distance.
CREATE OR REPLACE FUNCTION search_nearby_pilots(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION,
    service_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    specialization TEXT,
    hourly_rate DECIMAL,
    rating DECIMAL,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.specialization,
        p.hourly_rate,
        p.rating,
        ST_Distance(p.current_location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) / 1000 AS distance_km
    FROM 
        drone_pilots_production p
    WHERE 
        p.is_available = TRUE
        AND (service_filter IS NULL OR p.specialization = service_filter)
        AND ST_DWithin(p.current_location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters)
    ORDER BY 
        distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. Enable RLS
ALTER TABLE drone_pilots_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_tracking_production ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public pilots are viewable by everyone" ON drone_pilots_production FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Users can view their own bookings" ON bookings_production FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Pilots can view their assigned bookings" ON bookings_production FOR SELECT USING (EXISTS (
    SELECT 1 FROM drone_pilots_production p WHERE p.id = bookings_production.pilot_id AND p.user_id = auth.uid()
));
CREATE POLICY "Tracking only visible to involved parties" ON pilot_tracking_production FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings_production b WHERE b.id = booking_id AND (b.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM drone_pilots_production p WHERE p.id = b.pilot_id AND p.user_id = auth.uid()
    )))
);
