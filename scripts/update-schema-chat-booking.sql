-- Add latitude and longitude to drone_pilots table
ALTER TABLE drone_pilots 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Create index for geospatial queries (simple index for now)
CREATE INDEX IF NOT EXISTS dx_drone_pilots_lat_lng ON drone_pilots (latitude, longitude);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id),
  pilot_id uuid REFERENCES drone_pilots(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  scheduled_at timestamp with time zone NOT NULL,
  duration_hours integer NOT NULL,
  client_location_lat double precision,
  client_location_lng double precision,
  client_notes text,
  total_amount decimal(10, 2),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Booking Policies
-- Clients can see their own bookings
CREATE POLICY "Clients can view their own bookings" 
ON bookings FOR SELECT 
USING (auth.uid() = client_id);

-- Clients can create bookings
CREATE POLICY "Clients can create bookings" 
ON bookings FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Pilots can see bookings assigned to them (linking via user_id in drone_pilots)
CREATE POLICY "Pilots can view their assigned bookings" 
ON bookings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM drone_pilots 
    WHERE drone_pilots.id = bookings.pilot_id 
    AND drone_pilots.user_id = auth.uid()
  )
);

-- Pilots can update bookings assigned to them
CREATE POLICY "Pilots can update their assigned bookings" 
ON bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM drone_pilots 
    WHERE drone_pilots.id = bookings.pilot_id 
    AND drone_pilots.user_id = auth.uid()
  )
);
