import { createHash, randomUUID } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { generateSentinel61Fixture } from '../src/data/sentinel-6.1-fixture.js';
import { BASELINE, PERSPECTIVES, compareStrategies } from '../src/demo/scenario.js';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const checkIntervalMs = 60_000;

export async function openSentinelRuntime(path) {
  const fixture = generateSentinel61Fixture();
  const [sources, scenarios, knowledge] = await Promise.all([
    readJson(new URL('../data/sentinel-source-snapshot.json', import.meta.url)),
    readJson(new URL('../docs/v6.1/scenarios.json', import.meta.url)),
    readJson(new URL('../data/sentinel-knowledge.json', import.meta.url)),
  ]);
  let state;
  try {
    state = await readJson(path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    state = { id: randomUUID(), checks: 0, lastCheckAt: null, nextCheckAt: 0, events: [] };
  }
  let work = Promise.resolve();

  function update(change) {
    const operation = work.then(async () => {
      const next = change(state);
      if (!next) return;
      await writeFile(`${path}.next`, JSON.stringify(next));
      await rename(`${path}.next`, path);
      state = next;
    });
    work = operation.catch(() => {});
    return operation;
  }

  function check(now = Date.now()) {
    return update(current => {
      const active = current.scenario;
      const scenarioDue = active?.status === 'Executing' && !active.paused && now >= active.nextAt;
      const operating = current.operatingOrder;
      const operationsDue = operating?.status === 'Executing' && !operating.paused && now >= operating.nextAt;
      let next = scenarioDue || operationsDue ? { ...current } : null;
      if (scenarioDue) next.scenario = advanceScenario(active, now);
      if (operationsDue) next.operatingOrder = advanceScenario(operating, now);
      if (now < current.nextCheckAt) return next;

      const hour = (new Date(now).getUTCHours() + 8) % 24;
      const reading = fixture.telemetry[hour];
      const sequence = current.checks + 1;
      const event = {
        id: `${current.id}:${sequence}`, sequence, at: now, fieldId: 'BS-B3',
        type: 'telemetry-check', source: 'seeded-telemetry', reading,
      };
      const previous = current.events.at(-1);
      if (reading.humidity >= 85 && (!previous || previous.reading.humidity < 85)) {
        event.finding = { agent: 'Field Agronomist', rule: 'Case humidity watch ≥85% RH', result: 'Review trap counts and field observations', evidenceId: event.id };
      }
      next = {
        ...(next ?? current), checks: sequence, lastCheckAt: now, nextCheckAt: now + checkIntervalMs,
        events: [...current.events.slice(-119), event],
      };
      if (event.finding && !operating) {
        next.operatingOrder = createOrderRun('baseline', now, {
          source: event.id, reading, finding: event.finding.result,
          scouting: fixture.events.find(source => source.id === 'TRAP-S02')?.detail,
        }, 'operations');
      }
      return next;
    });
  }

  function operations(run, after) {
    const cursor = run === state.id ? Math.max(0, Number(after) || 0) : 0;
    const { id, checks, lastCheckAt, nextCheckAt, events } = state;
    return {
      id, checks, lastCheckAt, nextCheckAt, cursor: checks, latest: events.at(-1),
      resetCursor: run !== state.id || cursor < (events[0]?.sequence ?? 1) - 1 || cursor > state.checks,
      events: events.filter(event => event.sequence > cursor || cursor > state.checks),
    };
  }

  function preview(branchId) {
    const branch = scenarios.enterprise.branches.find(({ id }) => id === branchId);
    if (!branch) return null;
    const { order, crew, marketReference } = fixture;
    const { overrides } = branch;
    const plans = compareStrategies({
      ...BASELINE, days: overrides.daysToDelivery ?? order.daysToDelivery, workers: crew.pickers,
    }, {
      price: order.contractPriceCnyPerKg, kgPerPickerDay: crew.kgPerPickerDay,
      confirmedKg: overrides.confirmedUsableKg ?? (overrides.receiptPhase === 'before_planning' ? overrides.qaClearedKg : undefined),
    });
    const lead = plans.filter(plan => plan.feasible).sort((a, b) => b.contribution - a.contribution)[0]?.id ?? null;
    const bestDeliverableKg = Math.max(...plans.map(plan => plan.deliverable));
    const releaseGapKg = Math.max(0, order.quantityKg - Math.min(bestDeliverableKg, overrides.qaClearedKg ?? Infinity));
    return {
      branch: branch.id, order: { ...order, daysToDelivery: overrides.daysToDelivery ?? order.daysToDelivery }, plans, lead, releaseGapKg,
      marketReference: { ...marketReference, currentCnyPerKg: overrides.referencePriceCnyPerKg ?? marketReference.previousCnyPerKg },
    };
  }

  function addEvent(run, type, detail, now) {
    return { ...run, events: [...run.events, { id: `${run.id}:${run.events.length + 1}`, type, detail, at: now }] };
  }

  function createOrderRun(branch, now, observation, mode) {
    const decision = preview(branch);
    const { releaseGapKg, ...planning } = decision;
    const run = {
      ...planning, mode, releaseGapKg: branch === 'qa-late' ? null : releaseGapKg,
      id: randomUUID(), revision: 1, status: decision.lead ? 'Pending approval' : 'Escalated',
      telemetry: { source: 'seeded-telemetry', timezone: fixture.timezone, startsAt: fixture.startsAt, reading: observation.reading },
      events: [], receipts: {},
    };
    let next = addEvent(run, 'Field observation', observation, now);
    for (const { name, finding, source, roles } of PERSPECTIVES) {
      const detail = mode === 'operations' && name === 'Agronomy'
        ? { finding: 'The humidity watch and case trap alert support reviewing LOT-03. Confirm severity before field intervention.', source: observation.source }
        : { finding, source };
      next = addEvent(next, name, { ...detail, roles: roles.join(', '), handoff: 'Decision review' }, now);
    }
    if (branch === 'market-advisory') next = addEvent(next, 'Market advisory', { previous: run.marketReference.previousCnyPerKg, current: run.marketReference.currentCnyPerKg, contract: run.order.contractPriceCnyPerKg, finding: 'Sales Planner: review new quotes; the signed contract price is unchanged.' }, now);
    return addEvent(next, 'Decision', { lead: run.lead, revision: run.revision }, now);
  }

  function advanceScenario(run, now) {
    const receipt = fixture.receipts;
    let next = { ...run, nextAt: now + 1500 };
    if (!run.receipts.qaClearedByLotKg) {
      const qa = run.branch === 'qa-late' ? { 'LOT-01': 390, 'LOT-02': 310 } : receipt.qaClearedByLotKg;
      next.receipts = { qaClearedByLotKg: qa };
      next = addEvent(next, 'Quality receipt', qa, now);
      const gapKg = Math.max(0, run.order.quantityKg - Object.values(qa).reduce((sum, kg) => sum + kg, 0));
      if (gapKg) next = addEvent({ ...next, status: 'Blocked', revision: run.revision + 1, releaseGapKg: gapKg }, 'Release blocked', { gapKg }, now);
    } else if (!run.receipts.acceptedByLotKg) {
      next.receipts = { ...run.receipts, acceptedByLotKg: receipt.acceptedByLotKg, heldAtPackingByLotKg: receipt.heldAtPackingByLotKg, isolatedByLotKg: receipt.isolatedByLotKg };
      next = addEvent(next, 'Harvest accepted', { ...next.receipts.acceptedByLotKg, caseHarvestDay: run.approval.earliestHarvestDay }, now);
    } else {
      let remaining = run.order.quantityKg;
      const reservedByLotKg = {};
      for (const lot of fixture.lots) {
        if (lot.orderId !== run.order.id) continue;
        const available = Math.min(run.receipts.acceptedByLotKg[lot.id] ?? 0, run.receipts.qaClearedByLotKg[lot.id] ?? 0);
        const quantity = Math.min(remaining, available);
        if (quantity) reservedByLotKg[lot.id] = quantity;
        remaining -= quantity;
      }
      if (remaining) {
        next = addEvent({ ...next, status: 'Blocked', revision: run.revision + 1, releaseGapKg: remaining }, 'Reservation blocked', { gapKg: remaining }, now);
      } else {
        next = addEvent({ ...next, status: 'Verified', receipts: { ...run.receipts, reservedByLotKg } }, 'Inventory reserved', reservedByLotKg, now);
      }
    }
    if (next.status !== 'Executing') {
      const fingerprint = createHash('sha256').update(JSON.stringify({ approval: next.approval, events: next.events, receipts: next.receipts })).digest('hex');
      next.audit = { fingerprint, at: now };
      delete next.nextAt;
    }
    return next;
  }

  function command(input, now = Date.now()) {
    return update(current => {
      const key = current.operatingOrder?.id === input.run && input.run ? 'operatingOrder' : 'scenario';
      const active = current[key];
      if (input.action === 'start') {
        const decision = preview(input.branch);
        if (!decision) throw Error('Unknown scenario branch.');
        if (current.scenario) throw Error('Exit the current scenario before starting another.');
        const observation = { source: 'TRAP-S02', lot: 'LOT-03', order: decision.order.id, reading: fixture.telemetry[5] };
        return { ...current, scenario: createOrderRun(input.branch, now, observation, 'scenario') };
      }
      if (!active || active.id !== input.run || active.revision !== input.revision) throw Error('Review the current scenario revision and retry.');
      if (input.action === 'pause' || input.action === 'resume' || input.action === 'step') {
        if (active.status !== 'Executing') throw Error('The scenario has no work in progress.');
        if (input.action === 'step') {
          if (!active.paused) throw Error('Pause execution before stepping.');
          return { ...current, [key]: advanceScenario(active, now) };
        }
        return { ...current, [key]: { ...active, paused: input.action === 'pause', nextAt: now + 1500 } };
      }
      if (input.action === 'exit') {
        if (active.status === 'Executing') throw Error('Wait for the current work to finish before exiting.');
        return { ...current, [key]: null, scenarioHistory: [active, ...(current.scenarioHistory ?? [])].slice(0, 20) };
      }
      const approvedPlan = active.plans.find(plan => plan.id === input.plan && plan.feasible);
      if (input.action !== 'approve' || active.status !== 'Pending approval' || !approvedPlan) {
        throw Error('Approval requires a feasible plan in the current pending revision.');
      }
      const approval = { plan: input.plan, scope: approvedPlan.subtitle, earliestHarvestDay: approvedPlan.earliestHarvestDay, revision: active.revision, at: now, actor: 'Demo farm manager', workOrder: `WO-${active.id}` };
      const next = addEvent({ ...active, status: 'Executing', approval, nextAt: now + 1500 }, 'Work authorized', approval, now);
      return { ...current, [key]: next };
    });
  }

  function findScenario(id) {
    return [state.scenario, state.operatingOrder, ...(state.scenarioHistory ?? [])].find(run => run?.id === id);
  }

  return { check, operations, preview, command, findScenario, currentOrder: () => state.scenario ?? state.operatingOrder ?? null, activeScenario: () => state.scenario ?? null, scenarioHistory: () => state.scenarioHistory ?? [], sources: sources.records, scenarios, knowledge: knowledge.entries.filter(entry => entry.status === 'approved') };
}
