import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useStore from '../engine/store';
import { aiWatchdog, trendAlerts } from '../data/mockData';
import PageClock from './PageClock';

const navItems = [
    { path: '/', label: 'Dashboard', labelZh: '指挥中心', iconName: 'dashboard' },
    { path: '/sensors', label: 'Sensor Telemetry', labelZh: '传感数据', iconName: 'sensors' },
    { path: '/risk', label: 'Risk Assessment', labelZh: '风险评估', iconName: 'risk', alertKey: 'risk' },
    { path: '/prescription', label: 'Prescription', labelZh: '处方', iconName: 'prescription' },
    { path: '/execution', label: 'Execution', labelZh: '执行', iconName: 'execution' },
    { path: '/audit', label: 'Audit Report', labelZh: '审计', iconName: 'audit' },
    { path: '/history', label: 'History', labelZh: '历史', iconName: 'history' },
    { path: '/scenarios', label: 'Scenarios', labelZh: '场景', iconName: 'scenarios' },
    { path: '/admin', label: 'Admin', labelZh: '配置', iconName: 'admin' },
];

const renderIcon = (name) => {
    const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "nav-icon" };
    switch (name) {
        case 'dashboard': return <svg {...p}><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>;
        case 'sensors': return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
        case 'risk': return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
        case 'prescription': return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
        case 'execution': return <svg {...p}><polygon points="5 3 19 12 5 21 5 3" /></svg>;
        case 'audit': return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
        case 'history': return <svg {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
        case 'scenarios': return <svg {...p}><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg>;
        case 'admin': return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
        default: return <svg {...p}><circle cx="12" cy="12" r="10" /></svg>;
    }
};

// Check if any active alerts exist for the sidebar badge
const hasActiveAlerts = () => {
    const allAlerts = [...(trendAlerts['BS-B3'] || []), ...(trendAlerts['YN-A2'] || [])];
    return allAlerts.filter(a => a.status === 'active' && (a.severity === 'critical' || a.severity === 'warning')).length > 0;
};

export default function Layout() {
    const { activeFieldId, setActiveField, fields, activeScenario, scenarioStep, initSimulation, currentDay, approvalQueue } = useStore();

    useEffect(() => {
        initSimulation();
    }, [initSimulation]);

    const showAlertBadge = hasActiveAlerts();

    return (
        <div className="app-shell">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <img src="/sentinel_logo.png" alt="Sentinel" className="sidebar-logo" style={{ width: 36, height: 36 }} />
                    <div>
                        <div className="sidebar-title" style={{ fontSize: '1.2rem', letterSpacing: 3 }}>SENTINEL</div>
                        <div className="sidebar-subtitle">Decision OS</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            end={item.path === '/'}
                            style={{ position: 'relative' }}
                        >
                            <span className="sidebar-icon">{renderIcon(item.iconName)}</span>
                            <span className="sidebar-label">{item.label}</span>
                            {item.alertKey === 'risk' && showAlertBadge && <span className="nav-badge" />}
                            {item.path === '/prescription' && approvalQueue.length > 0 && (
                                <span className="nav-approval-badge">{approvalQueue.length}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div style={{ fontSize: '0.6rem', color: '#475569', marginBottom: 4 }}>
                        Season: Flowering → Harvest
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#475569' }}>
                        Day {currentDay || 18} / 120
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 6 }}>Sentinel Engine v4.2</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Build 2026.03</div>
                </div>
            </aside>

            {/* Main */}
            <div className="main-wrapper">
                {/* Topbar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <select
                            className="field-selector"
                            value={activeFieldId}
                            onChange={e => setActiveField(e.target.value)}
                        >
                            {Object.values(fields).map(f => (
                                <option key={f.id} value={f.id}>{f.name} ({f.nameZh})</option>
                            ))}
                        </select>

                        {activeScenario && (
                            <div className="scenario-indicator">
                                <span className="scenario-dot" style={{ background: activeScenario.riskLevel === 'critical' ? '#ef4444' : activeScenario.riskLevel === 'high' ? '#f59e0b' : '#3dabf5' }} />
                                <span>Scenario {activeScenario.id}: {activeScenario.name}</span>
                                <span className="scenario-progress">Step {scenarioStep}/{activeScenario.events.length}</span>
                            </div>
                        )}
                    </div>

                    <div className="topbar-right">
                        {/* Approval Queue */}
                        {approvalQueue.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(245,158,11,0.08)', borderRadius: 8, marginRight: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                                <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700 }}>⚠ {approvalQueue.length} Pending Approval{approvalQueue.length > 1 ? 's' : ''}</span>
                            </div>
                        )}

                        {/* AI Watchdog Indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(52,211,153,0.06)', borderRadius: 8, marginRight: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'watchdog-pulse 2s infinite' }} />
                            <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>AI Active</span>
                            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>Last scan {new Date(aiWatchdog.lastScan).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>

                        <PageClock />

                        <div className="topbar-status">
                            <span className="status-light" />
                            <span>System Online</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
