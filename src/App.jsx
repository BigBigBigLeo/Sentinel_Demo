import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, NavLink, Navigate, Outlet, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import Icon from './components/Icon.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SensorTelemetry from './pages/SensorTelemetry.jsx';
import RiskAssessment from './pages/RiskAssessment.jsx';
import Prescription from './pages/Prescription.jsx';
import FarmExecution from './pages/Execution.jsx';
import AuditReport from './pages/AuditReport.jsx';
import FarmHistory from './pages/History.jsx';
import ScenarioControl from './pages/ScenarioControl.jsx';
import Admin from './pages/Admin.jsx';
import FarmBusiness from './pages/FarmBusiness.jsx';
import { Assistant, Intelligence } from './demo/Operations.jsx';
import { CASE_ID, MINUTE, START, ZONE, BASELINE, PERSPECTIVES, TASKS, ORDER_KG, generateFixture, compareStrategies } from './demo/scenario.js';
import { Context, Decision, Evidence, Execution, History, Overview, Settings } from './demo/Workspace.jsx';
import useStore from './engine/store.js';
import { pick } from './i18n/locale.js';
import './demo/site.css';

const base = '/workspace/cases/' + CASE_ID;
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: ZONE });
const flow = [
  ['Look', 'Keep watch', 'Track changes in fields, orders and resources.'],
  ['Think', 'Compare strategies', 'Bring six specialist perspectives into one decision.'],
  ['Act', 'Coordinate work', 'Turn an approved plan into traceable work orders.'],
  ['Prove', 'Verify the result', 'Match quantities and receipts to the approved plan.'],
];

function Brand() {
  return <Link className="sd-brand" to="/product"><Icon name="shield" size={26} /> SENTINEL</Link>;
}

function Public({ technical = false }) {
  return <div className="sd-public">
    <header className="sd-public-nav"><Brand /><nav aria-label="Public navigation"><NavLink to="/product" end>Product</NavLink><NavLink to="/how-it-works">How it works</NavLink><Link className="sd-button" to="/">Open workspace <span aria-hidden="true">↗</span></Link></nav></header>
    {technical ? <main className="sd-story">
      <p className="sd-kicker">Product architecture</p><h1>From field intelligence to enterprise decisions.</h1>
      <p className="sd-lead">Sentinel connects scouting, crop lots, orders and crews in a shared Farm Ontology. Every recommendation carries its rules, source records and approval history.</p>
      <div className="sd-tech">{[
        ['Physical operations', 'Scouting, sensors, crews and equipment provide observations and receipts.'],
        ['Farm management', 'Order records and workforce plans map to stable farm, lot and resource IDs.'],
        ['Enterprise decisions', 'Crop knowledge, semantic maps and deterministic gates combine with specialist findings.'],
        ['Execution evidence', 'Approved work goes through adapters. A fingerprint ties the result to its decision and receipts.'],
      ].map(([name, detail]) => <article className="sd-card" key={name}><h2>{name}</h2><p>{detail}</p></article>)}</div>
      <Link className="sd-button" to="/business">Explore the order relationships →</Link>
    </main> : <main>
      <section className="sd-hero"><div className="sd-hero-copy">
        <p className="sd-kicker">Decision &amp; execution OS for high-value agriculture</p>
        <h1>Your farm’s <em>24/7</em> AI operating manager.</h1>
        <p className="sd-lead">One field alert can put an entire order at risk. Sentinel connects crop health, labor, compliance and margin so your team can act in time.</p>
        <div className="sd-actions"><Link className="sd-button" to="/">Open workspace →</Link><Link className="sd-text-link" to="/how-it-works">See how it works</Link></div>
      </div><div className="sd-hero-visual">
        <img src="/images/field_team.png" alt="Field operations team inspecting a crop" />
        <div className="sd-hero-ticket"><span>Simulated case · 05:40</span><strong>750 kg Grade A order</strong><small>Pest alert → affected lot → order impact</small></div>
      </div></section>
      <section className="sd-public-flow"><h2>One operating loop</h2><div>{flow.map(([step, title, detail]) => <article key={step}><span>{step}</span><h3>{title}</h3><p>{detail}</p></article>)}</div></section>
    </main>}
    <footer className="sd-footer"><Brand /><span>Blueberries first. A shared operating model for high-value crops.</span><Link to="/scenarios">Explore scenarios →</Link></footer>
  </div>;
}

// In-browser deterministic mock simulation engine for 100% self-contained demo
function createClientDemoRun() {
  const fixture = generateFixture();
  const initialInputs = { ...BASELINE };
  const initialPlans = compareStrategies(initialInputs);
  const leadPlan = initialPlans.find(p => p.feasible)?.id || 'B';
  return {
    run: {
      id: 'demo-run-client-01',
      version: 1,
      minute: 12,
      paused: false,
      phase: 'Pending approval',
      lead: leadPlan,
      snapshot: 1,
      inputs: initialInputs,
      plans: initialPlans,
      evaluated: PERSPECTIVES.length,
      completed: [],
      nextTask: 14,
      receipts: {
        quality: 750,
        qualityLots: { 'LOT-01': 420, 'LOT-02': 360 },
        harvested: 760,
        harvestedLots: { 'LOT-01': 400, 'LOT-02': 360 },
        heldAtPacking: 20,
        isolated: 120,
        reserved: 750,
        erp: 'Acknowledged'
      },
      approval: null,
      fingerprint: null,
      analysis: {
        summary: 'Plan B provides the optimal balance of quality, compliance, and margin for the 750 kg Grade A blueberry order. By shifting harvest to protected North tunnels, the operation avoids the 72h PHI restriction in the South block while meeting KA delivery SLAs with 100% bloom preservation.',
        nextAction: 'Authorize Plan B to dispatch early harvest crew (05:00-08:30) and reserve pre-cooling lot space.',
        findings: [
          {
            perspective: 'Agronomy Lead',
            finding: 'South block LOT-03 requires 72h PHI lockout following bio-pesticide application. North tunnels remain 100% compliant and harvest-ready.',
            evidence: ['TRAP-S02 count 18', '72h PHI rule THRIP-PHI-03']
          },
          {
            perspective: 'Commercial KA Director',
            finding: 'Full fulfillment of the 750kg Grade A commitment protects RMB 48,750 net revenue and prevents SLA delivery default penalties.',
            evidence: ['Contract BB-ORDER-750-001', 'RMB 65/kg KA pricing']
          },
          {
            perspective: 'Cold-Chain Logistics',
            finding: 'Pre-cooling capacity at 1.5°C is sufficient to buffer 750kg of morning harvest within the 2-hour field-to-cooling window.',
            evidence: ['Pre-cooling Lot-01/02', 'Target pulp temp 1.5°C']
          }
        ]
      }
    },
    fixture,
    events: [
      { sequence: 1, time: START + 5 * MINUTE, type: 'Alert', title: 'Pest trap threshold exceeded', detail: 'TRAP-S02 in South block recorded 18 thrips. Isolating LOT-03.', source: 'TRAP-S02' },
      { sequence: 2, time: START + 6 * MINUTE, type: 'Context', title: 'Farm Ontology linked the affected records', detail: 'TRAP-S02 → South block → LOT-03 → harvest plan → order ' + CASE_ID, source: CASE_ID },
      { sequence: 3, time: START + 10 * MINUTE, type: 'Specialist', title: 'Agronomy Lead Dr. Chen findings ready', detail: 'South block entered 72h PHI restriction window after bio-spray. Zero chemical spray permitted in North tunnels.', source: 'SP-AGRONOMY' },
      { sequence: 4, time: START + 11 * MINUTE, type: 'Specialist', title: 'Commercial Director Wu findings ready', detail: 'Hema Fresh order SLA requires 750kg Grade A delivery by D+3. Defaulting triggers RMB 15,000 penalty.', source: 'SP-COMMERCIAL' },
      { sequence: 5, time: START + 12 * MINUTE, type: 'Decision', title: 'Plan B recommended', detail: 'Hard gates cleared (PHI, Quality, Cold-Chain). Manager approval required.', source: 'ORCHESTRATOR' }
    ],
    history: [],
    archived: null
  };
}

let clientDemoState = createClientDemoRun();

function useDemo(archive) {
  const [data, setData] = useState(clientDemoState);
  const [offline, setOffline] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const cursor = useRef({ run: '', after: 0 });

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    cursor.current = { run: '', after: 0 };
    async function poll() {
      try {
        const params = new URLSearchParams({ ...cursor.current, archive: archive ?? '' });
        const response = await fetch('/api/demo?' + params, { signal: controller.signal });
        if (response.ok) {
          const next = await response.json();
          const same = cursor.current.run === next.run.id;
          cursor.current = { run: next.run.id, after: next.cursor };
          setData(previous => ({ ...next, events: same ? [...(previous?.events ?? []), ...next.events] : next.events }));
          setOffline(false);
        }
      } catch {
        // Self-contained in-browser demo: fallback cleanly to client simulation state
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(poll, 2000);
      }
    }
    poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [archive]);

  async function send(action, payload = {}) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload, run: data.run.id, version: data.run.version })
      });
      if (response.ok) {
        // sync from server
      } else {
        throw Error('Local fallback');
      }
    } catch {
      // Execute in client demo engine
      setData(prev => {
        const current = { ...prev };
        const run = { ...current.run };
        if (action === 'approve') {
          run.phase = 'Running';
          run.approval = { plan: payload.plan, actor: 'Demo Farm Manager', time: Date.now() };
          current.events = [
            ...current.events,
            { sequence: current.events.length + 1, time: Date.now(), type: 'Approval', title: `Plan ${payload.plan} approved`, detail: 'Scope: North tunnel early harvest + pre-cooling buffer', source: 'OPERATOR' }
          ];
        } else if (action === 'pause') {
          run.paused = !run.paused;
        } else if (action === 'step') {
          run.minute += 2;
          current.events = [
            ...current.events,
            { sequence: current.events.length + 1, time: Date.now(), type: 'Execution', title: 'Receipt Step Progress (+10kg)', detail: 'Simulated task receipt recorded', source: 'FIELD-EXEC' }
          ];
        } else if (action === 'inputs') {
          Object.assign(run.inputs, payload);
          run.plans = compareStrategies(run.inputs);
          run.lead = run.plans.find(p => p.feasible)?.id || null;
        } else if (action === 'reset') {
          return createClientDemoRun();
        }
        current.run = run;
        clientDemoState = current;
        return current;
      });
    } finally {
      setBusy(false);
    }
  }

  return { data, offline, message, busy, send };
}

function WorkspaceShell() {
  const [params] = useSearchParams();
  const archive = params.get('run');
  const demo = useDemo(archive);
  const { data, offline, message, busy } = demo;
  const { locale } = useStore();
  const run = archive ? data?.archived : data?.run;
  const stream = archive ? run?.events ?? [] : data?.events ?? [];
  const suffix = archive ? '?run=' + encodeURIComponent(archive) : '';

  const entries = [
    ['dashboard', pick(locale, 'Overview', '园区概览'), '/workspace'],
    ['layers', pick(locale, 'Farm Context', '本体上下文'), base + '/context'],
    ['prescription', pick(locale, 'Decision Room', '决策矩阵中枢'), base + '/decision'],
    ['execution', pick(locale, 'Execution', '自治执行'), base + '/execution'],
    ['shield', pick(locale, 'Evidence', '证据与存证'), base + '/evidence'],
    ['history', pick(locale, 'History', '历史追溯'), '/workspace/history'],
    ['sensors', pick(locale, 'Settings', '假设与参数'), '/workspace/settings']
  ];

  return <div className="sd-workspace">
    <header className="sd-top">
      <Brand />
      <div>
        <Link className="sd-return-top" to="/">{pick(locale, 'Exit Demo', '返回主页')}</Link>
        <span className="sd-sim">{pick(locale, 'Autonomous Core', '自治决策中枢')}</span>
        <span className="sd-clock">{run ? time.format(START + run.minute * MINUTE) + ' CST' : '05:40 CST'}</span>
      </div>
    </header>
    <aside className="sd-sidebar">
      <div className="sd-farm">
        {pick(locale, 'Yunnan Blueberry Super-Farm', '云南澄江 900 亩蓝莓超级工厂')}
        <small>{pick(locale, 'Order Workspace · 100% In-Browser', '订单决策工作台 · 全闭环运行')}</small>
      </div>
      <nav aria-label="Workspace navigation">
        {entries.map(([icon, name, path]) => (
          <NavLink end key={path} to={path + (path.includes('/cases/') ? suffix : '')}>
            <Icon name={icon} /> {name}
          </NavLink>
        ))}
      </nav>
    </aside>
    <main className="sd-main">
      {offline && <p className="sd-banner" role="status">Simulation service offline. Showing the last confirmed state.</p>}
      {message && <p className="sd-banner" role="alert">{message}</p>}
      {archive && <p className="sd-banner">{pick(locale, 'Archived simulation · ', '已归档推演 · ')}<Link to={base + '/evidence'}>{pick(locale, 'Back to current run', '返回当前推演')}</Link></p>}
      {run && data ? (
        <Outlet context={{ ...demo, run, stream, fixture: data.fixture, archive, base, suffix, disabled: busy || Boolean(archive) }} />
      ) : (
        <div className="sd-card">{pick(locale, 'Loading Sentinel Autonomous Core...', '正在载入 Sentinel 自治推演中枢...')}</div>
      )}
    </main>
    <aside className="sd-rail">
      <h2><Icon name="activity" /> {pick(locale, 'System activity', '系统动态流水')}</h2>
      <p>
        <span className={'sd-dot ' + (run?.paused ? 'sd-dot-idle' : '')} />{' '}
        {archive ? pick(locale, 'Recorded events', '历史记录事件') : run?.paused ? pick(locale, 'Clock paused', '时钟暂停') : pick(locale, 'Farm Watch active', '园区全天候守望中')}
      </p>
      {stream.length ? (
        <ol>
          {stream.slice(-22).reverse().map(event => (
            <li key={event.sequence}>
              <small>{time.format(event.time)} · {event.type}</small>
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p>{pick(locale, 'Listening for scheduled source updates.', '正在接收园区实时遥测信号...')}</p>
      )}
    </aside>
  </div>;
}

function CasePage({ page }) {
  const { caseId } = useParams();
  return caseId === CASE_ID ? page : <Navigate replace to="/workspace" />;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="sensors" element={<SensorTelemetry />} />
      <Route path="risk" element={<RiskAssessment />} />
      <Route path="prescription" element={<Prescription />} />
      <Route path="execution" element={<FarmExecution />} />
      <Route path="audit" element={<AuditReport />} />
      <Route path="history" element={<FarmHistory />} />
      <Route path="scenarios" element={<ScenarioControl />} />
      <Route path="admin" element={<Admin />} />
      <Route path="intelligence" element={<Intelligence />} />
      <Route path="business" element={<FarmBusiness />} />
    </Route>
    <Route path="product" element={<div className="sentinel-site"><Public /></div>} />
    <Route path="how-it-works" element={<div className="sentinel-site"><Public technical /></div>} />
    <Route path="workspace" element={<div className="sentinel-site"><WorkspaceShell /><Assistant /></div>}>
      <Route index element={<Overview />} />
      {Object.entries({ context: <Context />, decision: <Decision />, execution: <Execution />, evidence: <Evidence /> }).map(([path, page]) => <Route key={path} path={'cases/:caseId/' + path} element={<CasePage page={page} />} />)}
      <Route path="history" element={<History />} /><Route path="settings" element={<Settings />} />
    </Route>
    <Route path="*" element={<Navigate replace to="/" />} />
  </Routes></BrowserRouter>;
}
