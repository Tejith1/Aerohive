-- Mediator System Migration Script
-- Run this in your Supabase SQL Editor to update the bookings table.

-- 1. Add order_uuid to bookings table
-- We use gen_random_uuid() to auto-generate it for new rows.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'order_uuid') THEN
        ALTER TABLE public.bookings ADD COLUMN order_uuid UUID DEFAULT gen_random_uuid();
        CREATE UNIQUE INDEX idx_bookings_order_uuid ON public.bookings(order_uuid);
    END IF;
END $$;

-- 2. Update status constraint to support new statuses
-- We need to drop the existing check constraint and add a new one.
-- The name of the constraint is usually bookings_status_check or similar.
DO $$
DECLARE
    con_name text;
BEGIN
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.bookings DROP CONSTRAINT ' || con_name;
    END IF;
END $$;

ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'pending', 'confirmed', 'completed', 'cancelled'));

-- 3. Update 'confirmed' bookings to 'PENDING' or 'ACCEPTED' if needed? 
-- For now we keep existing data as is, but new bookings will use 'PENDING'.

-- 4. Enable RLS permissions for public/unauthenticated access to specific endpoints if needed
-- (Job acceptance might be public via link, but usually we verify UUID)

