import React, { useMemo, useState } from 'react';
import useStore from '../engine/store';
import Icon from './Icon';

const ROLE_ICON = {
    manager: 'user',
    agronomist: 'leaf',
    chemist: 'water-drop',
    compliance: 'shield',
    safety: 'warning',
    finance: 'money',
    sales: 'trending-up',
    controller: 'settings',
    operator: 'drone',
    retriever: 'perception',
    learning: 'reasoning',
};

const ROLE_COLOR = {
    manager: '#60a5fa',
    agronomist: '#34d399',
    chemist: '#f59e0b',
    compliance: '#a78bfa',
    safety: '#f97316',
    finance: '#22c55e',
    sales: '#38bdf8',
    controller: '#f472b6',
    operator: '#ef4444',
    retriever: '#06b6d4',
    learning: '#8b5cf6',
};

const toLabel = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown';
const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

export default function AIAgentPanel() {
    const {
        agentRoster,
        agentAssignments,
        aiAgentLog,
        autonomousState,
        operatorAlerts,
    } = useStore();

    const [expandedAgentId, setExpandedAgentId] = useState(null);
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const safeRoster = agentRoster || [];
    const safeAssignments = agentAssignments || [];
    const latestCycleId = safeAssignments.length ? safeAssignments[safeAssignments.length - 1].cycleId : null;
    const latestAssignments = latestCycleId ? safeAssignments.filter(a => a.cycleId === latestCycleId) : [];

    const actionCountByAgent = aiAgentLog.reduce((acc, log) => {
        if (log.agentId) acc[log.agentId] = (acc[log.agentId] || 0) + 1;
        return acc;
    }, {});

    const assignmentCountByAgent = latestAssignments.reduce((acc, assignment) => {
        (assignment.members || []).forEach(member => {
            acc[member.id] = (acc[member.id] || 0) + 1;
        });
        return acc;
    }, {});

    const taskLogsByTaskId = useMemo(() => {
        const logs = {};
        latestAssignments.forEach(assignment => {
            const memberIds = new Set((assignment.members || []).map(m => m.id));
            logs[assignment.id] = aiAgentLog
                .filter(l => l.cycleId === assignment.cycleId && (memberIds.has(l.agentId) || l.action?.includes(assignment.taskLabel)))
                .slice(-16)
                .reverse();
        });
        return logs;
    }, [latestAssignments, aiAgentLog]);

    const toggleTask = (taskId) => {
        setExpandedTaskId(current => (current === taskId ? null : taskId));
    };

    const toggleAgent = (agentId) => {
        setExpandedAgentId(current => (current === agentId ? null : agentId));
    };

    if (!safeRoster.length) return null;

    return (
        <div className="card" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="robot" size={16} color="#38bdf8" />
                    Autonomous Agent Mesh
                </h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                        `Cycles ${autonomousState?.cycleCount || 0}`,
                        `Auto Exec ${autonomousState?.autoExecutions || 0}`,
                        `Escalations ${autonomousState?.escalations || 0}`,
                        `Alerts ${operatorAlerts?.length || 0}`,
                    ].map(label => (
                        <span
                            key={label}
                            style={{
                                fontSize: '0.62rem',
                                color: '#93c5fd',
                                padding: '3px 8px',
                                borderRadius: 999,
                                background: 'rgba(30,64,175,0.18)',
                                border: '1px solid rgba(96,165,250,0.25)',
                            }}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            {latestAssignments.length > 0 && (
                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    {latestAssignments.map(assignment => {
                        const isExpanded = expandedTaskId === assignment.id;
                        const taskLogs = taskLogsByTaskId[assignment.id] || [];
                        return (
                            <div
                                key={assignment.id}
                                style={{
                                    border: '1px solid rgba(56,189,248,0.2)',
                                    background: 'rgba(15,23,42,0.35)',
                                    borderRadius: 8,
                                    padding: '8px 10px',
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    if (!isExpanded) setExpandedTaskId(assignment.id);
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.74rem', color: '#e2e8f0', fontWeight: 700 }}>{assignment.taskLabel}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ fontSize: '0.62rem', color: assignment.status === 'operator_gate' ? '#f59e0b' : '#34d399' }}>
                                            {assignment.status === 'operator_gate' ? 'Operator Approval' : 'Completed'}
                                        </div>
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTask(assignment.id);
                                            }}
                                            aria-label={isExpanded ? 'Collapse task details' : 'Expand task details'}
                                        >
                                            <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={12} color="#64748b" />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {(assignment.members || []).map(member => (
                                        <span key={`${assignment.id}-${member.id}`} style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <Icon name={ROLE_ICON[member.role] || 'user'} size={12} color={ROLE_COLOR[member.role] || '#94a3b8'} /> {member.name} ({member.assignment})
                                        </span>
                                    ))}
                                </div>
                                {isExpanded && (
                                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(51,65,85,0.6)' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                            <span className="mesh-chip">Task ID {assignment.taskId}</span>
                                            <span className="mesh-chip">Cycle {assignment.cycleId}</span>
                                            <span className="mesh-chip">Agents {(assignment.members || []).length}</span>
                                        </div>
                                        <div className="scrollbar-themed" style={{ maxHeight: 190, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {taskLogs.length === 0 && <div style={{ fontSize: '0.62rem', color: '#64748b' }}>No task logs yet.</div>}
                                            {taskLogs.map((log, idx) => (
                                                <div key={`${assignment.id}-log-${idx}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.62rem' }}>
                                                    <span style={{ color: '#475569', fontFamily: 'monospace', minWidth: 62 }}>{formatTime(log.timestamp)}</span>
                                                    <span style={{ color: '#94a3b8' }}>{log.action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-3" style={{ marginTop: 12, gap: 8 }}>
                {safeRoster.map(agent => {
                    const actions = actionCountByAgent[agent.id] || 0;
                    const assigned = assignmentCountByAgent[agent.id] || 0;
                    const active = actions > 0 || assigned > 0;
                    const tone = ROLE_COLOR[agent.role] || '#38bdf8';
                    const logs = aiAgentLog
                        .filter(entry => entry.agentId === agent.id || entry.agent === agent.stream)
                        .slice(-20)
                        .reverse();
                    const isExpanded = expandedAgentId === agent.id;

                    return (
                        <div
                            key={agent.id}
                            style={{
                                border: `1px solid ${active ? `${tone}40` : 'rgba(51,65,85,0.5)'}`,
                                background: active ? `${tone}10` : 'rgba(15,23,42,0.3)',
                                borderRadius: 8,
                                padding: '9px 10px',
                                cursor: 'pointer',
                                gridColumn: isExpanded ? '1 / -1' : 'auto',
                                transition: 'all 0.2s ease',
                            }}
                            onClick={() => {
                                if (!isExpanded) setExpandedAgentId(agent.id);
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Icon name={ROLE_ICON[agent.role] || 'user'} size={14} color={tone} />
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0' }}>{agent.name}</div>
                                </div>
                                <button
                                    type="button"
                                    className="icon-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAgent(agent.id);
                                    }}
                                    aria-label={isExpanded ? 'Collapse agent details' : 'Expand agent details'}
                                >
                                    <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={12} color="#64748b" />
                                </button>
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 2 }}>
                                {toLabel(agent.role)} | {toLabel(agent.stream)}
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#64748b', marginTop: 2 }}>{agent.traits}</div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: '0.58rem', color: '#94a3b8' }}>
                                <span>Actions {actions}</span>
                                <span>Current Tasks {assigned}</span>
                            </div>
                            {isExpanded && (
                                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(51,65,85,0.6)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 8 }}>
                                        <div className="mesh-metric"><span>Role</span><strong>{toLabel(agent.role)}</strong></div>
                                        <div className="mesh-metric"><span>Stream</span><strong>{toLabel(agent.stream)}</strong></div>
                                        <div className="mesh-metric"><span>Assignments</span><strong>{assigned}</strong></div>
                                        <div className="mesh-metric"><span>Total Actions</span><strong>{actions}</strong></div>
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#93c5fd', marginBottom: 6 }}>Real-Time Activity Logs</div>
                                    <div className="scrollbar-themed" style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        {logs.length === 0 && (
                                            <div style={{ fontSize: '0.62rem', color: '#64748b' }}>No recent actions yet.</div>
                                        )}
                                        {logs.map((log, idx) => (
                                            <div key={`${agent.id}-activity-${idx}`} style={{ display: 'flex', gap: 8, fontSize: '0.62rem' }}>
                                                <span style={{ minWidth: 62, color: '#475569', fontFamily: 'monospace' }}>{formatTime(log.timestamp)}</span>
                                                <span style={{ color: '#e2e8f0', flex: 1 }}>{log.action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
