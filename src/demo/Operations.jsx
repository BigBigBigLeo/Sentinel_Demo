import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../engine/store.js';
import Icon from '../components/Icon.jsx';

export function OperationsHeartbeat({ detail = false }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/operations', { signal: controller.signal });
        if (!response.ok) throw Error('Operations unavailable');
        setStatus(await response.json());
      } catch {
        if (!controller.signal.aborted) setStatus(false);
      }
    }
    load();
    const timer = setInterval(load, 15_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);

  const latest = status?.latest;
  const finding = status?.events?.findLast(event => event.finding);
  return <div className="ai-watchdog-bar" role="status">
    <strong>Server Operations</strong>
    {latest ? <span> · {latest.fieldId} · check {latest.sequence} · {latest.reading.temperature} °C · {latest.reading.humidity}% RH · {new Date(latest.at).toLocaleTimeString()} (case telemetry)</span>
      : <span> · {status === false ? 'Service unavailable' : 'Checking service…'}</span>}
    {finding && (detail ? <span>{finding.finding.agent} · {finding.finding.rule} · {finding.finding.result} · {finding.reading.humidity}% RH · {finding.id}</span> : <Link to="/risk">Review recent field finding</Link>)}
  </div>;
}

export function OrderScenarioPreview() {
  const [catalog, setCatalog] = useState(null);
  const [branch, setBranch] = useState('baseline');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const navigate = useNavigate();

  async function start() {
    setStarting(true);
    setStartError('');
    try {
      await sendOrderCommand({ action: 'start', branch });
      navigate('/prescription');
    } catch (failure) { setStartError(failure.message); }
    finally { setStarting(false); }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/scenarios', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw Error('Scenario catalog unavailable');
        return response.json();
      })
      .then(setCatalog)
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!catalog) return;
    const controller = new AbortController();
    setError(false);
    setResult(null);
    fetch(`/api/scenarios?${new URLSearchParams({ branch })}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw Error('Scenario preview unavailable');
        return response.json();
      })
      .then(setResult)
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [branch, catalog]);

  return <section className="ops-intelligence">
    <h2>Blueberry order · 6.1 scenario preview</h2>
    {catalog && <label>Scenario branch{' '}
      <select value={branch} onChange={event => setBranch(event.target.value)}>
        {catalog.enterprise.branches.map(({ id }) => <option key={id} value={id}>{id.replaceAll('-', ' ')}</option>)}
      </select>
    </label>}
    {error ? <p role="status">Scenario preview unavailable.</p> : result?.branch === branch ? <div aria-live="polite">
      <p>{result.order.quantityKg} kg · RMB {result.order.contractPriceCnyPerKg}/kg · {result.lead ? `Plan ${result.lead} leads at planning` : 'No feasible plan at planning'} · Release gap: {result.releaseGapKg} kg</p>
      <ul>{result.plans.map(plan => <li key={plan.id}>Plan {plan.id}: {plan.feasible ? 'Eligible at planning' : plan.gates.filter(gate => !gate.passed).map(gate => gate.name).join(', ')}</li>)}</ul>
      <button className="btn btn-primary" disabled={starting} onClick={start}>Start order scenario</button>{' '}
      <Link to="/prescription">Open active decision</Link>
      {startError && <p role="alert">{startError}</p>}
    </div> : <p role="status">Loading scenario preview…</p>}
  </section>;
}

async function sendOrderCommand(input) {
  const response = await fetch('/api/order-run', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) throw Error(data.error);
  return data.run;
}

const sumLots = (lots = {}) => Object.values(lots).reduce((sum, kg) => sum + kg, 0);

export function OrderRunPanel({ section }) {
  const { search } = useLocation();
  const archive = new URLSearchParams(search).get('orderRun');
  const [data, setData] = useState(null);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function load() {
      try {
        const response = await fetch(`/api/order-run?${new URLSearchParams({ run: archive ?? '' })}`, { signal: controller.signal });
        if (!response.ok) throw Error('Order run unavailable');
        const incoming = await response.json();
        if (!controller.signal.aborted) setData(incoming);
        setOffline(false);
      } catch { if (!controller.signal.aborted) setOffline(true); }
      finally { if (!controller.signal.aborted && !archive) timer = setTimeout(load, 1000); }
    }
    load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [archive]);

  const run = archive ? data?.run?.id === archive && data.run : data?.run;
  const planId = selected?.run === run?.id ? selected?.id : run?.lead;
  async function command(action) {
    setBusy(true);
    setError('');
    try {
      const next = await sendOrderCommand({ action, run: run.id, revision: run.revision, plan: planId });
      setData(previous => ({ ...previous, run: next, history: action === 'exit' ? [run, ...(previous?.history ?? [])] : previous?.history ?? [] }));
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  if (!run && !((section === 'history' && data?.history?.length) || section === 'business' || archive)) return null;
  const suffix = archive ? `?orderRun=${encodeURIComponent(archive)}` : '';
  return <section className="page ops-intelligence order-run-panel" aria-label="Blueberry order workflow">
    <h2>{section === 'business' ? 'Farm Business' : 'Blueberry order workflow'} {run && `· ${run.mode === 'operations' ? 'Operations' : 'Scenario'} · ${run.status}`}</h2>
    {offline && <p role="status">Order service unavailable.</p>}
    {error && <p role="alert">{error}</p>}
    {run && <>
      <p>{run.order.id} · {run.order.quantityKg} kg Grade {run.order.grade} · RMB {run.order.contractPriceCnyPerKg}/kg · revision {run.revision}</p>
      {section === 'sensors' && run.telemetry && <p>Scenario field reading · {run.telemetry.reading.temperature} °C · {run.telemetry.reading.humidity}% RH · {run.telemetry.timezone}</p>}
      {section === 'business' && <p>Contract value at full delivery: RMB {run.order.quantityKg * run.order.contractPriceCnyPerKg} · Delivery window: {run.order.daysToDelivery} days · Nominal harvest capacity: {run.plans[0].capacity} kg</p>}
      <nav aria-label="Order workflow"><Link to={'/risk' + suffix}>Evidence</Link> · <Link to={'/business' + suffix}>Order</Link> · <Link to={'/prescription' + suffix}>Decision</Link> · <Link to={'/execution' + suffix}>Execution</Link> · <Link to={'/audit' + suffix}>Audit</Link></nav>
      {section === 'prescription' && <>
        {run.status === 'Blocked' && <p role="status">Release blocked · {run.releaseGapKg} kg gap. The cards below show the original planning revision.</p>}
        {run.status === 'Escalated' && <p role="status">No feasible plan. Review the blocked gates before changing the order or resources.</p>}
        <div className="ops-panels">{run.plans.map(plan => <article key={plan.id}>
          <h3>{plan.id} · {plan.title}</h3>
          <p>{plan.deliverable} kg projected · {plan.feasible ? `RMB ${plan.contribution} modeled contribution` : 'Blocked at planning'}</p>
          <ul>{plan.gates.map(gate => <li key={gate.name}>{gate.passed ? 'Pass' : 'Blocked'} · {gate.name}</li>)}</ul>
          <button className="btn btn-secondary" aria-pressed={planId === plan.id} disabled={archive || !plan.feasible || run.status !== 'Pending approval'} onClick={() => setSelected({ run: run.id, id: plan.id })}>Select {plan.id}</button>
        </article>)}</div>
        <button className="btn btn-primary" disabled={busy || offline || Boolean(archive) || !planId || run.status !== 'Pending approval'} onClick={() => command('approve')}>Authorize {planId ?? 'plan'}</button>
      </>}
      {['execution', 'business', 'audit'].includes(section) && <>
        <p>QA cleared: {sumLots(run.receipts.qaClearedByLotKg)} kg · Accepted: {sumLots(run.receipts.acceptedByLotKg)} kg · Reserved: {sumLots(run.receipts.reservedByLotKg)} kg</p>
        {run.approval && <p>Work order {run.approval.workOrder} · Plan {run.approval.plan} · {run.approval.scope} · Harvest from case day {run.approval.earliestHarvestDay}</p>}
        {run.status === 'Blocked' && <p>Release blocked · {run.releaseGapKg} kg gap</p>}
      </>}
      {['risk', 'audit', 'execution'].includes(section) && <ol>{run.events.map(event => <li key={event.id}><details>
        <summary>{event.type} · {event.detail.finding ?? new Date(event.at).toLocaleTimeString()}</summary>
        <dl>{Object.entries(event.detail).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value && typeof value === 'object' ? JSON.stringify(value) : value ?? 'none'}</dd></div>)}</dl>
      </details></li>)}</ol>}
      {section === 'audit' && run.audit && <details><summary>Audit fingerprint</summary><code>{run.audit.fingerprint}</code></details>}
      {section === 'audit' && <p><a href={`/api/order-run?${new URLSearchParams({ run: run.id, export: '1' })}`} download={`sentinel-order-${run.id}.json`}>Export order evidence</a></p>}
      {!archive && section === 'execution' && run.status === 'Executing' && <p>
        <button className="btn btn-secondary" disabled={busy || offline} onClick={() => command(run.paused ? 'resume' : 'pause')}>{run.paused ? 'Resume' : 'Pause'}</button>{' '}
        <button className="btn btn-secondary" disabled={busy || offline || !run.paused} onClick={() => command('step')}>Step to next receipt</button>
      </p>}
      {!archive && <button className="btn btn-secondary" disabled={busy || offline || run.status === 'Executing'} onClick={() => command('exit')}>{run.mode === 'operations' ? 'Archive operating order' : 'Archive and exit order scenario'}</button>}
    </>}
    {section === 'business' && !run && <p>Open the <Link to="/scenarios">blueberry order scenario</Link> to inspect its contract and receipts.</p>}
    {section === 'history' && <ul>{data?.history?.map(item => <li key={item.id}><Link to={`/audit?orderRun=${encodeURIComponent(item.id)}`}>{item.order.id} · {item.branch} · {item.status}</Link></li>)}</ul>}
  </section>;
}

// ============================================================================
// Sentinel 7.0 In-Browser Knowledge & Anti-Abuse Local Assistant
// ============================================================================

const LOCAL_KB_EN = [
  {
    keywords: ['trade-off', 'plan b', 'plan c', 'compare', 'contrast', 'difference', 'b vs c'],
    answer: "Sentinel Decision Analysis: Plan B and Plan C represent a classic trade-off between margin optimization and execution simplicity:\n1. Margin Gap: Plan B delivers the highest net contribution (¥30k~¥35k), whereas Plan C yields ¥25k~¥28k (a ~¥6,000 variance).\n2. Operational Ease: Plan B requires complex cross-domain synchronization (Ease 2/5: drone flight, lot barricades, split-room storage); Plan C requires zero equipment coordination (Ease 5/5: pickers harvest directly).\n3. Compliance: Both clear legal limits. Plan B uses 0-day PHI Trichoderma; Plan C is 100% zero-spray eco-certified. Plan B leads currently, but Plan C is a rock-solid runner-up that flips to lead if flight fails.",
    evidence: { label: "View Decision Matrix →", href: "/prescription" }
  },
  {
    keywords: ['plan a', 'blocked', 'phi', 'mancozeb', 'chemical', 'veto', 'compliance gate'],
    answer: "Sentinel Compliance Ruling: Plan A violates mandatory food safety regulations:\n1. PHI Breach: Mancozeb carries a mandatory 14-day Pre-Harvest Interval (PHI) under national standards GB 2763.\n2. Harvest Window Conflict: The contract delivery date is in 3 days (D+3). Harvesting fruit 3 days after a Mancozeb spray guarantees illegal chemical residue, resulting in load rejection, penalty fees, and loss of green certifications. The Compliance Gate instantly trips into a RED hard lock.",
    evidence: { label: "Inspect Compliance Gate →", href: "/prescription" }
  },
  {
    keywords: ['plan c win', 'flip', 'boundary', 'drone down', 'gust', 'when does plan c'],
    answer: "Boundary Condition Triggers: Plan C is engineered to win under two realistic scenarios:\n1. Equipment/Weather Failure: If the T40 drone encounters battery/hardware failure, or localized gusts exceed 3.0 m/s preventing flight;\n2. Strict Organic Protocol: If the buyer (e.g. organic retail tier or export customer) contractually enforces a 100% zero-spray protocol;\nToggling these boundary conditions in Sentinel Policy #81 instantly flips Plan C into [✔ CURRENT LEAD].",
    evidence: { label: "Simulate Boundary Conditions →", href: "/prescription" }
  },
  {
    keywords: ['farm', 'scale', '900', 'facility', 'hectare', 'plants', 'blueprint', 'specs'],
    answer: "Farm Facility Blueprint: 900 mu (~60 ha) modern greenhouse plant factory in Yunnan Chengjiang (1,750m elevation, north bank of Fuxian Lake). Features 32,000 substrate coir pots, South-B3 sector with 3,200 Eureka bushes, dual-chamber 50t CA cold room (1.5°C), 2 DJI T40 agricultural drones, and 12 IoT microclimate weather stations. Annual OPEX is ~¥11.5M, gross revenue ~¥23.4M with ~50.8% net operating margin.",
    evidence: { label: "Farm Business Overview →", href: "/business" }
  },
  {
    keywords: ['labor', 'crew', '25', 'picker', 'capacity', 'workers'],
    answer: "Labor & Capacity Analysis: CREW-25 (25 skilled pickers) is on duty today with a nominal throughput of 12-15 kg/person/day (~300-375 kg/day). Over the 3-day harvest window (D+3), total picking volume reaches 900-1,125 kg, comfortably covering the 750 kg order quota. In a 1-day emergency deadline, capacity is strictly capped at 300 kg, generating a 450 kg shortfall that triggers automated escalation.",
    evidence: { label: "Labor & Capacity Registry →", href: "/business" }
  },
  {
    keywords: ['heatwave', 'sunscald', '36.5', 'extreme heat', 'uv'],
    answer: "Scenario 2 Heatwave Protocol: Continuous 36.5°C heatwave and UV 11+ forecast. Daytime overhead misting creates droplet lens effect scorching berries and stripping epicuticular wax (bloom loss >25%). Plan B deploys 75% aluminum shade screens, nocturnal ground cooling, and reschedules 28 workers to 05:00-10:00 dawn shift. Avoids noon labor safety violations, maintains 94% bloom integrity, and protects ¥78,000 contract value.",
    evidence: { label: "Review Heatwave Scenario →", href: "/scenarios" }
  },
  {
    keywords: ['cold room', 'cold chain', 'deficit', '50kg', 'compressor', 'shortfall'],
    answer: "Scenario 3 Cold Chain Shortfall Protocol: Cold Room #1 compressor tripped to 7.8°C for 3 hours, causing mild softening in 50kg upper fruit. Late QA confirms 700kg Grade A. Plan B immediately releases 700kg certified stock, draws 50kg pre-sorted safety buffer from Cold Room #2 to complete the 750kg order, and repurposes 50kg soft berries into local craft beer puree (+¥1,000). Total net contribution ¥32,500.",
    evidence: { label: "Review Cold Chain Scenario →", href: "/scenarios" }
  },
  {
    keywords: ['python', 'code', 'script', 'poem', 'love', 'weather in paris', 'jailbreak'],
    answer: "Sentinel Guardrail: I am an autonomous operating core dedicated exclusively to commercial blueberry farm management, agronomic reasoning, microclimate regulation, PHI compliance, and order economics. I cannot write general code, poetry, or engage in off-topic dialogue. Please ask questions related to farm operations and harvest decisions."
  }
];

const LOCAL_KB_ZH = [
  {
    keywords: ['方案b', '方案c', '权衡', '得失', '对比', '区别', '优劣', '经济账'],
    answer: "【观衡智序研判结论】方案 B 与方案 C 构成了现代农业工厂在“利润最大化”与“执行纯粹度”之间的经典权衡：\n1. 经济收益差异：方案 B 综合净利润为 ¥30,000 ~ ¥35,000（全场最高）；方案 C 净利润约为 ¥25,000 ~ ¥28,000（次优净利，差额约 6,000 元）。\n2. 执行复杂度对比：方案 B 执行最繁琐（Ease 2/5），需同时协同无人机微量对靶飞防、地块警戒线物理隔离与气调冷库分仓；方案 C 执行最简便（Ease 5/5），采摘工人直接全量抢收，无需任何农机与生物调配。\n3. 合规与绿色属性：两者皆合规。方案 B 采用哈茨木霉菌（0天 PHI 生物制剂）；方案 C 为 100% 完全零喷洒纯生态作业。当前默认推荐方案 B，但在无人机故障或买家严苛要求纯天然时，方案 C 瞬间翻转为第一优选！",
    evidence: { label: "查看决策室决策矩阵 →", href: "/prescription" }
  },
  {
    keywords: ['方案a', '否决', '拦截', '门禁', '代森锰锌', 'phi', '合规', '化防'],
    answer: "【观衡智序合规判定】方案 A 触碰了不可逾越的食品安全法律红线：\n1. PHI 采前间隔期冲突：方案 A 采用的高效化学杀菌剂（代森锰锌）在国家标准 GB 2763 中规定蓝莓采前安全间隔期为 14 天。\n2. 交货窗口严重违规：本案距离商超交付仅剩 3 天 (D+3)。若强行喷施化药，3 天后采收上市抽检农残必严重超标，属于违规上市，将面临产品销毁、商超巨额索赔及吊销绿色资质风险。系统三道硬门禁中的 COMPLIANCE 自动触发红牌熔断，彻底闭锁派单权限！",
    evidence: { label: "查看合规门禁状态 →", href: "/prescription" }
  },
  {
    keywords: ['方案c翻转', '胜出', '翻转', '边界条件', '无人机故障', '阵风', '什么时候选方案c'],
    answer: "【边界推演触发条件】方案 C 拥有明确且高度现实的胜出场景：\n1. 农机与气象故障：当植保无人机突发机械/电池故障，或澄江局部阵风超过 3.0 m/s 导致无法安全起飞对靶喷雾时；\n2. 客户纯生态特殊协议：当采购方（如盒马有机专柜或出口客户）在合同补充条款中严苛规定“本次交付批次必须具备 100% 零农药、零生物制剂纯天然生态背书”时；\n一旦在决策矩阵中模拟上述边界工况，系统 Policy #81 会立即将方案 C 提升为 [✔ CURRENT LEAD]，方案 B 降为次选。",
    evidence: { label: "模拟边界翻转工况 →", href: "/prescription" }
  },
  {
    keywords: ['农场', '900亩', '规模', '设施', '园区', '澄江', '抚仙湖', '温室', '设备'],
    answer: "【园区蓝图与资产概况】云南玉溪澄江 900 亩现代高科技蓝莓农业工厂（抚仙湖北岸，海拔 1,750 米高原冷凉气候）：\n• 生产单元：32,000 株优瑞卡基质无土栽培，南区 B3 连栋棚 20 亩（3,200 株盛果期树体）；\n• 核心装备：双温区 50t 气调保鲜库（1.5°C 恒温恒湿）、2 台大疆 T40 农业无人机、12 座微气候气象与物联网诱虫测报箱；\n• 经营指标：年化运营成本 ~¥1,150 万元，年产值 ~¥2,340 万元，净利润率高达 50.8%，直供盒马、华润 Ole' 等高端商超。",
    evidence: { label: "查看农场经营核算 →", href: "/business" }
  },
  {
    keywords: ['人手', '工人', '25人', '采摘', '工班', '工日', '产能', 'crew'],
    answer: "【现场用工与运力核算】CREW-25 专属采摘班组今日 25 人在岗，标称采摘产能为 12~15 kg/人/天（全班日采摘量约 300~375 kg）：\n• 在 3 天交付窗口（D+3）下，3 天累计采收运力可达 900~1,125 kg，充裕覆盖盒马 750 kg 订单；\n• 若在 1 天紧急交付窗口下，单日最大采摘量仅 300 kg，将产生 450 kg 的不可调和刚性缺口，必须触发人工协调升级。",
    evidence: { label: "查看劳动力与工时表 →", href: "/business" }
  },
  {
    keywords: ['热浪', '高温', '36.5', '日灼', '紫外线', '极端天气', '场景二', '拂晓'],
    answer: "【场景二：热浪日灼危机调度】微气象站预警连续 48 小时 36.5°C 极端高温与 11+ 强紫外线：\n• 白天如果向树冠弥雾喷水，水滴形成透镜效应反加剧果面灼伤，且果粉脱落率超 25% 导致严重降级；\n• 方案 B 启动白天 75% 铝箔双层内遮阳降低棚温 5.2°C，夜间地表微喷储冷，调度 28 名工人清晨 05:00~10:00 拂晓抢收；\n• 避开午间 35°C 高温劳动法红线，果温低于 18°C 进预冷库，果粉保持率 94%，全额保全 ¥78,000 商超大单！",
    evidence: { label: "进入场景控制中心 →", href: "/scenarios" }
  },
  {
    keywords: ['冷库跳闸', '温控故障', '缺口', '50kg', '短缺', '软果', '精酿', '场景三'],
    answer: "【场景三：冷链故障与缺口调配】1号气调保鲜库压缩机跳闸升温至 7.8°C 持续 3 小时，上层 50kg 果肉变软，晚到质检确认仅 700kg 特级果合格：\n• 方案 A 强行混入软果被质检门禁红牌拦截；\n• 方案 B 放行合格 700kg，从 2号备用库调拨 50kg 优质预留安全库存精装补齐 750kg 整单；50kg 软果折价转本地精酿蓝莓果汁/冷冻深加工增收 ¥1,000，全场净利润 ¥32,500 最高，客户零客诉！",
    evidence: { label: "进入场景控制中心 →", href: "/scenarios" }
  },
  {
    keywords: ['python', '写代码', '代码', '写诗', '做诗', '诗歌', '闲聊', '天气', '越狱'],
    answer: "【观衡智序安全守则】抱歉，本系统为 900 亩蓝莓农业工厂专用经营决策智能体，仅支持蓝莓农艺机理、水肥温控、病虫害合规 (PHI) 与订单履约财务问答，不支持通用代码编写、文学创作或其他无关闲聊。请围绕当前农场运营与决策方案提出专业问题。"
  }
];

function matchLocalAnswer(query, isZh, storeState) {
  const q = query.toLowerCase().trim();
  const kb = isZh ? LOCAL_KB_ZH : LOCAL_KB_EN;

  for (const entry of kb) {
    if (entry.keywords.some(k => q.includes(k.toLowerCase()))) {
      return { answer: entry.answer, evidence: entry.evidence };
    }
  }

  // Fallback agricultural context response
  const activeField = storeState.fields[storeState.activeFieldId]?.name || 'South-B3';
  const topRisk = storeState.riskResults?.[0]?.name || 'Pest & PHI Risk';
  if (isZh) {
    return {
      answer: `【观衡智序现场简报】针对地块 ${activeField}（当前主要风险：${topRisk}，日龄 Day ${storeState.currentDay}）：系统已就绪。推荐优先关注决策室方案 B（针对性放行 + 生物防控，净利 ¥30,000~¥35,000），三道门禁品质、合规与产能均已通过。如遇阵风超标或纯有机协议，方案 C 将自动翻转领跑。`,
      evidence: { label: "前往决策室 →", href: "/prescription" }
    };
  } else {
    return {
      answer: `Sentinel Briefing for Block ${activeField} (Top Risk: ${topRisk}, Day ${storeState.currentDay}): System operational. Plan B is currently recommended (Selective release + biocontrol, net ¥30,000~¥35,000), clearing Quality, Compliance, and Capacity gates. If wind gusts exceed thresholds or organic protocol required, Plan C automatically flips to lead.`,
      evidence: { label: "Enter Decision Room →", href: "/prescription" }
    };
  }
}

export function Assistant() {
  const { pathname, search } = useLocation();
  const archive = new URLSearchParams(search).get('run');
  const orderRun = new URLSearchParams(search).get('orderRun');
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);

  // Anti-abuse & Rate Limiter state
  const [queryCount, setQueryCount] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const { locale } = useStore();
  const isZh = locale === 'zh';

  const MAX_FREE_QUERIES = 10;
  const remainingQueries = isVip ? '∞' : Math.max(0, MAX_FREE_QUERIES - queryCount);

  const orderPage = ['/', '/sensors', '/business', '/risk', '/prescription', '/execution', '/audit', '/history'].includes(pathname);
  const scopedRun = orderRun ?? (orderPage ? currentRun : null);
  const thread = JSON.stringify([pathname, archive, scopedRun]);
  const visibleMessages = messages.filter(message => message.thread === thread);

  // Quick suggestion chips
  const quickChips = isZh ? [
    '方案B与方案C核心权衡',
    '为什么方案A被合规门禁否决？',
    '在什么工况下方案C会翻转为首选？',
    '900亩现代蓝莓工厂园区概况',
  ] : [
    'Trade-offs between Plan B and Plan C',
    'Why is Plan A blocked by compliance?',
    'Under what conditions will Plan C win?',
    '900-mu modern blueberry farm blueprint',
  ];

  useEffect(() => {
    if (!open || orderRun || !orderPage) return;
    const controller = new AbortController();
    async function refreshRun() {
      try {
        const response = await fetch('/api/order-run', { signal: controller.signal });
        if (!response.ok) return;
        const { run } = await response.json();
        if (!controller.signal.aborted) setCurrentRun(run?.id ?? null);
      } catch { /* Keep the last confirmed conversation scope. */ }
    }
    refreshRun();
    const timer = setInterval(refreshRun, 3000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [open, orderRun, orderPage]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSec <= 0) return;
    const t = setInterval(() => setCooldownSec(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldownSec]);

  const handleUnlockVip = (e) => {
    e.preventDefault();
    if (passcodeInput.trim() === 'sentinel2026') {
      setIsVip(true);
      setShowPasscodeModal(false);
      setPasscodeInput('');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  async function askQuestion(textToAsk) {
    const text = (textToAsk || question).trim();
    if (!text || busy || cooldownSec > 0) return;

    // Check rate limit quota
    if (!isVip && queryCount >= MAX_FREE_QUERIES) {
      setMessages(previous => [
        ...previous,
        {
          role: 'status',
          text: isZh
            ? '已达到演示会话提问上限 (10次)。请输入主讲人密码 (sentinel2026) 解锁无限次提问。'
            : 'Session query limit (10) reached. Enter presenter passcode (sentinel2026) to unlock.',
          thread
        }
      ]);
      setShowPasscodeModal(true);
      return;
    }

    const message = { role: 'user', text, thread };
    const conversation = [...visibleMessages, message];
    setMessages(previous => [...previous, message]);
    setQuestion('');
    setBusy(true);
    setQueryCount(c => c + 1);
    setCooldownSec(3); // 3-second anti-spam cooldown

    const farmState = useStore.getState();

    // 1. Try server endpoint first, fallback instantly to local authoritative engine if offline or serverless demo
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s quick timeout for serverless
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          conversation: conversation.filter(m => m.role !== 'status').slice(-9),
          mode: pathname.startsWith('/workspace') ? 'order' : 'farm',
          archive,
          orderRun: scopedRun,
          page: pathname,
          context: {
            field: farmState.fields[farmState.activeFieldId]?.name,
            day: farmState.currentDay,
            risks: (farmState.riskResults ?? []).slice(0, 5).map(({ name, score }) => ({ name, score })),
          }
        })
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        setMessages(previous => [...previous, { role: 'assistant', text: result.answer, evidence: result.evidence, thread }]);
        return;
      }
      throw new Error('Fallback to local engine');
    } catch {
      // In-browser self-contained closed-loop response
      setTimeout(() => {
        const localMatch = matchLocalAnswer(text, isZh, farmState);
        setMessages(previous => [...previous, { role: 'assistant', text: localMatch.answer, evidence: localMatch.evidence, thread }]);
        setBusy(false);
      }, 400);
      return;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ops-assistant">
      {open && (
        <section className="ops-chat" aria-label="Sentinel assistant" style={{ width: 440, maxHeight: 580, display: 'flex', flexDirection: 'column' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #1e293b', background: '#090d16' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="activity" size={16} color="#00e5a3" />
              <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
                {isZh ? 'Ask Sentinel 观衡智策智囊' : 'Ask Sentinel Decision AI'}
              </strong>
              {isVip ? (
                <span style={{ fontSize: '0.62rem', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                  VIP UNLIMITED
                </span>
              ) : (
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                  {isZh ? `额度: ${remainingQueries}/10` : `Quota: ${remainingQueries}/10`}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {!isVip && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPasscodeModal(true)}
                  style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4, height: 22 }}
                >
                  {isZh ? '解锁VIP' : 'Unlock VIP'}
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, height: 22 }}>
                ✕
              </button>
            </div>
          </header>

          {/* Quick chips bar */}
          <div style={{ padding: '8px 12px', background: '#0a101d', borderBottom: '1px solid #1e293b', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => askQuestion(chip)}
                disabled={busy || cooldownSec > 0}
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: 6,
                  color: '#38bdf8',
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'; }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="ops-messages" role="log" aria-live="polite" style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!visibleMessages.length && (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '0.78rem' }}>
                <p style={{ margin: '0 0 6px 0', color: '#94a3b8', fontWeight: 600 }}>
                  {isZh ? '900 亩蓝莓农业工厂专家决策智囊已就绪' : 'Sentinel 7.0 Operating Core Ready'}
                </p>
                <p style={{ margin: 0, fontSize: '0.7rem' }}>
                  {isZh ? '可点击上方预置芯片，或输入关于农艺、合规、PHI、用工及订单的问题。' : 'Click the quick chips above or ask about agronomy, compliance, PHI, or orders.'}
                </p>
              </div>
            )}
            {visibleMessages.map(({ role, text, evidence }, index) => (
              <div key={index} className={'ops-message ' + role} style={{
                background: role === 'user' ? 'rgba(56,189,248,0.1)' : role === 'assistant' ? '#0f172a' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${role === 'user' ? 'rgba(56,189,248,0.3)' : role === 'assistant' ? '#1e293b' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: 8, padding: '8px 12px', fontSize: '0.76rem', lineHeight: 1.5, color: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ color: role === 'user' ? '#38bdf8' : role === 'assistant' ? '#00e5a3' : '#ef4444', fontSize: '0.7rem' }}>
                    {role === 'user' ? (isZh ? '提问者' : 'You') : role === 'assistant' ? 'Sentinel Core (观衡智序)' : 'System Alert'}
                  </strong>
                </div>
                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{text}</p>
                {evidence && (
                  <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Link to={evidence.href} style={{ color: '#38bdf8', fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none' }}>
                      {evidence.label}
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.72rem', padding: '4px 8px' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00e5a3', animation: 'pulse 1s infinite' }} />
                {isZh ? '正在检索多智能体辩论知识库与审计证据…' : 'Synthesizing multi-agent expert evidence…'}
              </div>
            )}
          </div>

          {/* Passcode Unlock Modal */}
          {showPasscodeModal && (
            <div style={{ padding: '10px 14px', background: '#090d16', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
              <form onSubmit={handleUnlockVip} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="password"
                  placeholder={isZh ? "输入演示密码 (sentinel2026)" : "Enter passcode (sentinel2026)"}
                  value={passcodeInput}
                  onChange={e => { setPasscodeInput(e.target.value); setPasscodeError(false); }}
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.72rem', background: '#0f172a', border: `1px solid ${passcodeError ? '#ef4444' : '#334155'}`, borderRadius: 4, color: '#f8fafc' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem', height: 26 }}>
                  {isZh ? '解锁' : 'Unlock'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasscodeModal(false)} style={{ padding: '4px 8px', fontSize: '0.72rem', height: 26 }}>
                  ✕
                </button>
              </form>
              {passcodeError && <div style={{ fontSize: '0.62rem', color: '#ef4444', marginTop: 4 }}>{isZh ? '密码错误，请输入 sentinel2026' : 'Invalid passcode. Enter sentinel2026'}</div>}
            </div>
          )}

          {/* Input form */}
          <form onSubmit={(e) => { e.preventDefault(); askQuestion(); }} style={{ display: 'flex', padding: 8, background: '#090d16', borderTop: '1px solid #1e293b', gap: 6 }}>
            <input
              aria-label="Ask Sentinel"
              value={question}
              maxLength={800}
              onChange={event => setQuestion(event.target.value)}
              placeholder={cooldownSec > 0 ? (isZh ? `等待 ${cooldownSec} 秒冷却...` : `Wait ${cooldownSec}s...`) : (isZh ? "提问农艺决策、PHI合规、工班或订单..." : "Ask about decisions, PHI, crew, or orders...")}
              disabled={busy || cooldownSec > 0}
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#f8fafc' }}
            />
            <button className="btn btn-primary" disabled={busy || !question.trim() || cooldownSec > 0} style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
              {isZh ? '发送' : 'Send'}
            </button>
          </form>
        </section>
      )}
      <button className="btn btn-primary" aria-expanded={open} onClick={() => setOpen(value => !value)} style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 20, boxShadow: '0 4px 14px rgba(0,229,163,0.25)' }}>
        <Icon name="activity" size={14} color="#090d16" />
        <span style={{ fontWeight: 700 }}>{isZh ? 'Ask 观衡智策' : 'Ask Sentinel'}</span>
      </button>
    </div>
  );
}

export function Intelligence({ compact = false }) {
  const [data, setData] = useState(null);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/intelligence', { signal: controller.signal });
        if (!response.ok) throw Error('Feed unavailable');
        setData(await response.json());
        setOffline(false);
      } catch {
        if (!controller.signal.aborted) setOffline(true);
      }
    }
    load();
    const timer = setInterval(load, 60_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);
  const offer = data?.sourceRecords?.find(record => record.kind === 'published_offer');
  const calendar = data?.sourceRecords?.find(record => record.kind === 'official_holiday_calendar');
  return <section className={'ops-intelligence' + (compact ? '' : ' page')}>
    {compact ? <h2><Link to="/intelligence">Farm &amp; Market Intelligence →</Link></h2> : <h1>Market Intelligence</h1>}
    <p>Weather outlook, crop health reports and market context for the farm.</p>
    {offline && <p role="status">The intelligence service is unavailable.</p>}
    <div className="ops-panels">
      <article><h2>Yunnan weather outlook</h2>
        {data?.weather ? <><p>Kunming regional outlook · <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></p><ul>{data.weather.days.map(day => <li key={day.date}>{day.date} · {day.low}–{day.high} °C · {day.rain} mm precipitation</li>)}</ul><small>Retrieved {new Date(data.weather.fetchedAt).toLocaleString('en-GB')}{data.weatherStale ? ' · Update unavailable' : ''}</small></> : <p>{data ? 'Weather outlook unavailable.' : 'Checking weather…'}</p>}
      </article>
      <article><h2>Blueberry reference prices</h2><p>Yunnan order case · regional benchmark</p><p><strong>RMB 54/kg</strong> vs RMB 60/kg seven days earlier</p><small>Case reference · −10% · contract terms are separate.</small></article>
    </div>
    {!compact && offer && <article>
      <h2>Dated wholesale offer</h2>
      <p>{offer.region} · {offer.variety} blueberry · {offer.currency} {offer.price}/{offer.unit}</p>
      <a href={offer.source.url} target="_blank" rel="noreferrer">{offer.source.publisher} · {offer.publishedAt.slice(0, 10)}</a>
    </article>}
    {!compact && calendar && <article>
      <h2>Official holiday calendar</h2>
      <ul>{calendar.holidays.map(({ name, from, through }) => <li key={name}>{name} · {from} to {through}</li>)}</ul>
      <p>Make-up working days: {calendar.makeUpWorkDays.join(', ')}</p>
      <a href={calendar.source.url} target="_blank" rel="noreferrer">{calendar.source.document}</a>
    </article>}
    <article><h2>Agriculture news &amp; crop health</h2><p>Source discovery via <a href="https://www.gdeltproject.org/" target="_blank" rel="noreferrer">GDELT</a>.</p>
      {data?.news?.items.length ? <ul className="ops-news">{data.news.items.slice(0, compact ? 3 : 10).map(item => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a><small>{item.domain} · {item.seenDate || 'Date unavailable'}</small></li>)}</ul> : <p>{data ? 'No matching source articles available.' : 'Checking news sources…'}</p>}
      {data?.newsStale && <small role="status">Latest update unavailable.</small>}
    </article>
  </section>;
}
