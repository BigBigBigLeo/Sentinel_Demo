import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Assistant, OperationsHeartbeat, OrderRunPanel } from '../demo/Operations.jsx';
import useStore from '../engine/store';
import { aiWatchdog } from '../data/mockData';
import PageClock from './PageClock';
import Icon from './Icon';
import SubtitleOverlay from './SubtitleOverlay';
import IterativeReasoningOverlay from './IterativeReasoningOverlay';
import { pick, formatLocaleTime } from '../i18n/locale.js';

const navGroups = [
    {
        titleEn: '1. OBSERVE',
        titleZh: '1. 感知层 OBSERVE',
        items: [
            { path: '/sensors', label: 'Sensors Telemetry', labelZh: '传感遥测', iconName: 'sensors' },
            { path: '/intelligence', label: 'Market Intelligence', labelZh: '全域情报', iconName: 'activity' },
        ]
    },
    {
        titleEn: '2. ORIENT',
        titleZh: '2. 认知层 ORIENT',
        items: [
            { path: '/business', label: 'Farm Business & KA', labelZh: '业务与订单', iconName: 'layers' },
            { path: '/risk', label: 'Risk Assessment', labelZh: '风险研判', iconName: 'risk', alertKey: 'risk' },
        ]
    },
    {
        titleEn: '3. DECIDE',
        titleZh: '3. 决策层 DECIDE',
        items: [
            { path: '/prescription', label: 'Prescription Matrix', labelZh: '处方决策矩阵', iconName: 'prescription' },
            { path: '/scenarios', label: 'Scenario Sandbox', labelZh: '情景推演沙盒', iconName: 'scenarios' },
        ]
    },
    {
        titleEn: '4. ACT',
        titleZh: '4. 执行层 ACT',
        items: [
            { path: '/execution', label: 'Autonomous Dispatch', labelZh: '自治派发调度', iconName: 'execution' },
        ]
    },
    {
        titleEn: '5. PROVE',
        titleZh: '5. 存证层 PROVE',
        items: [
            { path: '/audit', label: 'Audit & Provenance', labelZh: '审计与溯源凭证', iconName: 'audit' },
            { path: '/history', label: 'Operational History', labelZh: '历史复盘全景', iconName: 'history' },
        ]
    },
    {
        titleEn: '6. GOVERN',
        titleZh: '6. 治理层 GOVERN',
        items: [
            { path: '/admin', label: 'Policy Sandbox', labelZh: '策略规则沙盘', iconName: 'admin' },
        ]
    }
];

export default function Layout() {
    const { pathname } = useLocation();
    const orderSection = pathname.slice(1);
    const {
        activeFieldId,
        setActiveField,
        fields,
        activeScenario,
        scenarioStep,
        initSimulation,
        currentDay,
        approvalQueue,
        loadScenario,
        autonomousMode,
        setAutonomousMode,
        autonomousState,
        startAutonomousLoop,
        stopAutonomousLoop,
        riskResults,
        operatorAlerts,
        activeExecution,
        locale,
        setLocale,
        spatialScope,
        setSpatialScope,
    } = useStore();
    const navigate = useNavigate();
    const t = (en, zh) => pick(locale, en, zh);

    useEffect(() => {
        initSimulation();
        startAutonomousLoop();
        return () => stopAutonomousLoop();
    }, [initSimulation, startAutonomousLoop, stopAutonomousLoop]);

    const topRiskScore = riskResults?.[0]?.score || 0;
    const showRiskBadge = approvalQueue.length > 0
        || (operatorAlerts?.length || 0) > 0
        || (topRiskScore >= 70 && !activeExecution?.comparisonReport);

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <img src="/sentinel_logo.png" alt="Sentinel" className="sidebar-logo" style={{ width: 52, height: 52, filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.3))' }} />
                    <div>
                        <div className="sidebar-title" style={{ fontSize: '1.25rem', letterSpacing: 3, fontWeight: 800 }}>SENTINEL</div>
                        <div className="sidebar-subtitle" style={{ letterSpacing: 1, fontSize: '0.62rem', color: '#38bdf8', fontWeight: 600 }}>{t('GuanHeng · Decision OS', '观衡智序 · 战略决策系统')}</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {/* Level 0: Strategic Mission Control Cockpit (Above OODA Loops) */}
                    <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                        <div className="sidebar-section-label" style={{ padding: '0 10px 4px', fontSize: '0.62rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px' }}>
                            LEVEL 0 · {t('STRATEGIC FLIGHT DECK', '全域战略座舱')}
                        </div>
                        <NavLink
                            to="/"
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            end
                            style={({ isActive }) => ({
                                position: 'relative',
                                margin: '2px 0',
                                background: isActive ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.18), rgba(2, 132, 199, 0.05))' : 'rgba(15, 23, 42, 0.4)',
                                border: isActive ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.4)',
                                borderRadius: 6,
                                padding: '8px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.25)' : 'none',
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className="sidebar-icon" style={{ display: 'flex', alignItems: 'center' }}>
                                        <Icon name="dashboard" size={17} color={isActive ? '#38bdf8' : '#94a3b8'} />
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isActive ? '#38bdf8' : '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {t('Mission Control', '全域战备指挥中心')}
                                        </div>
                                        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
                                            {t('Common Operating Picture', '900亩全景态势一张图')}
                                        </div>
                                    </div>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5a3', boxShadow: '0 0 6px #00e5a3' }} />
                                </>
                            )}
                        </NavLink>
                    </div>

                    {navGroups.map(group => (
                        <div key={group.titleEn} className="sidebar-group" style={{ marginBottom: 10 }}>
                            <div className="sidebar-section-label" style={{ padding: '4px 10px 2px', fontSize: '0.62rem', fontWeight: 800, color: '#475569', letterSpacing: '1px' }}>
                                {t(group.titleEn, group.titleZh)}
                            </div>
                            {group.items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                    end={item.path === '/'}
                                    style={{ position: 'relative', margin: '1px 0' }}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className="sidebar-icon">
                                                <Icon name={item.iconName} size={15} className="nav-icon" color={isActive ? '#38bdf8' : '#64748b'} />
                                            </span>
                                            <span className="sidebar-label" style={{ fontSize: '0.78rem' }}>{t(item.label, item.labelZh)}</span>
                                            {item.alertKey === 'risk' && showRiskBadge && <span className="nav-badge" />}
                                            {item.path === '/prescription' && approvalQueue.length > 0 && (
                                                <span className="nav-approval-badge">{approvalQueue.length}</span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div style={{ fontSize: '0.6rem', color: '#475569', marginBottom: 4 }}>
                        {t('Season', '季节阶段')}: {t('Flowering', '开花期')} {'->'} {t('Harvest', '采收期')}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#475569' }}>
                        {t('Day', '第')} {currentDay || 18} / 120
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 6 }}>
                        {t('Sentinel Engine v4.2', 'Sentinel 引擎 v4.2')}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {t('Build 2026.03', '构建 2026.03')}
                    </div>
                </div>
            </aside>

            <div className="main-wrapper">
                <header className="topbar">
                    <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div className="spatial-scope-cabin" style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(15, 23, 42, 0.75)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            borderRadius: 8,
                            padding: '2px 4px',
                            gap: 3,
                            backdropFilter: 'blur(8px)',
                        }}>
                            {[
                                { id: 'all', labelEn: '900-Mu Global', labelZh: '900亩全域', defaultField: 'BS-B3' },
                                { id: 'zone-a', labelEn: 'Zone A Greenhouse (350μ)', labelZh: 'A区 智能温室 (350亩)', defaultField: 'BS-B3' },
                                { id: 'zone-b', labelEn: 'Zone B Rain Shelter (400μ)', labelZh: 'B区 避雨大棚 (400亩)', defaultField: 'YN-A2' },
                                { id: 'zone-c', labelEn: 'Zone C CA Storage (150μ)', labelZh: 'C区 气调中心 (150亩)', defaultField: 'ZONE-C' },
                            ].map(btn => {
                                const isActive = (spatialScope || 'all') === btn.id;
                                return (
                                    <button
                                        key={btn.id}
                                        type="button"
                                        onClick={() => {
                                            setSpatialScope(btn.id);
                                            if (btn.defaultField && fields[btn.defaultField]) {
                                                setActiveField(btn.defaultField);
                                            }
                                        }}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: 6,
                                            border: isActive ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid transparent',
                                            background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.15))' : 'transparent',
                                            color: isActive ? '#38bdf8' : '#94a3b8',
                                            fontSize: '0.68rem',
                                            fontWeight: isActive ? 700 : 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            whiteSpace: 'nowrap',
                                        }}
                                        title={locale === 'zh' ? `切换至${btn.labelZh}` : `Switch to ${btn.labelEn}`}
                                    >
                                        {locale === 'zh' ? btn.labelZh : btn.labelEn}
                                    </button>
                                );
                            })}
                        </div>

                        <select
                            className="field-selector"
                            value={activeFieldId}
                            onChange={e => setActiveField(e.target.value)}
                            style={{
                                fontSize: '0.7rem',
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: 'rgba(30, 41, 59, 0.8)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                color: '#94a3b8',
                                height: 28,
                            }}
                        >
                            {Object.values(fields).map(f => (
                                <option key={f.id} value={f.id}>{locale === 'zh' ? (f.nameZh || f.name) : f.name}</option>
                            ))}
                        </select>

                        {activeScenario && (
                            <>
                                <div className="scenario-indicator">
                                    <span className="scenario-dot" style={{ background: activeScenario.riskLevel === 'critical' ? '#ef4444' : activeScenario.riskLevel === 'high' ? '#f59e0b' : '#3dabf5' }} />
                                    <span>{t('Scenario', '场景')} {activeScenario.id}: {locale === 'zh' ? (activeScenario.nameZh || activeScenario.name) : activeScenario.name}</span>
                                    <span className="scenario-progress">{t('Step', '步骤')} {scenarioStep}/{activeScenario.events.length}</span>
                                </div>
                                <button
                                    className="btn-return-scenarios"
                                    onClick={() => { loadScenario(null); navigate('/scenarios'); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '5px 14px', borderRadius: 8,
                                        background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(100,116,139,0.25)',
                                        color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.12)'; e.currentTarget.style.color = '#34d399'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.7)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.25)'; }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                                    {t('Return to Scenarios', '返回场景中心')}
                                </button>
                            </>
                        )}
                    </div>

                    <div className="topbar-right">
                        <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
                            <button
                                type="button"
                                className={`btn ${locale === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ minWidth: 54, padding: '5px 10px', fontSize: '0.68rem' }}
                                onClick={() => setLocale('en')}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                className={`btn ${locale === 'zh' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ minWidth: 54, padding: '5px 10px', fontSize: '0.68rem', marginLeft: 6 }}
                                onClick={() => setLocale('zh')}
                            >
                                {t('Chinese', '中文')}
                            </button>
                        </div>
                        <button
                            className={`btn ${autonomousMode ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => setAutonomousMode(!autonomousMode)}
                            style={{ marginRight: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <Icon name={autonomousMode ? 'play' : 'pause'} size={12} />
                            {t('Auto Loop', '自动循环')} {autonomousMode ? t('On', '开') : t('Off', '关')}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(56,189,248,0.08)', borderRadius: 8, marginRight: 8, border: '1px solid rgba(56,189,248,0.2)' }}>
                            <Icon name="activity" size={12} color="#38bdf8" />
                            <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700 }}>{t('Cycle', '轮次')} {autonomousState.cycleCount}</span>
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                                {autonomousState.status === 'running'
                                    ? t('running', '运行中')
                                    : autonomousState.status === 'paused'
                                        ? t('paused', '已暂停')
                                        : autonomousState.status === 'stopped'
                                            ? t('stopped', '已停止')
                                            : autonomousState.status}
                            </span>
                        </div>

                        {approvalQueue.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(245,158,11,0.08)', borderRadius: 8, marginRight: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                                <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="warning" size={12} color="#f59e0b" /> {approvalQueue.length} {t('Pending Approval', '待人工审批')}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(52,211,153,0.06)', borderRadius: 8, marginRight: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'watchdog-pulse 2s infinite' }} />
                            <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>{t('AI Active', 'AI 在线')}</span>
                            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                {t('Last scan', '最近扫描')}{' '}
                                {formatLocaleTime(locale, aiWatchdog.lastScan, { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                        </div>

                        <PageClock />

                        <div className="topbar-status">
                            <span className="status-light" />
                            <span>{t('System Online', '系统在线')}</span>
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    {orderSection === 'risk' && !activeScenario && <OperationsHeartbeat detail />}
                    {['', 'sensors', 'risk', 'execution', 'audit', 'history', 'business'].includes(orderSection) && <OrderRunPanel key={orderSection} section={orderSection} />}
                    <Outlet />
                </main>
                <SubtitleOverlay />
            </div>
            <IterativeReasoningOverlay />
            <Assistant />
        </div>
    );
}
