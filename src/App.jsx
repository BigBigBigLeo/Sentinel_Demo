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
import { CASE_ID, MINUTE, START, ZONE } from './demo/scenario.js';
import { Context, Decision, Evidence, Execution, History, Overview, Settings } from './demo/Workspace.jsx';
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

function useDemo(archive) {
  const [data, setData] = useState(null);
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
        if (!response.ok) throw Error('Service unavailable');
        const next = await response.json();
        const same = cursor.current.run === next.run.id;
        cursor.current = { run: next.run.id, after: next.cursor };
        setData(previous => ({ ...next, events: same ? [...(previous?.events ?? []), ...next.events] : next.events }));
        setOffline(false);
      } catch {
        if (!controller.signal.aborted) setOffline(true);
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(poll, 650);
      }
    }
    poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [archive]);
  async function send(action, payload = {}) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload, run: data.run.id, version: data.run.version }) });
      if (!response.ok) throw Error((await response.json()).error);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return { data, offline, message, busy, send };
}

function WorkspaceShell() {
  const [params] = useSearchParams();
  const archive = params.get('run');
  const demo = useDemo(archive);
  const { data, offline, message, busy } = demo;
  const run = archive ? data?.archived : data?.run;
  const stream = archive ? run?.events ?? [] : data?.events ?? [];
  const suffix = archive ? '?run=' + encodeURIComponent(archive) : '';
  const entries = [['dashboard', 'Overview', '/workspace'], ['layers', 'Farm Context', base + '/context'], ['prescription', 'Decision Room', base + '/decision'], ['execution', 'Execution', base + '/execution'], ['shield', 'Evidence', base + '/evidence'], ['history', 'History', '/workspace/history'], ['sensors', 'Settings', '/workspace/settings']];
  return <div className="sd-workspace">
    <header className="sd-top"><Brand /><div><Link className="sd-return-top" to="/">Exit Demo</Link><span className="sd-sim">Order Demo</span><span className="sd-clock">{run ? time.format(START + run.minute * MINUTE) + ' CST' : 'Connecting…'}</span></div></header>
    <aside className="sd-sidebar"><div className="sd-farm">Yunnan Blueberry Farm<small>Order workspace</small></div><nav aria-label="Workspace navigation">{entries.map(([icon, name, path]) => <NavLink end key={path} to={path + (path.includes('/cases/') ? suffix : '')}><Icon name={icon} /> {name}</NavLink>)}</nav></aside>
    <main className="sd-main">
      {offline && <p className="sd-banner" role="status">Simulation service offline. Showing the last confirmed state.</p>}
      {message && <p className="sd-banner" role="alert">{message}</p>}
      {archive && <p className="sd-banner">Archived simulation · <Link to={base + '/evidence'}>Back to current run</Link></p>}
      {run && data ? <Outlet context={{ ...demo, run, stream, fixture: data.fixture, archive, base, suffix, disabled: offline || busy || Boolean(archive) }} /> : <div className="sd-card">{data && archive ? 'This archived run is unavailable.' : 'Connecting to the simulation service…'}</div>}
    </main>
    <aside className="sd-rail"><h2><Icon name="activity" /> System activity</h2><p><span className={'sd-dot ' + (offline || run?.paused ? 'sd-dot-idle' : '')} /> {offline ? 'Offline' : archive ? 'Recorded events' : run?.paused ? 'Clock paused' : 'Farm Watch active'}</p>
      {stream.length ? <ol>{stream.slice(-22).reverse().map(event => <li key={event.sequence}><small>{time.format(event.time)} · {event.type}</small><strong>{event.title}</strong><span>{event.detail}</span></li>)}</ol> : <p>Listening for scheduled source updates.</p>}
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
