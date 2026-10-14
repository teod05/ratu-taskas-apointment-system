-- Enable btree_gist extension for exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent overlapping appointments
-- This ensures no two appointments can overlap on the same date
-- Calculates end_time as start_time + duration * interval '1 minute'
ALTER TABLE "public"."Appointment" 
ADD CONSTRAINT "appointment_no_overlap_excl"
EXCLUDE USING gist (
  "date" WITH =,
  tsrange(
    ("date" + "start_time")::timestamp,
    ("date" + "start_time" + (("duration" || ' minutes')::interval))::timestamp
  ) WITH &&
);
