-- Create drone_pilots table
CREATE TABLE IF NOT EXISTS public.drone_pilots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    certifications TEXT NOT NULL,
    specializations TEXT NOT NULL,
    hourly_rate INTEGER NOT NULL,
    about TEXT NOT NULL,
    dgca_number VARCHAR(100) NOT NULL UNIQUE,
    profile_image_url TEXT,
    certificate_image_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    completed_jobs INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_drone_pilots_email ON public.drone_pilots(email);

-- Create index on location for filtering
CREATE INDEX IF NOT EXISTS idx_drone_pilots_location ON public.drone_pilots(location);

-- Create index on area for filtering
CREATE INDEX IF NOT EXISTS idx_drone_pilots_area ON public.drone_pilots(area);

-- Create index on is_verified and is_active for filtering active verified pilots
CREATE INDEX IF NOT EXISTS idx_drone_pilots_status ON public.drone_pilots(is_verified, is_active);

-- Enable Row Level Security
ALTER TABLE public.drone_pilots ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read verified and active pilots
CREATE POLICY "Allow public read access to verified active pilots"
ON public.drone_pilots
FOR SELECT
USING (is_verified = true AND is_active = true);

-- Policy: Allow authenticated users to insert their own pilot profile
CREATE POLICY "Allow authenticated users to insert pilot profile"
ON public.drone_pilots
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Allow pilots to update their own profile
CREATE POLICY "Allow pilots to update own profile"
ON public.drone_pilots
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow pilots to delete their own profile
CREATE POLICY "Allow pilots to delete own profile"
ON public.drone_pilots
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_drone_pilots_updated_at
    BEFORE UPDATE ON public.drone_pilots
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT ON public.drone_pilots TO anon, authenticated;
GRANT INSERT ON public.drone_pilots TO authenticated;
GRANT UPDATE ON public.drone_pilots TO authenticated;
GRANT DELETE ON public.drone_pilots TO authenticated;
