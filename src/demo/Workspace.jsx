import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Icon from '../components/Icon.jsx';
import { CASE_ID, ORDER_KG, PERSPECTIVES, TASKS } from './scenario.js';

const format = new Intl.NumberFormat('en-US');
const links = [['context', 'Farm Context'], ['decision', 'Decision Room'], ['execution', 'Execution'], ['evidence', 'Evidence']];

function Heading({ tag, title, children }) {
  return <header className="sd-page-heading"><p className="sd-kicker">{tag}</p><h1>{title}</h1><p>{children}</p></header>;
}

function Badge({ children }) {
  const tone = /blocked|escalated|stale|failed/i.test(children) ? 'bad' : /verified|feasible|ready|lead|complete/i.test(children) ? 'good' : '';
  return <span className={'sd-badge ' + tone}>{children}</span>;
}

function Stats({ values }) {
  return <div className="sd-stats">{values.map(([name, value, detail]) => <article className="sd-card" key={name}><small>{name}</small><strong>{value}</strong><span>{detail}</span></article>)}</div>;
}

export function Overview() {
  const { run, fixture, base } = useOutletContext();
  return <>
    <Heading tag="Farm Watch" title="Operations overview">Keep track of incoming signals, decisions and approved work.</Heading>
    <Stats values={[[ 'Grade A order', '750 kg', CASE_ID ], ['Delivery window', run.inputs.days + ' days', 'Simulated order deadline'], ['Harvest crew', run.inputs.workers + ' pickers', 'Two crew groups'], ['Farm area', fixture.farm.areaMu + ' mu', 'Two production blocks']]} />
    <article className="sd-card sd-feature"><div><p className="sd-kicker">{run.minute >= 10 ? '05:40 pest alert' : 'Monitoring active'}</p><h2>{run.minute >= 10 ? 'A field alert with order consequences' : 'Watching the farm and its open order'}</h2><p>{run.minute >= 10 ? (run.inputs.lotOrder === CASE_ID ? 'South block · LOT-03 · linked to the 750 kg order' : 'The monitored lot allocation changed. Review the updated order scope.') : 'Scheduled scouting and weather updates will appear automatically.'}</p></div><Badge>{run.phase}</Badge></article>
    <div className="sd-shortcuts">{links.map(([path, name]) => <Link className="sd-card" key={path} to={base + '/' + path}><strong>{name}</strong><span aria-hidden="true">→</span></Link>)}</div>
  </>;
}

export function Context() {
  const { run, fixture, base, suffix } = useOutletContext();
  const [node, setNode] = useState(0);
  const nodes = [
    ['Pest observation', 'TRAP-S02', 'South block scouting source. The synthetic trap count crossed its configured threshold at 05:40.'],
    ['Affected plot', 'South block', '10 mu production block containing LOT-02 and LOT-03.'],
    ['Crop batches', 'LOT-02 / LOT-03', 'LOT-03 is isolated. LOT-02 has its own Grade A allocation and source lineage.'],
    ['Harvest allocation', 'CREW-25', run.inputs.workers + ' pickers scheduled across the available harvest window.'],
    ['Customer order', run.inputs.lotOrder, 'The LOT-02 allocation points to this order. LOT-01 remains linked to the primary order.'],
  ];
  return <>
    <Heading tag="Farm Ontology" title="Business impact map">Follow the relationships from a field observation to its operating consequences.</Heading>
    <div className="sd-card"><div className="sd-nodes" aria-label="Relationship records">{nodes.map(([title, id], index) => <button aria-pressed={node === index} key={title} onClick={() => setNode(index)}><small>{title}</small><strong>{id}</strong></button>)}</div><div className="sd-inset"><strong>{nodes[node][0]}</strong><p>{node === 0 && run.minute < 10 ? 'This observation has yet to arrive in the current run.' : nodes[node][2]}</p></div></div>
    <div className="sd-card"><h2>Lot register</h2><div className="sd-table-wrap"><table><thead><tr><th>Lot</th><th>Plot</th><th>Harvest-ready</th><th>Grade A forecast</th></tr></thead><tbody>{fixture.lots.map(lot => <tr key={lot.id}><th>{lot.id}</th><td>{lot.plot}</td><td>{lot.ready} kg</td><td>{lot.gradeA} kg</td></tr>)}</tbody></table></div></div>
    <div className="sd-card"><h2>Simulated telemetry</h2><p>Air temperature · °C · 24-hour reference profile</p><div className="sd-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={fixture.telemetry}><XAxis dataKey="hour" tick={{ fill: '#52655d', fontSize: 11 }} /><YAxis domain={[10, 30]} width={36} tick={{ fill: '#52655d', fontSize: 11 }} /><Tooltip /><Line dataKey="temperature" stroke="#19775b" strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div></div>
    <Link className="sd-button" to={base + '/decision' + suffix}>Review strategies →</Link>
  </>;
}

function Inputs({ run, disabled, send }) {
  const fields = [
    ['days', 'Days until delivery', [1, 3, 5]],
    ['workers', 'Pickers', [15, 25]],
    ['freshness', 'Source freshness', ['Current', 'Stale']],
    ['lotOrder', 'LOT-02 order allocation', [CASE_ID, 'BB-ORDER-SECOND']],
  ];
  return <div className="sd-fields">{fields.map(([field, label, options]) => <label key={field}>{label}<select disabled={disabled || ['Verified', 'Blocked'].includes(run.phase)} value={run.inputs[field]} onChange={event => send('inputs', { ...run.inputs, [field]: typeof options[0] === 'number' ? Number(event.target.value) : event.target.value })}>{options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div>;
}

export function Decision() {
  const { run, base, suffix, disabled, send } = useOutletContext();
  const [choice, setChoice] = useState(null);
  const bestModeledVolume = Math.min(ORDER_KG, Math.max(0, ...(run.plans ?? []).map(plan => plan.deliverable)));
  const shortfall = ORDER_KG - bestModeledVolume;
  const nextAction = {
    Verified: 'Review the completed receipts and execution fingerprint.',
    Blocked: 'Review the exception and resolve the failed prerequisite before resuming.',
    Escalated: 'Confirm extra crew capacity, eligible supply, or a revised delivery window before reassessing.',
  }[run.phase] ?? run.analysis?.nextAction;
  const active = run.plans?.find(plan => plan.id === (choice?.snapshot === run.snapshot && choice.id === run.id ? choice.plan : run.lead));
  return <>
    <Heading tag="Enterprise decision" title="Decision Room">One order, three strategies and six specialist perspectives.</Heading>
    <div className="sd-feature sd-card"><div><h2>750 kg Grade A blueberries</h2><p>{run.inputs.days} {run.inputs.days === 1 ? 'day' : 'days'} to delivery · {run.inputs.workers} pickers · snapshot {run.snapshot}</p></div><Badge>{run.phase}</Badge></div>
    <div className="sd-plans">{run.plans ? run.plans.map(plan => <article className={'sd-card ' + (plan.id === active?.id ? 'sd-plan-active' : '')} key={plan.id}><div className="sd-plan-top"><span>Plan {plan.id}</span><Badge>{plan.id === run.lead ? 'Current lead' : plan.feasible ? 'Feasible' : 'Blocked'}</Badge></div><h2>{plan.title}</h2><p>{plan.subtitle}</p><dl><dt>Grade A forecast</dt><dd>{plan.eligible} kg</dd><dt>Crew capacity</dt><dd>{plan.capacity} kg</dd><dt>Modeled cost</dt><dd>RMB {format.format(plan.cost)}</dd><dt>Modeled contribution</dt><dd>{plan.feasible ? 'RMB ' + format.format(plan.contribution) : '—'}</dd></dl><details><summary>Rule checks</summary><ul>{plan.gates.map(gate => <li key={gate.name}>{gate.passed ? 'Passed' : 'Failed'} · {gate.name}</li>)}</ul></details><button className="sd-secondary" type="button" onClick={() => setChoice({ id: run.id, snapshot: run.snapshot, plan: plan.id })}>Inspect Plan {plan.id}</button></article>) : <div className="sd-card"><h2>{run.phase}</h2><p>Farm Watch opens a case automatically when the alert arrives. Findings appear in the activity stream.</p></div>}</div>
    <div className="sd-card sd-feature"><div><h2>{run.lead ? 'Recommendation · Plan ' + run.lead : run.phase === 'Escalated' ? 'No feasible strategy' : 'Recommendation pending'}</h2><p>{run.lead ? 'All hard gates pass. Feasible plans are ranked by modeled contribution at RMB 65 per eligible kilogram, capped at order volume.' : run.phase === 'Escalated' ? (shortfall > 0 ? `Up to ${bestModeledVolume} kg within the modeled harvest window. ${shortfall} kg short of the ${ORDER_KG} kg order. Review the failed gates.` : 'Every strategy has at least one failed hard gate. Review the constraints and escalate.') : 'The service is gathering the current evidence.'}</p></div>{run.phase === 'Pending approval' ? <button className="sd-button" disabled={disabled || !active?.feasible} onClick={() => send('approve', { plan: active.id, snapshot: run.snapshot })}>Approve {active ? 'Plan ' + active.id : 'strategy'}</button> : run.approval && <Link className="sd-button" to={base + '/execution' + suffix}>View execution →</Link>}</div>
    <div className="sd-card"><h2>What-if assumptions</h2><Inputs {...{ run, disabled, send }} /></div>
    {(!suffix || run.analysis) && <section className="sd-card" aria-label="Cross-source briefing">
      <h2>Cross-source briefing</h2>
      {run.analysis ? <>
        <p>{run.analysis.summary}</p>
        <p><strong>Next step to review</strong> {nextAction}</p>
        <div className="sd-specialists">{run.analysis.findings.map(item => <details key={item.perspective}>
          <summary>{item.perspective}</summary><p>{item.finding}</p><small>Evidence: {item.evidence.join(', ')}</small>
        </details>)}</div>
      </> : <p role="status">{({
        disabled: 'Gemini is not configured. Set GEMINI_API_KEY in the terminal that starts Sentinel, then restart the service.',
        waiting: 'The briefing will start once the rule checks are ready.',
        unavailable: ({
          key: 'Gemini rejected the API key. Load a valid key and restart Sentinel.',
          access: 'Gemini denied access. Check the key restrictions and project access in Google AI Studio.',
          quota: 'The Gemini project has reached a usage limit. Check its quota in Google AI Studio.',
          project: 'The Gemini project cannot run this request. Check its API access and tier in Google AI Studio.',
          model: 'The Gemini model is unavailable to this project.',
          provider: 'Gemini is temporarily unavailable.',
          timeout: 'Gemini did not respond in time.',
          connection: 'Sentinel could not connect to Gemini.',
          request: 'Gemini rejected the briefing request.',
          response: 'Gemini returned a briefing that did not pass evidence validation.',
          'session-limit': 'This Sentinel session reached its briefing limit.',
        })[run.analysisFailure] ?? 'The briefing is unavailable. The rule checks above are current.',
        loading: 'Reviewing the current order, farm and market context…',
        queued: 'Reviewing the current order, farm and market context…',
      })[run.analysisStatus] ?? 'Briefing status is unavailable.'}</p>}
    </section>}
    <div className="sd-card"><h2>Specialist perspectives</h2><p>14 simulated specialist roles share the same case snapshot.</p><div className="sd-specialists">{PERSPECTIVES.map(({ name, roles, finding, source, impact }, index) => <details key={name}><summary>{name}<small>{index < run.evaluated ? 'Findings ready' : run.phase === 'Evaluating' ? 'Assessing' : 'Watching'}</small></summary><p>{roles.join(' · ')}</p>{index < run.evaluated && <><p>{finding}</p><small>{source} · {impact}</small></>}</details>)}</div></div>
  </>;
}

export function Execution() {
  const { run, base, suffix } = useOutletContext();
  return <>
    <Heading tag="Governed work" title="Execution">Approved tasks advance in dependency order as simulated receipts arrive.</Heading>
    <article className="sd-card sd-feature"><div><h2>{run.approval ? 'Plan ' + run.approval.plan + ' approved by the demo farm manager' : 'Execution locked until approved'}</h2><p>{run.approval ? 'Authorized snapshot ' + run.approval.snapshot : 'Select a feasible strategy in the Decision Room.'}</p></div><Badge>{run.phase}</Badge></article>
    <div className="sd-card"><ol className="sd-tasks">{TASKS.map(([title, owner], index) => <li key={title}><span className="sd-task-number">{index + 1}</span><div><strong>{title}</strong><small>{owner}</small></div><Badge>{run.completed.includes(index) ? 'Complete' : index === run.completed.length && run.phase === 'Running' ? 'Running' : run.phase === 'Blocked' ? 'Blocked' : 'Waiting'}</Badge></li>)}</ol></div>
    <Link className="sd-button" to={base + '/evidence' + suffix}>View evidence →</Link>
  </>;
}

export function Evidence() {
  const { run, stream, fixture } = useOutletContext();
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ environment: 'Simulation', fixtureVersion: fixture.version, ruleVersion: fixture.ruleVersion, run, events: stream }, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'sentinel-' + run.id + '.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const { quality, harvested, reserved } = run.receipts;
  return <>
    <Heading tag="Evidence and audit" title="Outcome & audit">Trace the approved plan, actual simulated receipts and any deviations.</Heading>
    <Stats values={[[ 'Order target', ORDER_KG + ' kg', CASE_ID ], ['QA cleared', quality === undefined ? '—' : quality + ' kg', quality < ORDER_KG ? ORDER_KG - quality + ' kg shortfall' : 'Quality receipt'], ['Harvest accepted', harvested === undefined ? '—' : harvested + ' kg', 'Packing receipt'], ['Reserved', (reserved ?? 0) + ' kg', run.phase === 'Verified' ? 'Simulated order ready' : 'Inventory ledger']]} />
    <div className="sd-card sd-feature"><div><h2>Execution fingerprint</h2><p className="sd-hash">{run.fingerprint ?? 'Available after execution verification or a blocked run.'}</p></div><button className="sd-secondary" onClick={download}>Export JSON</button></div>
    <div className="sd-card"><h2>Evidence timeline</h2><ol className="sd-audit">{stream.map(event => <li key={event.sequence}><span>{event.type}</span><div><strong>{event.title}</strong><p>{event.detail}</p><small>{event.source}</small></div></li>)}</ol>{!stream.length && <p>Waiting for the first recorded event.</p>}</div>
  </>;
}

export function History() {
  const { data, base } = useOutletContext();
  return <><Heading tag="Run records" title="History">Review stored simulations and replay their recorded evidence.</Heading><div className="sd-card">{data.history.length ? <ul className="sd-history">{data.history.map(run => <li key={run.id}><Link to={base + '/evidence?run=' + run.id}>{run.id.slice(0, 8)} · {run.minute} simulated minutes</Link><Badge>{run.phase}</Badge></li>)}</ul> : <p>Previous runs appear here after a simulation reset.</p>}</div></>;
}

export function Settings() {
  const { run, disabled, send } = useOutletContext();
  return <><Heading tag="Simulation controls" title="Settings">Control the clock and prepare the next simulated receipt.</Heading>
    <div className="sd-card"><h2>Scenario clock</h2><p>Each tick advances one minute. The service continues while the browser is closed.</p><div className="sd-actions"><button className="sd-secondary" disabled={disabled} onClick={() => send('pause')}><Icon name={run.paused ? 'play' : 'pause'} /> {run.paused ? 'Resume' : 'Pause'}</button><button className="sd-secondary" disabled={disabled || !run.paused} onClick={() => send('step')}>Advance one minute</button><button className="sd-secondary" disabled={disabled} onClick={() => { if (window.confirm('Archive this run and restart the scenario?')) send('reset'); }}>Reset run</button></div></div>
    <div className="sd-card"><h2>Quality receipt</h2><div className="sd-fields"><label>Simulated QA outcome<select disabled={disabled || !['Watching', 'Evaluating', 'Pending approval'].includes(run.phase)} value={run.inputs.quality} onChange={event => send('quality', { quantity: Number(event.target.value) })}><option value="780">Baseline · 780 kg</option><option value="700">Shortfall · 700 kg</option></select></label></div></div>
  </>;
}
