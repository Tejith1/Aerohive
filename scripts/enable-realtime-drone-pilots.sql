-- Enable Realtime for drone_pilots table
-- Run this in your Supabase SQL Editor if Realtime is not actively triggered for this table

-- Supabase already has a publication called 'supabase_realtime'.
-- Add the drone_pilots table to the publication so it emits real-time events.
ALTER PUBLICATION supabase_realtime ADD TABLE public.drone_pilots;

