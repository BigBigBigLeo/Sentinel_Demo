import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASELINE, CASE_ID, MINUTE, ORDER_KG, PERSPECTIVES, START, TASKS, compareStrategies, generateFixture } from '../src/demo/scenario.js';
import { analysisContext, generateAnalysis } from './sentinel-analysis.mjs';
import { askAssistant, createIntelligence } from './sentinel-intelligence.mjs';
import { openSentinelRuntime } from './sentinel-runtime.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const options = new Map(process.argv.slice(2).map(arg => arg.split('=')));
const fixture = generateFixture();
if (options.has('--fixture')) {
  process.stdout.write(JSON.stringify({ ...fixture, baseline: BASELINE, variants: { deadline: { days: 1 }, staffing: { workers: 15 }, stale: { freshness: 'Stale' }, quality: { quality: 700 }, reassigned: { lotOrder: 'BB-ORDER-SECOND' } } }, null, 2) + '\n');
} else {
  await serve();
}

function newRun() {
  return { id: randomUUID(), version: 1, snapshot: 1, minute: 0, paused: false, inputs: { ...BASELINE }, phase: 'Watching', events: [], completed: [], receipts: {}, approval: null, history: [], evaluated: 0 };
}

function add(state, type, title, detail = '', source = '') {
  state.events.push({ sequence: state.events.length + 1, time: START + state.minute * MINUTE, type, title, detail, source });
}

function evaluate(state) {
  state.plans = compareStrategies(state.inputs);
  state.lead = state.plans.filter(plan => plan.feasible).sort((a, b) => b.contribution - a.contribution)[0]?.id ?? null;
  state.phase = state.lead ? 'Pending approval' : 'Escalated';
  add(state, 'Decision', state.lead ? `Plan ${state.lead} recommended` : 'No feasible strategy', state.lead ? 'Hard gates cleared · manager approval required' : 'One or more hard gates failed for every strategy');
}

function advance(state) {
  if (state.paused) return false;
  state.minute += 1;
  if (state.minute > 55 && state.minute % 15 === 0) {
    const hour = Math.floor((330 + state.minute) / 60) % 24;
    const reading = fixture.telemetry[hour];
    add(state, 'Source', 'Scheduled farm check complete', `South block · ${reading.temperature} °C · ${reading.humidity}% RH · no material change`, 'WEATHER-S02');
  }
  for (const source of fixture.sources.filter(event => event.minute === state.minute)) {
    add(state, source.type, source.title, source.detail, source.id);
    if (source.type === 'Alert') {
      state.phase = 'Evaluating';
      add(state, 'Context', 'Farm Ontology linked the affected records', 'TRAP-S02 → South block → LOT-03 → harvest plan → order', CASE_ID);
    }
  }
  if (state.phase === 'Evaluating' && state.minute > 10) {
    const role = PERSPECTIVES[state.evaluated++];
    add(state, 'Specialist', role.name + ' findings ready', role.finding, role.source);
    if (state.evaluated === PERSPECTIVES.length) evaluate(state);
  }
  if (state.phase === 'Running' && state.minute >= state.nextTask) {
    const step = state.completed.length;
    const [title, owner] = TASKS[step];
    if (step === 1) {
      state.receipts.quality = state.inputs.quality;
      state.receipts.qualityLots = state.inputs.quality === 700 ? { 'LOT-01': 390, 'LOT-02': 310 } : { 'LOT-01': 420, 'LOT-02': 360 };
      if (state.inputs.quality < ORDER_KG) {
        state.phase = 'Blocked';
        add(state, 'Exception', 'Quality receipt blocked reservation', `${state.inputs.quality} kg eligible · ${ORDER_KG - state.inputs.quality} kg short · escalate to manager`, owner);
      }
    }
    if (step === 3) {
      state.receipts.harvested = 760;
      state.receipts.harvestedLots = { 'LOT-01': 400, 'LOT-02': 360 };
      state.receipts.heldAtPacking = 20;
      state.receipts.isolated = 120;
    }
    if (step === 4) state.receipts.reserved = ORDER_KG;
    if (step === 5) state.receipts.erp = 'Acknowledged';
    if (state.phase === 'Running') {
      state.completed.push(step);
      add(state, 'Execution', title + ' completed', step === 1 ? `${state.receipts.quality} kg qualified` : step === 3 ? `${state.receipts.harvested} kg accepted` : step === 4 ? '750 kg reserved for this order' : 'Simulated task receipt recorded', owner);
      state.nextTask = state.minute + 2;
      if (state.completed.length === TASKS.length) state.phase = 'Verified';
    }
    if (['Verified', 'Blocked'].includes(state.phase)) {
      state.fingerprint = createHash('sha256').update(JSON.stringify({ run: state.id, approval: state.approval, inputs: state.inputs, receipts: state.receipts, events: state.events })).digest('hex');
      add(state, 'Evidence', state.phase === 'Verified' ? 'Simulated order ready' : 'Execution exception verified', 'Execution fingerprint recorded', state.fingerprint.slice(0, 12));
    }
  }
  return true;
}

function command(state, input) {
  switch (input.action) {
    case 'reset': {
      const next = newRun();
      const { history, ...record } = state;
      next.history = [record, ...history].slice(0, 20);
      return next;
    }
    case 'pause':
      state.paused = !state.paused;
      break;
    case 'step':
      if (!state.paused) throw Error('Pause the clock before advancing manually.');
      state.paused = false;
      advance(state);
      state.paused = true;
      break;
    case 'approve': {
      const plan = state.plans?.find(item => item.id === input.plan);
      if (state.phase !== 'Pending approval' || !plan?.feasible || state.snapshot !== input.snapshot) throw Error('Approval requires a current, feasible strategy.');
      state.approval = { plan: plan.id, snapshot: state.snapshot, inputs: { ...state.inputs }, ruleVersion: fixture.ruleVersion, actor: 'Demo farm manager', time: START + state.minute * MINUTE };
      state.phase = 'Running';
      state.nextTask = state.minute + 2;
      add(state, 'Approval', `Plan ${plan.id} approved`, 'Scope: simulated work orders and inventory reservation', state.approval.actor);
      break;
    }
    case 'inputs': {
      if (['Verified', 'Blocked'].includes(state.phase)) throw Error('Reset the run to change assumptions after completion.');
      const { days, workers, freshness, lotOrder } = input;
      if (![1, 3, 5].includes(days) || ![15, 25].includes(workers) || !['Current', 'Stale'].includes(freshness) || ![CASE_ID, 'BB-ORDER-SECOND'].includes(lotOrder)) throw Error('Invalid scenario assumptions.');
      Object.assign(state.inputs, { days, workers, freshness, lotOrder });
      state.snapshot += 1;
      add(state, 'Context', 'Operating assumptions changed', `${days} days · ${workers} pickers · ${freshness} source data`);
      if (state.phase === 'Running') {
        state.phase = 'Blocked';
        add(state, 'Exception', 'Remaining tasks held', 'Approved inputs changed during execution. Existing receipts are retained.');
        state.fingerprint = createHash('sha256').update(JSON.stringify({ run: state.id, approval: state.approval, receipts: state.receipts, events: state.events })).digest('hex');
      } else if (state.minute >= 10) {
        state.evaluated = 0;
        state.phase = 'Evaluating';
        state.lead = null;
        state.plans = null;
      }
      break;
    }
    case 'quality':
      if (!['Watching', 'Evaluating', 'Pending approval'].includes(state.phase)) throw Error('Set the QA receipt before approval.');
      if (![700, 780].includes(input.quantity)) throw Error('Invalid QA receipt.');
      state.inputs.quality = input.quantity;
      add(state, 'Simulation', 'QA receipt preset updated', 'Applied when the quality team reports its simulated receipt.');
      break;
    default:
      throw Error('Unknown command.');
  }
  state.version += 1;
  return state;
}

async function serve() {
  const dist = join(root, 'dist');
  const path = resolve(options.get('--store') ?? join(tmpdir(), 'sentinel-demo-v351', 'state.json'));
  await mkdir(dirname(path), { recursive: true });
  const runtime = await openSentinelRuntime(`${path}.operations`);
  await runtime.check();
  let state;
  try { state = JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; state = newRun(); }
  let work = Promise.resolve();
  function update(change) {
    const operation = work.then(async () => {
      const next = change(structuredClone(state));
      if (!next) return;
      await writeFile(path + '.next', JSON.stringify(next));
      await rename(path + '.next', path);
      state = next;
    });
    work = operation.catch(() => {});
    return operation;
  }
  const analysisKey = process.env.GEMINI_API_KEY?.trim();
  const intelligence = createIntelligence();
  void intelligence();
  const feedTimer = setInterval(() => { void intelligence(); }, 60_000);
  let lastChat = 0;
  let analysisInFlight = false;
  let lastAttempt;
  let analysisFailure;
  let calls = 0;
  function currentAnalysis(run) {
    if (!run.plans || !['Pending approval', 'Escalated', 'Verified', 'Blocked'].includes(run.phase)) return null;
    const context = analysisContext(run, fixture);
    return { context, id: createHash('sha256').update(JSON.stringify(context)).digest('hex') };
  }
  async function refreshAnalysis() {
    if (!analysisKey || analysisInFlight || calls >= 30) return;
    const candidate = currentAnalysis(state);
    if (!candidate || candidate.id === state.analysis?.id || candidate.id === lastAttempt) return;
    const runId = state.id;
    lastAttempt = candidate.id;
    analysisFailure = undefined;
    calls++;
    analysisInFlight = true;
    try {
      const result = await generateAnalysis(analysisKey, candidate.context);
      await update(draft => {
        if (draft.id !== runId || currentAnalysis(draft)?.id !== candidate.id) return null;
        draft.analysis = { id: candidate.id, snapshot: draft.snapshot, ...result };
        add(draft, 'Analysis', 'Cross-source briefing ready', 'Order, farm and market context reviewed', 'Gemini');
        return draft;
      });
    } catch (error) {
      analysisFailure = error.analysisCode ?? (error.name === 'TimeoutError' ? 'timeout' : 'connection');
      console.warn(`Gemini briefing unavailable (${analysisFailure}); the rules workflow remains active.`);
    } finally {
      analysisInFlight = false;
    }
  }
  const timer = setInterval(() => {
    runtime.check().catch(error => console.error(error.message));
    update(draft => advance(draft) ? draft : null).then(refreshAnalysis).catch(error => console.error(error.message));
  }, Number(options.get('--tick') ?? 1100));
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
  const json = (response, status, value) => {
    response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify(value));
  };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname === '/api/operations' && request.method === 'GET') {
        return json(response, 200, runtime.operations(url.searchParams.get('run'), url.searchParams.get('after')));
      }
      if (url.pathname === '/api/scenarios' && request.method === 'GET') {
        const branch = url.searchParams.get('branch');
        if (!branch) return json(response, 200, runtime.scenarios);
        const preview = runtime.preview(branch);
        return json(response, preview ? 200 : 404, preview ?? { error: 'Scenario branch unavailable.' });
      }
      if (url.pathname === '/api/order-run' && request.method === 'GET') {
        const archive = url.searchParams.get('run');
        const history = runtime.scenarioHistory();
        const run = archive ? runtime.findScenario(archive) : runtime.currentOrder();
        if (run && url.searchParams.get('export') === '1') {
          response.setHeader('Content-Disposition', `attachment; filename="sentinel-order-${run.id}.json"`);
          return json(response, 200, run);
        }
        return json(response, archive && !run ? 404 : 200, { run: run ?? null, history });
      }
      if (url.pathname === '/api/order-run' && request.method === 'POST') {
        let body = '';
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 8192) return json(response, 413, { error: 'Request too large.' });
        }
        await runtime.command(JSON.parse(body));
        return json(response, 200, { run: runtime.currentOrder() });
      }
      if (url.pathname === '/api/intelligence' && request.method === 'GET') return json(response, 200, { ...await intelligence(), sourceRecords: runtime.sources });
      if (url.pathname === '/api/gemini/verify' && request.method === 'POST') {
        let body = '';
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 8192) return json(response, 413, { error: 'Request too large.' });
        }
        let input = {};
        try { input = JSON.parse(body); } catch (_) {}
        const clientKey = request.headers['x-gemini-key'] || input.apiKey;
        const effectiveKey = (clientKey || analysisKey || '').trim();
        if (!effectiveKey) {
          return json(response, 400, { ok: false, error: 'API key is empty.' });
        }
        try {
          const pingRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveKey}`);
          if (pingRes.ok) {
            const data = await pingRes.json();
            return json(response, 200, { ok: true, modelsCount: data?.models?.length || 0 });
          }
          const errText = await pingRes.text();
          let errJson = {};
          try { errJson = JSON.parse(errText); } catch (_) {}
          const msg = errJson?.error?.message || errText;
          const reason = errJson?.error?.details?.[0]?.reason || (msg.includes('API key not valid') ? 'API_KEY_INVALID' : 'AUTH_ERROR');
          return json(response, pingRes.status, { ok: false, error: msg, reason, status: pingRes.status });
        } catch (err) {
          return json(response, 502, { ok: false, error: `Upstream connection failed: ${err.message}` });
        }
      }
      if (url.pathname === '/api/gemini/generate' && request.method === 'POST') {
        let body = '';
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 32_000) return json(response, 413, { error: 'Request too large.' });
        }
        let input = {};
        try { input = JSON.parse(body); } catch (_) {}
        const clientKey = request.headers['x-gemini-key'] || input.apiKey;
        const effectiveKey = (clientKey || analysisKey || '').trim();
        if (!effectiveKey) {
          return json(response, 503, { error: 'Gemini is not configured. Please input a valid Gemini API key in settings or run Sentinel with GEMINI_API_KEY.' });
        }
        const prompt = input.prompt || 'Analyze current scenario';

        // 1. Resolve available models dynamically from Google for this specific key with 4s timeout
        let targetModels = [];
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveKey}`, {
            signal: AbortSignal.timeout(4000)
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            const available = (listData?.models || [])
              .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
              .map(m => m.name.replace(/^models\//, ''))
              // Strictly exclude any deprecated or restricted models (e.g. gemini-2.5, preview-05, etc.)
              .filter(name => !name.startsWith('gemini-2.5') && !name.includes('preview-05') && !name.includes('preview-09'));
            const priorityList = [
              'gemini-3.8-flash',
              'gemini-3.5-flash-lite',
              'gemini-2.0-flash',
              'gemini-1.5-flash',
              'gemini-flash-latest'
            ];
            for (const p of priorityList) {
              if (available.includes(p)) targetModels.push(p);
            }
            for (const m of available) {
              if (!targetModels.includes(m) && targetModels.length < 3) targetModels.push(m);
            }
          }
        } catch (_) {}

        if (!targetModels.length) {
          targetModels = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        }
        targetModels = targetModels.slice(0, 3);

        let lastError = null;
        for (const model of targetModels) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`;
            const gRes = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(7000),
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 1000, temperature: 0.25 }
              })
            });
            if (gRes.ok) {
              const gData = await gRes.json();
              const reply = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply) {
                return json(response, 200, { text: reply, source: `Google ${model} (在线大模型)` });
              }
            }
            const errBody = await gRes.text();
            let parsed = {};
            try { parsed = JSON.parse(errBody); } catch (_) {}
            lastError = parsed?.error?.message || errBody;
            if (lastError.includes('API_KEY_INVALID') || lastError.includes('API key not valid')) {
              return json(response, 400, { error: lastError });
            }
            if (gRes.status === 403 && (lastError.includes('PERMISSION_DENIED') || lastError.includes('location is not supported'))) {
              return json(response, 403, { error: lastError });
            }
            if (gRes.status === 429 && lastError.includes('RESOURCE_EXHAUSTED')) {
              return json(response, 429, { error: lastError });
            }
          } catch (err) {
            lastError = err.message;
          }
        }
        return json(response, 502, { error: `Gemini relay failed: ${lastError}` });
      }
      if (url.pathname === '/api/assistant' && request.method === 'POST') {
        const clientKey = request.headers['x-gemini-key'];
        const effectiveKey = (clientKey || analysisKey || '').trim();
        if (!effectiveKey) return json(response, 503, { error: 'Gemini is not configured. Start Sentinel with GEMINI_API_KEY or input key in Settings.' });
        let body = '';
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 16_000) return json(response, 413, { error: 'The conversation is too long.' });
        }
        const input = JSON.parse(body);
        const messages = input.conversation;
        if (!Array.isArray(messages) || !messages.length || messages.length > 9 || messages.at(-1)?.role !== 'user' ||
          messages.some(message => !['user', 'assistant'].includes(message?.role) || typeof message.text !== 'string' || !message.text.trim() || message.text.length > 4500)) {
          return json(response, 400, { error: 'Invalid conversation.' });
        }
        if (Date.now() - lastChat < 3000) return json(response, 429, { error: 'Please wait before sending another question.' });
        lastChat = Date.now();
        const active = input.archive ? state.history.find(run => run.id === input.archive) : state;
        if (!active) return json(response, 404, { error: 'The archived run is unavailable.' });
        const orderRun = input.orderRun ? runtime.findScenario(input.orderRun)
          : ['/', '/sensors', '/business', '/risk', '/prescription', '/execution', '/audit', '/history'].includes(input.page) ? runtime.currentOrder() : null;
        if (input.orderRun && !orderRun) return json(response, 404, { error: 'The archived order run is unavailable.' });
        const context = input.mode === 'order'
          ? active.plans ? analysisContext(active, fixture) : { order: CASE_ID, phase: active.phase, inputs: active.inputs }
          : orderRun ? { page: input.page, orderRun } : { page: input.page, farm: input.context, operations: runtime.operations().latest };
        try {
          const pinned = Boolean(orderRun || input.archive);
          const feeds = pinned ? {} : await intelligence();
          const answer = await askAssistant(effectiveKey, messages, { workspace: context, feeds, sourceRecords: pinned ? [] : runtime.sources, knowledge: runtime.knowledge });
          const evidence = orderRun ? { label: `Order evidence · revision ${orderRun.revision}`, href: `/audit?orderRun=${encodeURIComponent(orderRun.id)}` } : undefined;
          return json(response, 200, { answer, evidence });
        } catch (error) {
          const safeMessage = ['Gemini quota reached. Try again later.', 'Gemini is currently unavailable.', 'Gemini returned no answer.'].includes(error.message) ? error.message : 'The assistant could not connect. Please try again.';
          return json(response, 502, { error: safeMessage });
        }
      }
      if (url.pathname === '/api/demo' && request.method === 'GET') {
        const { events, history, analysis, ...run } = state;
        const current = currentAnalysis(state);
        if (analysis && current?.id === analysis.id) run.analysis = analysis;
        run.analysisStatus = run.analysis ? 'ready' : !analysisKey ? 'disabled' : !current ? 'waiting' : analysisInFlight ? 'loading' : (lastAttempt === current.id || calls >= 30) ? 'unavailable' : 'queued';
        if (run.analysisStatus === 'unavailable') run.analysisFailure = calls >= 30 && lastAttempt !== current.id ? 'session-limit' : analysisFailure;
        const cursor = url.searchParams.get('run') === state.id ? Math.max(0, Number(url.searchParams.get('after')) || 0) : 0;
        const archived = history.find(item => item.id === url.searchParams.get('archive'));
        return json(response, 200, { run, events: events.slice(cursor), cursor: events.length, fixture, archived, history: history.map(({ id, phase, minute, fingerprint }) => ({ id, phase, minute, fingerprint })), heartbeat: Date.now() });
      }
      if (url.pathname === '/api/demo' && request.method === 'POST') {
        let body = '';
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 8192) throw Error('Request too large.');
        }
        const input = JSON.parse(body);
        await update(draft => {
          if (input.run !== draft.id || input.version !== draft.version) throw Error('The run changed. Review its current state and retry.');
          return command(draft, input);
        });
        return json(response, 200, { ok: true });
      }
      if (url.pathname.startsWith('/api/') || request.method !== 'GET') return json(response, 404, { error: 'Route unavailable.' });
      const filename = resolve(dist, '.' + decodeURIComponent(url.pathname));
      if (filename !== dist && !filename.startsWith(dist + sep)) return json(response, 404, { error: 'Route unavailable.' });
      const target = extname(filename) ? filename : join(dist, 'index.html');
      const bytes = await readFile(target);
      response.writeHead(200, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream' });
      response.end(bytes);
    } catch (error) {
      json(response, error.code === 'ENOENT' ? 404 : 409, { error: error.code === 'ENOENT' ? 'Build the frontend with npm run build first.' : error.message });
    }
  });
  server.on('close', () => { clearInterval(timer); clearInterval(feedTimer); });
  server.listen(Number(options.get('--port') ?? 4175), '127.0.0.1', () => {
    console.log(`Sentinel Demo · http://127.0.0.1:${server.address().port}`);
  });
}
