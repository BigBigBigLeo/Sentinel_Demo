import React, { useState } from 'react';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import Icon from '../components/Icon';
import MLFeedbackPanel from '../components/MLFeedbackPanel';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { pick, localeTag } from '../i18n/locale.js';

const PRE_AUDIT_CHECKS = [
    {
        id: 'phi',
        name: 'Pre-Harvest Interval (PHI)',
        nameZh: '采前间隔（PHI）',
        detail: 'Mancozeb requires 14 days PHI; 30 days remain before harvest.',
        detailZh: '代森锰锌采前间隔要求 14 天，距采收仍有 30 天，满足要求。',
        status: 'pass',
        standard: 'GB/T 8321',
    },
    {
        id: 'banned',
        name: 'Banned Substance Screening',
        nameZh: '禁限用成分筛查',
        detail: 'Active ingredients are not on China banned/restricted list.',
        detailZh: '有效成分不在国内禁限用清单内，合规通过。',
        status: 'pass',
        standard: 'MoA Banned List',
    },
    {
        id: 'dose',
        name: 'Dosage Accuracy',
        nameZh: '施药剂量准确性',
        detail: 'Applied 850 ml/mu against 900 ml/mu recommendation (94.4%).',
        detailZh: '实际施药 850 ml/亩，对照建议 900 ml/亩，执行达成率 94.4%。',
        status: 'pass',
        standard: 'Label Rate',
    },
    {
        id: 'wind',
        name: 'Wind Compliance at Spray Time',
        nameZh: '施药风速合规',
        detail: 'Wind 1.8 m/s, below 3.0 m/s limit for spraying.',
        detailZh: '施药时风速 1.8 m/s，低于 3.0 m/s 限值，可安全作业。',
        status: 'pass',
        standard: 'GB/T 17980',
    },
    {
        id: 'buffer',
        name: 'Buffer Zone Compliance',
        nameZh: '缓冲区合规',
        detail: '10 m no-spray buffer from water bodies was maintained.',
        detailZh: '水体周边 10 米缓冲区执行到位，未发生越界喷施。',
        status: 'pass',
        standard: 'Env. Protection',
    },
    {
        id: 'moa',
        name: 'MOA Rotation Check',
        nameZh: '作用机理轮换检查',
        detail: 'M03 group last used over 21 days ago, rotation is valid.',
        detailZh: 'M03 组上次使用已超过 21 天，轮换策略有效。',
        status: 'pass',
        standard: 'Resistance Mgmt',
    },
    {
        id: 'confidence',
        name: 'Confidence Gate (>= 75%)',
        nameZh: '模型置信门槛（>=75%）',
        detail: 'After 3 reasoning rounds, model confidence reached 87.2%.',
        detailZh: '经过 3 轮推理，模型置信度达到 87.2%，通过门槛。',
        status: 'pass',
        standard: 'AI Decision Policy',
    },
];

const REPORT_SECTIONS = [
    {
        id: 'ingestion',
        title: '1. Data Ingestion Summary',
        titleZh: '1. 数据接入概览',
        icon: 'perception',
        timestamp: '2026-03-04T00:45:12+08:00',
        content: [
            {
                label: 'Sensor Data Points',
                labelZh: '传感数据量',
                value: '24 sensors x 288 readings/day = 6,912 data points',
                valueZh: '24 路传感器 x 288 次/日 = 6,912 条数据',
            },
            {
                label: 'Multimodal Imagery',
                labelZh: '多模态影像',
                value: '6 captures (RGB, NDVI, Thermal, Satellite, Hyperspectral, Leaf Wetness)',
                valueZh: '6 类采集（RGB、NDVI、热成像、卫星、高光谱、叶面湿度）',
            },
            {
                label: 'Weather Feed',
                labelZh: '天气数据源',
                value: '48h forecast ingested from 3 providers',
                valueZh: '已接入 3 个来源的 48 小时天气预报',
            },
            {
                label: 'Historical Reference',
                labelZh: '历史样本参照',
                value: '7 past decisions and 3 execution records cross-referenced',
                valueZh: '交叉比对 7 条历史决策与 3 条执行记录',
            },
            {
                label: 'Pest Monitoring',
                labelZh: '虫情监测',
                value: '3 trap stations reporting, 35 counts/day aggregate',
                valueZh: '3 个虫情点位持续上报，日均累计 35 次计数',
            },
        ],
    },
    {
        id: 'risk',
        title: '2. Risk Assessment Record',
        titleZh: '2. 风险评估记录',
        icon: 'alert-triangle',
        timestamp: '2026-03-04T00:45:14+08:00',
        content: [
            {
                label: 'Threats Evaluated',
                labelZh: '评估威胁数',
                value: '5 threats across 2 fields',
                valueZh: '覆盖 2 个地块，共评估 5 类威胁',
            },
            {
                label: 'Highest Risk',
                labelZh: '最高风险项',
                value: 'Gray Mold (Botrytis) - 82/100 CRITICAL',
                valueZh: '灰霉病（Botrytis）82/100，判定为高危',
            },
            {
                label: 'Evidence Sources',
                labelZh: '证据来源',
                value: '12 multimodal data sources analyzed',
                valueZh: '已完成 12 路多模态证据联合分析',
            },
            {
                label: 'Decision Type',
                labelZh: '决策类型',
                value: 'Critical case routed to human approval queue',
                valueZh: '高危案例，已流转至人工审批队列',
            },
            {
                label: 'Revenue at Risk',
                labelZh: '潜在营收风险',
                value: 'CNY 36,800 potential loss if untreated',
                valueZh: '若不处理，预计损失 CNY 36,800',
            },
        ],
    },
    {
        id: 'prescription',
        title: '3. Prescription Record',
        titleZh: '3. 处方生成记录',
        icon: 'prescription',
        timestamp: '2026-03-04T00:45:16+08:00',
        content: [
            { label: 'Rx ID', labelZh: '处方编号', value: 'RX-20260304-001', valueZh: 'RX-20260304-001' },
            {
                label: 'Action',
                labelZh: '处置动作',
                value: 'Spot spray - Mancozeb 70% WP (85% dosage)',
                valueZh: '局部喷施：代森锰锌 70% WP（85% 剂量）',
            },
            {
                label: 'Target',
                labelZh: '处理目标',
                value: 'Gray Mold in Zones B3-East/West',
                valueZh: 'B3 东/西分区灰霉病高风险点',
            },
            {
                label: 'Alternatives Considered',
                labelZh: '备选方案评估',
                value: '4 options (Biocontrol, Manual, Iprodione, Wait)',
                valueZh: '已评估 4 套备选（生防、人工、异菌脲、延后）',
            },
            {
                label: 'Constraints Passed',
                labelZh: '约束校验结果',
                value: '7/7 checks passed (PHI, Wind, Banned, MOA, Buffer, Dose, Confidence)',
                valueZh: '7/7 约束全部通过（PHI、风速、禁限用、MOA、缓冲区、剂量、置信度）',
            },
        ],
    },
    {
        id: 'approval',
        title: '4. Human Approval Record',
        titleZh: '4. 人工审批记录',
        icon: 'lock',
        timestamp: '2026-03-04T00:45:18+08:00',
        content: [
            {
                label: 'Approval Trigger',
                labelZh: '审批触发条件',
                value: 'Yes - risk score 82/100 exceeds 70 threshold',
                valueZh: '已触发：风险分 82/100，高于 70 分阈值',
            },
            { label: 'Reviewed By', labelZh: '审批角色', value: 'Field Operator (Human)', valueZh: '一线农场操作员（人工）' },
            { label: 'Review Time', labelZh: '审批时长', value: '8 minutes (within 15-min SLA)', valueZh: '8 分钟（满足 15 分钟 SLA）' },
            { label: 'Decision', labelZh: '审批结论', value: 'APPROVED', valueZh: '已通过' },
            {
                label: 'Notes',
                labelZh: '审批备注',
                value: 'Visual symptoms confirmed and aligned with AI analysis',
                valueZh: '现场目检症状与 AI 诊断一致，批准执行。',
            },
        ],
    },
    {
        id: 'execution',
        title: '5. Execution Record',
        titleZh: '5. 执行记录',
        icon: 'play',
        timestamp: '2026-03-04T00:45:20+08:00',
        content: [
            {
                label: 'Actors Deployed',
                labelZh: '执行主体',
                value: '5 actors (2 drones, 1 IoT system, 1 field team, 1 facility)',
                valueZh: '共 5 个执行主体（2 架无人机、1 套 IoT 系统、1 支地面团队、1 个设施单元）',
            },
            { label: 'Total Duration', labelZh: '总耗时', value: '3h 00min', valueZh: '3 小时 00 分' },
            { label: 'Coverage', labelZh: '执行覆盖率', value: '97% average across all zones', valueZh: '全分区平均覆盖率 97%' },
            { label: 'Issues', labelZh: '异常情况', value: 'None - wind stayed below threshold', valueZh: '无异常，作业期间风速持续低于阈值' },
            {
                label: 'Chemical Used',
                labelZh: '药剂用量',
                value: '10.2L Mancozeb (94.4% of recommended)',
                valueZh: '代森锰锌 10.2L（占建议量 94.4%）',
            },
        ],
    },
    {
        id: 'verification',
        title: '6. Post-Execution Verification',
        titleZh: '6. 执行后验证',
        icon: 'check',
        timestamp: '2026-03-04T02:45:00+08:00',
        content: [
            {
                label: 'Sensor Check (+2h)',
                labelZh: '传感复核（+2h）',
                value: 'Humidity dropped 92% -> 74%; spore count decreased by 88%',
                valueZh: '湿度由 92% 降至 74%，孢子计数下降 88%',
            },
            {
                label: 'Sensor Check (+24h)',
                labelZh: '传感复核（+24h）',
                value: 'Botrytis spores down to 12% of pre-treatment level; no spread',
                valueZh: '灰霉孢子降至处理前的 12%，未见扩散迹象',
            },
            {
                label: 'Visual Inspection',
                labelZh: '现场目检',
                value: 'Field Team A confirmed no new lesions in treated zones',
                valueZh: 'A 组复核确认处理区域无新增病斑',
            },
            {
                label: 'Adjacent Zones',
                labelZh: '邻区影响',
                value: 'No cross-contamination in B3-South and B3-North',
                valueZh: 'B3 南/北邻区未检测到交叉污染',
            },
            {
                label: 'Drone Re-Scan',
                labelZh: '无人机复扫',
                value: 'NDVI normalized; no stress signatures observed',
                valueZh: 'NDVI 恢复正常，未见明显胁迫信号',
            },
        ],
    },
    {
        id: 'evaluation',
        title: '7. AI Evaluation & Conclusion',
        titleZh: '7. AI 复盘与结论',
        icon: 'reasoning',
        timestamp: '2026-03-04T02:50:00+08:00',
        content: [
            {
                label: 'Effectiveness',
                labelZh: '处置有效性',
                value: '95% - exceeded 85% target for botrytis containment',
                valueZh: '处置有效率 95%，高于 85% 目标线',
            },
            {
                label: 'Cost Efficiency',
                labelZh: '成本收益',
                value: 'CNY 3,500 cost vs. CNY 22,000 avoided loss = 6.3x ROI',
                valueZh: '投入 CNY 3,500，避免损失 CNY 22,000，ROI 约 6.3x',
            },
            {
                label: 'Key Learning',
                labelZh: '关键经验',
                value: 'AI watchdog enabled 4h earlier response than manual process',
                valueZh: 'AI 看门狗使响应提前约 4 小时，显著压缩决策延迟',
            },
            {
                label: 'Model Update',
                labelZh: '模型更新',
                value: 'Case appended to training set as data point #847,001',
                valueZh: '案例已回流训练集，新增样本点 #847,001',
            },
            {
                label: 'Recommendation',
                labelZh: '后续建议',
                value: 'Schedule verification scan in 72h and keep elevated monitoring',
                valueZh: '建议 72 小时后复扫，并维持高频监测。',
            },
        ],
    },
];

const DECISION_TRAIL = [
    {
        timestamp: '00:45:12',
        event: 'Sensor anomaly detected - humidity > 85%',
        eventZh: '检测到传感异常：湿度 > 85%',
        actor: 'AI Watchdog',
        actorZh: 'AI 看门狗',
        hash: '0x7f3a..c1e2',
    },
    {
        timestamp: '00:45:14',
        event: 'Risk assessment initiated - 12 sources queried',
        eventZh: '启动风险评估：联合调用 12 路数据源',
        actor: 'Decision Engine',
        actorZh: '决策引擎',
        hash: '0x8d2b..f4a1',
    },
    {
        timestamp: '00:45:16',
        event: 'Prescription generated - Mancozeb 70% WP',
        eventZh: '生成处方：代森锰锌 70% WP',
        actor: 'Rx Builder',
        actorZh: '处方构建代理',
        hash: '0x91c3..d5b7',
    },
    {
        timestamp: '00:45:18',
        event: 'Critical risk >= 70 - routed to human approval',
        eventZh: '风险 >= 70，已升级至人工审批',
        actor: 'Approval Gate',
        actorZh: '审批闸门',
        hash: '0xa4e5..e8c3',
    },
    {
        timestamp: '00:53:22',
        event: 'Human approved - visual confirmation matched',
        eventZh: '人工审批通过：现场目检与系统结论一致',
        actor: 'Field Operator',
        actorZh: '现场操作员',
        hash: '0xb7f6..f9d4',
    },
    {
        timestamp: '01:00:00',
        event: 'Execution initiated - 5 actors deployed',
        eventZh: '启动执行：5 个执行主体协同到位',
        actor: 'Execution Engine',
        actorZh: '执行引擎',
        hash: '0xc8a7..a1e5',
    },
    {
        timestamp: '02:45:00',
        event: 'Post-execution verification - spore count -88%',
        eventZh: '执行后验证：孢子计数下降 88%',
        actor: 'Verification Agent',
        actorZh: '验证代理',
        hash: '0xd9b8..b2f6',
    },
    {
        timestamp: '02:50:00',
        event: 'Audit report compiled and recorded',
        eventZh: '审计报告汇编完成并写入归档',
        actor: 'Audit Engine',
        actorZh: '审计引擎',
        hash: '0xeac9..c3a7',
    },
];

export default function AuditReport() {
    const { fields, activeFieldId, locale } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';
    const field = fields[activeFieldId];
    const now = new Date().toLocaleString(localeTag(locale), {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const [visibleSections, setVisibleSections] = useState(0);
    const [generating, setGenerating] = useState(false);
    const [distribution, setDistribution] = useState({
        regulatory: true,
        client: true,
        mlTraining: true,
        archive: true,
    });

    const handleGenerate = () => {
        setGenerating(true);
        setVisibleSections(0);
        let i = 0;
        const timer = setInterval(() => {
            i += 1;
            setVisibleSections(i);
            if (i >= REPORT_SECTIONS.length) {
                clearInterval(timer);
                setGenerating(false);
            }
        }, 800);
    };

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="audit" size={22} color="#38bdf8" />
                        {t('Audit Report', '审计报告')}
                    </h1>
                    <p className="page-subtitle">
                        {t('Stage 6: Audit & Compliance', '阶段 6：审计与合规')} - {isZh ? (field?.nameZh || field?.name) : field?.name} | {now}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {visibleSections < REPORT_SECTIONS.length && (
                        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                            {generating ? t('Generating...', '生成中...') : t('Generate Audit Report', '生成审计报告')}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <MetricCard
                    label={t('Checks Passed', '通过检查')}
                    value={`${PRE_AUDIT_CHECKS.filter(c => c.status === 'pass').length}/${PRE_AUDIT_CHECKS.length}`}
                    status="monitoring"
                    subtitle={t('compliance gates', '合规关卡')}
                />
                <MetricCard label={t('Data Sources', '数据来源')} value="12" subtitle={t('multimodal sources audited', '已审计多模态来源')} />
                <MetricCard
                    label={t('Report Sections', '报告章节')}
                    value={`${visibleSections}/${REPORT_SECTIONS.length}`}
                    status={visibleSections >= REPORT_SECTIONS.length ? 'monitoring' : 'elevated'}
                    subtitle={t('auto-generated', '自动生成')}
                />
                <MetricCard label={t('Confidence', '置信度')} value="87.2%" status="monitoring" subtitle={t('model confidence', '模型置信度')} />
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">{t('Pre-Execution Compliance Checks', '执行前合规检查')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {PRE_AUDIT_CHECKS.map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(15,23,42,0.4)', borderRadius: 8 }}>
                            <Icon name={item.status === 'pass' ? 'check' : 'alert-triangle'} size={14} color={item.status === 'pass' ? '#34d399' : '#ef4444'} />
                            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.82rem', minWidth: 200 }}>{isZh ? item.nameZh : item.name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', flex: 1 }}>{isZh ? item.detailZh : item.detail}</span>
                            <span style={{ fontSize: '0.6rem', color: '#475569', fontFamily: 'monospace' }}>{item.standard}</span>
                            <StatusBadge status={item.status === 'pass' ? 'monitoring' : 'critical'} label={isZh ? (item.status === 'pass' ? '通过' : '失败') : item.status.toUpperCase()} />
                        </div>
                    ))}
                </div>
            </div>

            {visibleSections > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <h3 className="section-title">{t('Auto-Generated Audit Report', '自动生成审计报告')}</h3>
                    {REPORT_SECTIONS.slice(0, visibleSections).map((section) => (
                        <div key={section.id} className="card" style={{ marginBottom: 12, animation: 'fade-in 0.5s ease', borderLeft: '3px solid #38bdf8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <Icon name={section.icon} size={16} color="#38bdf8" />
                                <h3 className="card-title" style={{ marginBottom: 0 }}>{isZh ? section.titleZh : section.title}</h3>
                                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace' }}>
                                    {new Date(section.timestamp).toLocaleString(localeTag(locale), {
                                        year: 'numeric',
                                        month: 'short',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false,
                                    })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {section.content.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(30,41,59,0.5)', fontSize: '0.78rem' }}>
                                        <span style={{ color: '#64748b', minWidth: 180, fontWeight: 600 }}>{isZh ? item.labelZh : item.label}</span>
                                        <span style={{ color: '#e2e8f0' }}>{isZh ? item.valueZh : item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {generating && (
                <div className="card" style={{ textAlign: 'center', padding: 20, borderLeft: '3px solid #f59e0b' }}>
                    <Icon name="reasoning" size={20} color="#f59e0b" />
                    <div style={{ color: '#f59e0b', fontWeight: 600, marginTop: 8 }}>
                        {t(`Generating section ${visibleSections + 1} of ${REPORT_SECTIONS.length}...`, `正在生成第 ${visibleSections + 1}/${REPORT_SECTIONS.length} 节...`)}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 4 }}>
                        {t('Auto-compiling from execution data, sensor readings, and AI analysis', '正在基于执行数据、传感读数与 AI 结论自动汇编')}
                    </div>
                </div>
            )}

            {visibleSections >= REPORT_SECTIONS.length && (
                <div className="card" style={{ marginBottom: 16, background: 'rgba(52,211,153,0.02)', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="chevron-right" size={16} color="#34d399" /> {t('Report Distribution', '报告分发')}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                        {[
                            { key: 'regulatory', label: t('Regulatory Agency', '监管机构'), desc: t('Compliance submission package', '合规报送包') },
                            { key: 'client', label: t('Client Portal', '客户门户'), desc: t('Farm owner dashboard sync', '同步到农场客户看板') },
                            { key: 'mlTraining', label: t('ML Training Pipeline', 'ML 训练管线'), desc: t('Case backfeed for model tuning', '案例回流用于模型优化') },
                            { key: 'archive', label: t('Permanent Archive', '永久归档'), desc: t('Immutable audit evidence', '不可篡改的审计证据') },
                        ].map(target => (
                            <label
                                key={target.key}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 14px',
                                    background: 'rgba(15,23,42,0.4)',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    border: distribution[target.key] ? '1px solid rgba(52,211,153,0.3)' : '1px solid var(--border-subtle)',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={distribution[target.key]}
                                    onChange={e => setDistribution({ ...distribution, [target.key]: e.target.checked })}
                                    style={{ accentColor: '#34d399' }}
                                />
                                <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{target.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{target.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                    <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }}>
                        <Icon name="check" size={14} /> {t('Submit Audit Report to', '提交审计报告到')} {Object.values(distribution).filter(Boolean).length} {t('Destinations', '个目标')}
                    </button>
                </div>
            )}

            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">{t('Decision Loop - Provenance Trail', '决策闭环｜溯源链路')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {DECISION_TRAIL.map((stage, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderLeft: '2px solid #38bdf8', fontSize: '0.78rem' }}>
                            <span style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace', minWidth: 80 }}>{stage.timestamp}</span>
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{isZh ? stage.eventZh : stage.event}</span>
                            <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: 'auto' }}>{isZh ? stage.actorZh : stage.actor}</span>
                            <span style={{ fontSize: '0.6rem', color: '#334155', fontFamily: 'monospace' }}>{stage.hash}</span>
                        </div>
                    ))}
                </div>
            </div>

            <MLFeedbackPanel />
        </div>
    );
}
