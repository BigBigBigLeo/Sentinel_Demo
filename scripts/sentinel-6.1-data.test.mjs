import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { generateSentinel61Fixture } from '../src/data/sentinel-6.1-fixture.js';
import { SCENARIOS } from '../src/engine/scenarioEngine.js';
import { openSentinelRuntime } from './sentinel-runtime.mjs';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const total = (byLot) => Object.values(byLot).reduce((sum, value) => sum + value, 0);

test('the operating clock persists independently of scenario previews', async () => {
    const path = join(await mkdtemp(join(tmpdir(), 'sentinel-operations-test-')), 'operations.json');
    const runtime = await openSentinelRuntime(path);
    const now = Date.parse('2026-06-18T05:30:00+08:00');
    await Promise.all([runtime.check(now), runtime.check(now)]);
    const first = runtime.operations();
    assert.equal(first.checks, 1);
    const operatingOrder = runtime.currentOrder();
    assert.equal(operatingOrder.mode, 'operations');
    assert.equal(operatingOrder.events[0].detail.source, first.latest.id);
    await runtime.command({ action: 'start', branch: 'qa-known' }, now);
    const exercise = runtime.currentOrder();
    assert.equal(exercise.mode, 'scenario');
    await runtime.command({ action: 'exit', run: exercise.id, revision: exercise.revision }, now);
    assert.deepEqual(runtime.currentOrder(), operatingOrder);
    assert.equal(runtime.preview('baseline').lead, 'B');
    assert.equal(runtime.preview('one-day').releaseGapKg, 450);
    assert.equal(runtime.preview('qa-known').lead, null);
    assert.equal(runtime.preview('qa-late').lead, 'B');
    assert.equal(runtime.preview('qa-late').releaseGapKg, 50);
    assert.equal(runtime.preview('pressure').releaseGapKg, 100);
    const market = runtime.preview('market-advisory');
    assert.equal(market.marketReference.currentCnyPerKg, 54);
    assert.equal(market.order.contractPriceCnyPerKg, 65);
    assert.equal(market.lead, 'B');
    const extended = runtime.preview('extended-window');
    assert.deepEqual(extended.plans.filter(plan => plan.feasible).map(plan => plan.id), ['A', 'B']);
    assert.equal(extended.lead, 'B');
    assert.equal(runtime.preview('invalid'), null);
    assert.deepEqual(runtime.operations(), first);
    const restarted = await openSentinelRuntime(path);
    await restarted.check(now + 1);
    assert.deepEqual(restarted.operations(), first);
    await restarted.check(now + 60_000);
    const changes = restarted.operations(first.id, first.cursor);
    assert.equal(changes.resetCursor, false);
    assert.deepEqual(changes.events.map(event => event.sequence), [2]);
});

test('order authorization, receipts and archive survive a restart', async () => {
    const path = join(await mkdtemp(join(tmpdir(), 'sentinel-order-test-')), 'operations.json');
    const runtime = await openSentinelRuntime(path);
    const now = Date.parse('2026-06-18T05:30:00+08:00');
    await runtime.check(now);
    await runtime.command({ action: 'start', branch: 'baseline' }, now);
    const pending = runtime.activeScenario();
    const select = { action: 'approve', run: pending.id, revision: pending.revision };
    await assert.rejects(runtime.command({ ...select, plan: 'A' }, now), /feasible/);
    const approvals = await Promise.allSettled([runtime.command({ ...select, plan: 'B' }, now), runtime.command({ ...select, plan: 'B' }, now)]);
    assert.equal(approvals.filter(result => result.status === 'fulfilled').length, 1);
    await runtime.command({ ...select, action: 'pause' }, now);
    await runtime.check(now + 2000);
    assert.deepEqual(runtime.activeScenario().receipts, {});
    await runtime.command({ ...select, action: 'step' }, now + 2000);
    assert.equal(total(runtime.activeScenario().receipts.qaClearedByLotKg), 780);
    await runtime.command({ ...select, action: 'resume' }, now + 3000);
    const restarted = await openSentinelRuntime(path);
    for (const offset of [60_000, 61_500, 63_000]) await restarted.check(now + offset);
    const verified = restarted.activeScenario();
    assert.equal(restarted.operations().checks, 2);
    assert.equal(verified.status, 'Verified');
    assert.equal(total(verified.receipts.reservedByLotKg), 750);
    assert.match(verified.audit.fingerprint, /^[a-f0-9]{64}$/);
    await restarted.command({ action: 'exit', run: verified.id, revision: verified.revision });
    assert.deepEqual(restarted.findScenario(verified.id), verified);
    assert.equal(restarted.activeScenario(), null);
    await restarted.command({ action: 'start', branch: 'qa-late' }, now + 64_000);
    const late = restarted.activeScenario();
    assert.equal(late.releaseGapKg, null);
    await restarted.command({ action: 'approve', run: late.id, revision: late.revision, plan: 'B' }, now + 64_000);
    await restarted.check(now + 66_000);
    const blocked = restarted.activeScenario();
    assert.equal(blocked.status, 'Blocked');
    assert.equal(blocked.releaseGapKg, 50);
    assert.equal(blocked.revision, late.revision + 1);
    assert.equal(blocked.receipts.reservedByLotKg, undefined);
    await restarted.command({ action: 'exit', run: blocked.id, revision: blocked.revision });
    await restarted.command({ action: 'start', branch: 'extended-window' }, now + 67_000);
    const alternative = restarted.activeScenario();
    await restarted.command({ action: 'approve', run: alternative.id, revision: alternative.revision, plan: 'A' }, now + 67_000);
    for (const offset of [69_000, 71_000, 73_000]) await restarted.check(now + offset);
    const alternativeResult = restarted.activeScenario();
    assert.equal(alternativeResult.approval.plan, 'A');
    assert.equal(alternativeResult.events.find(event => event.type === 'Harvest accepted').detail.caseHarvestDay, 5);
});

test('the 6.1 baseline is reproducible and reconciles by lot', async () => {
    const manifest = await readJson('../docs/v6.1/scenarios.json');
    const fixture = generateSentinel61Fixture();
    const { order, crew, receipts, lots } = fixture;
    const baseline = manifest.enterprise.branches.find(({ id }) => id === 'baseline').expected;
    assert.deepEqual(fixture, generateSentinel61Fixture());
    assert.notDeepEqual(fixture.telemetry, generateSentinel61Fixture(36).telemetry);
    assert.equal(order.id, manifest.enterprise.id);
    assert.equal(order.quantityKg * order.contractPriceCnyPerKg, baseline.grossContractValueCny);
    assert.equal(order.daysToDelivery * crew.pickers * crew.kgPerPickerDay, baseline.nominalCapacityKg);
    assert.equal(total(receipts.qaClearedByLotKg), baseline.qaClearedKg);
    assert.equal(total(receipts.acceptedByLotKg), baseline.acceptedKg);
    assert.equal(total(receipts.reservedByLotKg), baseline.reservedKg);
    for (const lot of lots) {
        const cleared = receipts.qaClearedByLotKg[lot.id] ?? 0;
        const accepted = receipts.acceptedByLotKg[lot.id] ?? 0;
        const held = receipts.heldAtPackingByLotKg[lot.id] ?? 0;
        const reserved = receipts.reservedByLotKg[lot.id] ?? 0;
        assert.ok(cleared <= lot.gradeA);
        assert.equal(accepted + held, cleared);
        assert.ok(reserved <= accepted);
    }
    assert.equal(receipts.isolatedByLotKg['LOT-03'], 120);
});

test('scenario manifest resolves original cases and reconciles expected 6.1 branches', async () => {
    const manifest = await readJson('../docs/v6.1/scenarios.json');
    const { order, crew, marketReference } = generateSentinel61Fixture();
    assert.deepEqual(manifest.original, Object.values(SCENARIOS).map(({ id, name }) => ({ id, name })));
    const cases = Object.fromEntries(manifest.enterprise.branches.map((branch) => [branch.id, branch]));
    const oneDay = cases['one-day'];
    const capacity = crew.pickers * crew.kgPerPickerDay * oneDay.overrides.daysToDelivery;
    assert.equal(capacity, oneDay.expected.nominalCapacityKg);
    assert.equal(order.quantityKg - capacity, oneDay.expected.minimumGapKg);
    for (const id of ['qa-known', 'qa-late']) {
        assert.equal(order.quantityKg - cases[id].overrides.qaClearedKg, cases[id].expected.minimumGapKg);
    }
    const pressure = cases.pressure;
    const gap = order.quantityKg - pressure.overrides.confirmedUsableKg;
    assert.equal(gap, pressure.expected.minimumGapKg);
    assert.equal(gap * order.contractPriceCnyPerKg, pressure.expected.grossExposureCny);
    const market = cases['market-advisory'];
    assert.equal(marketReference.currentCnyPerKg, market.overrides.referencePriceCnyPerKg);
    assert.equal((marketReference.currentCnyPerKg - marketReference.previousCnyPerKg) * 100 /
        marketReference.previousCnyPerKg, market.expected.marketChangePercent);
    assert.equal(order.contractPriceCnyPerKg, market.expected.contractPriceCnyPerKg);
});

test('starter sources and knowledge carry distinct provenance and scope', async () => {
    const { records } = await readJson('../data/sentinel-source-snapshot.json');
    const { entries } = await readJson('../data/sentinel-knowledge.json');
    assert.equal(new Set(records.map(({ id }) => id)).size, records.length);
    assert.equal(new Set(entries.map(({ id }) => id)).size, entries.length);
    assert.ok(records.every(({ source }) => new URL(source.url).protocol === 'https:'));
    assert.ok(entries.every(({ source, status, scope }) => source && scope && ['draft', 'approved'].includes(status)));
    assert.deepEqual(entries.filter(({ status }) => status === 'approved').map(({ id }) => id), ['product-identity']);
    assert.equal(records.find(({ kind }) => kind === 'published_offer').decisionEligibility, 'reference_only');
    assert.equal(records.find(({ kind }) => kind === 'official_holiday_calendar').holidays.length, 7);
});
