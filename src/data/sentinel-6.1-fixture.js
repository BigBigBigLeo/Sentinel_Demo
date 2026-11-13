import { CASE_ID, LOTS, START, ZONE, generateFixture } from '../demo/scenario.js';

export function generateSentinel61Fixture(seed = 35) {
    const legacy = generateFixture(seed);
    return {
        version: '6.1.0',
        dataKind: 'case',
        seed,
        startsAt: new Date(START).toISOString(),
        timezone: ZONE,
        farm: legacy.farm,
        telemetry: legacy.telemetry,
        events: legacy.sources,
        order: { id: CASE_ID, grade: 'A', quantityKg: 750, contractPriceCnyPerKg: 65, daysToDelivery: 3 },
        crew: { pickers: 25, kgPerPickerDay: 12 },
        lots: LOTS.map(lot => ({ ...lot, orderId: lot.gradeA > 0 ? CASE_ID : null })),
        receipts: {
            qaClearedByLotKg: { 'LOT-01': 420, 'LOT-02': 360 },
            acceptedByLotKg: { 'LOT-01': 400, 'LOT-02': 360 },
            reservedByLotKg: { 'LOT-01': 400, 'LOT-02': 350 },
            heldAtPackingByLotKg: { 'LOT-01': 20 },
            isolatedByLotKg: { 'LOT-03': 120 },
        },
        marketReference: {
            previousCnyPerKg: 60,
            currentCnyPerKg: 54,
            previousAt: '2026-06-11T05:30:00+08:00',
            currentAt: '2026-06-18T05:30:00+08:00',
            priceBasis: 'regional case reference',
            decisionEligibility: 'advisory',
        },
    };
}
