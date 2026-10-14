# Double-Booking Prevention - Implementation Summary

## Files Changed

### 1. `app/api/appointments/route.ts` (POST endpoint)
**Lines 82-108**: Added overlap validation before creating appointment

Key snippet:
```typescript
// Check for overlapping appointments
const [startHours, startMinutes] = start_time.split(':').map(Number)
const startMinutesTotal = startHours * 60 + startMinutes
const endMinutesTotal = startMinutesTotal + duration

const overlapCheck = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM "public"."Appointment"
    WHERE "date" = ${appointmentDate}::date
    AND (
        EXTRACT(HOUR FROM "start_time") * 60 + EXTRACT(MINUTE FROM "start_time")
    ) < ${endMinutesTotal}
    AND (
        EXTRACT(HOUR FROM "start_time") * 60 + EXTRACT(MINUTE FROM "start_time") + "duration"
    ) > ${startMinutesTotal}
`

if (overlapCheck.length > 0) {
    return NextResponse.json(
        { error: "This time slot is already booked. Please choose a different time." },
        { status: 409 }
    )
}
```

### 2. `app/api/appointments/[id]/route.ts` (PUT endpoint)
**Lines 47-69**: Added overlap validation before updating appointment

Key snippet (similar to POST, but excludes current appointment):
```typescript
const overlapCheck = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM "public"."Appointment"
    WHERE "id" != ${appointmentId}
    AND "date" = ${appointmentDate}::date
    AND (
        EXTRACT(HOUR FROM "start_time") * 60 + EXTRACT(MINUTE FROM "start_time")
    ) < ${endMinutesTotal}
    AND (
        EXTRACT(HOUR FROM "start_time") * 60 + EXTRACT(MINUTE FROM "start_time") + "duration"
    ) > ${startMinutesTotal}
`
```

### 3. `prisma/migrations/20261014133300_prevent_double_booking/migration.sql` (NEW)
**Database-level constraint**: PostgreSQL exclusion constraint

```sql
-- Enable btree_gist extension for exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent overlapping appointments
ALTER TABLE "public"."Appointment" 
ADD CONSTRAINT "appointment_no_overlap_excl"
EXCLUDE USING gist (
  "date" WITH =,
  tsrange(
    ("date" + "start_time")::timestamp,
    ("date" + "start_time" + (("duration" || ' minutes')::interval))::timestamp
  ) WITH &&
);
```

## How It Works

### Overlap Detection Logic
Two appointments overlap if their time ranges intersect:
- Appointment 1: [start1, end1)
- Appointment 2: [start2, end2)
- They overlap if: `start1 < end2 AND end1 > start2`

### Examples:
```
✓ OVERLAP: 10:00-11:00 vs 10:30-11:30  (partial overlap)
✓ OVERLAP: 10:00-11:00 vs 10:00-11:00  (exact match)
✓ OVERLAP: 10:00-12:00 vs 10:30-11:00  (contained)
✗ NO OVERLAP: 10:00-11:00 vs 11:00-12:00  (adjacent)
✗ NO OVERLAP: 10:00-11:00 vs 12:00-13:00  (separated)
```

## Verification

### ✅ Unit Tests (`test-overlap.js`)
- 7 test cases covering all overlap scenarios
- All tests pass

### ✅ Build Verification
- TypeScript compilation: ✓ No errors
- Next.js build: ✓ Successful
- Linting: ✓ All introduced code passes lint

### ⚠️ Not Tested (Requires Database)
- End-to-end booking flow
- Database migration execution
- Actual overlap rejection in running app
- Database constraint enforcement

## Error Response
When overlap detected, API returns:
```json
{
  "error": "This time slot is already booked. Please choose a different time."
}
```
Status: 409 Conflict

## Race Condition Protection
The PostgreSQL exclusion constraint ensures that even if two requests arrive simultaneously:
1. One will succeed
2. The other will fail with a database constraint violation
3. No double-booking can occur
