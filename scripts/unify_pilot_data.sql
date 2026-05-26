-- 1. Add geography column to the main drone_pilots table
ALTER TABLE drone_pilots 
ADD COLUMN IF NOT EXISTS current_location GEOGRAPHY(POINT, 4326);

-- 2. Populate geography from existing latitude/longitude
UPDATE drone_pilots 
SET current_location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. Create index for fast proximity searches on drone_pilots
CREATE INDEX IF NOT EXISTS idx_drone_pilots_current_location ON drone_pilots USING GIST (current_location);

-- 4. Update the Search Function to use the main drone_pilots table
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
    hourly_rate INTEGER, -- Note: drone_pilots uses INTEGER for hourly_rate
    rating DECIMAL,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.specializations AS specialization, -- Map 'specializations' to 'specialization' for chatbot compatibility
        p.hourly_rate,
        p.rating,
        ST_Distance(p.current_location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) / 1000 AS distance_km
    FROM 
        drone_pilots p
    WHERE 
        p.is_active = TRUE
        AND p.is_verified = TRUE
        AND (service_filter IS NULL OR p.specializations ILIKE '%' || service_filter || '%')
        AND ST_DWithin(p.current_location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters)
    ORDER BY 
        distance_km ASC;
END;
$$ LANGUAGE plpgsql;
