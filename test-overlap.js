/**
 * Test script to verify appointment overlap detection logic
 * This demonstrates the overlap checking algorithm used in the API
 */

function checkOverlap(slot1, slot2) {
    // slot format: { start_time: "HH:MM", duration: number (minutes) }
    const [start1Hours, start1Minutes] = slot1.start_time.split(':').map(Number);
    const start1Total = start1Hours * 60 + start1Minutes;
    const end1Total = start1Total + slot1.duration;

    const [start2Hours, start2Minutes] = slot2.start_time.split(':').map(Number);
    const start2Total = start2Hours * 60 + start2Minutes;
    const end2Total = start2Total + slot2.duration;

    // Two time ranges overlap if: start1 < end2 AND end1 > start2
    const overlaps = start1Total < end2Total && end1Total > start2Total;
    
    return overlaps;
}

// Test cases
const testCases = [
    {
        name: "Exact same time",
        slot1: { start_time: "10:00", duration: 60 },
        slot2: { start_time: "10:00", duration: 60 },
        expectedOverlap: true
    },
    {
        name: "Partial overlap (slot2 starts during slot1)",
        slot1: { start_time: "10:00", duration: 60 },
        slot2: { start_time: "10:30", duration: 60 },
        expectedOverlap: true
    },
    {
        name: "Partial overlap (slot1 starts during slot2)",
        slot1: { start_time: "10:30", duration: 60 },
        slot2: { start_time: "10:00", duration: 60 },
        expectedOverlap: true
    },
    {
        name: "slot2 completely contains slot1",
        slot1: { start_time: "10:30", duration: 30 },
        slot2: { start_time: "10:00", duration: 120 },
        expectedOverlap: true
    },
    {
        name: "Adjacent slots (no overlap)",
        slot1: { start_time: "10:00", duration: 60 },
        slot2: { start_time: "11:00", duration: 60 },
        expectedOverlap: false
    },
    {
        name: "Separated slots (no overlap)",
        slot1: { start_time: "10:00", duration: 60 },
        slot2: { start_time: "12:00", duration: 60 },
        expectedOverlap: false
    },
    {
        name: "One minute overlap",
        slot1: { start_time: "10:00", duration: 61 },
        slot2: { start_time: "11:00", duration: 60 },
        expectedOverlap: true
    }
];

console.log("Testing appointment overlap detection\n");
console.log("=".repeat(60));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const result = checkOverlap(test.slot1, test.slot2);
    const success = result === test.expectedOverlap;
    
    if (success) {
        passed++;
        console.log(`✓ Test ${index + 1}: ${test.name}`);
    } else {
        failed++;
        console.log(`✗ Test ${index + 1}: ${test.name}`);
        console.log(`  Expected: ${test.expectedOverlap}, Got: ${result}`);
    }
    
    console.log(`  Slot 1: ${test.slot1.start_time} + ${test.slot1.duration}min`);
    console.log(`  Slot 2: ${test.slot2.start_time} + ${test.slot2.duration}min`);
    console.log(`  Overlap: ${result ? 'YES' : 'NO'}`);
    console.log();
});

console.log("=".repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log("✓ All tests passed!");
    process.exit(0);
} else {
    console.log("✗ Some tests failed");
    process.exit(1);
}
