import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../engine/store';
import Icon from './Icon';

const EVENT_META = {
    autonomy: { icon: 'activity', color: '#38bdf8', label: 'Autonomy' },
    prescription: { icon: 'prescription', color: '#f59e0b', label: 'Prescription' },
    execution: { icon: 'execution', color: '#34d399', label: 'Execution' },
    execution_complete: { icon: 'check-circle', color: '#22c55e', label: 'Execution' },
    deviation: { icon: 'warning', color: '#ef4444', label: 'Deviation' },
    audit: { icon: 'audit', color: '#a78bfa', label: 'Audit' },
    approval: { icon: 'check-circle', color: '#34d399', label: 'Approval' },
    rejection: { icon: 'x-circle', color: '#ef4444', label: 'Rejection' },
    modification: { icon: 'settings', color: '#f97316', label: 'Edit' },
    scenario: { icon: 'layers', color: '#38bdf8', label: 'Scenario' },
    scenario_event: { icon: 'layers', color: '#60a5fa', label: 'Scenario' },
};

const STREAM_META = {
    perception: { icon: 'perception', color: '#34d399', label: 'Perception' },
    analysis: { icon: 'reasoning', color: '#a78bfa', label: 'Analysis' },
    decision: { icon: 'prescription', color: '#fbbf24', label: 'Decision' },
    execution: { icon: 'execution', color: '#38bdf8', label: 'Execution' },
    audit: { icon: 'audit', color: '#22c55e', label: 'Audit' },
    watchdog: { icon: 'warning', color: '#f59e0b', label: 'Watchdog' },
};

const formatTime = (iso) => {
    if (!iso) return '--:--:--';
    return new Date(iso).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};

export default function SystemActivityRail() {
    const {
        eventLog,
        aiAgentLog,
        agentAssignments,
        approvalQueue,
        autonomousState,
        thinkingChain,
        isThinking,
        operatorAlerts,
    } = useStore();

    const [nowTick, setNowTick] = useState(0);
    useEffect(() => {
        setNowTick(Date.now());
        const timer = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const latestCycleId = agentAssignments.length ? agentAssignments[agentAssignments.length - 1].cycleId : null;
    const latestAssignments = latestCycleId ? agentAssignments.filter(a => a.cycleId === latestCycleId) : [];

    const streamItems = useMemo(() => {
        const events = (eventLog || []).slice(-150).map(item => {
            const meta = EVENT_META[item.type] || { icon: 'info', color: '#94a3b8', label: 'Event' };
            return {
                id: `evt-${item.timestamp}-${item.type}-${item.message?.slice(0, 24) || ''}`,
                timestamp: item.timestamp,
                icon: meta.icon,
                color: meta.color,
                tag: meta.label,
                message: item.message,
            };
        });

        const agentEntries = (aiAgentLog || []).slice(-220).map(item => {
            const meta = STREAM_META[item.agent] || { icon: 'activity', color: '#94a3b8', label: 'Agent' };
            return {
                id: `agt-${item.timestamp}-${item.agentId || item.agent}-${item.action?.slice(0, 24) || ''}`,
                timestamp: item.timestamp,
                icon: meta.icon,
                color: meta.color,
                tag: meta.label,
                message: item.action,
            };
        });

        const assignmentEntries = latestAssignments.map(item => ({
            id: `asg-${item.id}`,
            timestamp: item.timestamp,
            icon: 'users',
            color: item.status === 'operator_gate' ? '#f59e0b' : '#38bdf8',
            tag: 'Task',
            message: `${item.taskLabel}: ${(item.members || []).map(m => m.name).join(', ')}`,
        }));

        const thinkingEntries = isThinking
            ? (thinkingChain || []).slice(-8).map(item => ({
                id: `thk-${item.id}-${item.timestamp}`,
                timestamp: item.timestamp,
                icon: item.phase?.icon || 'reasoning',
                color: item.phase?.color || '#a78bfa',
                tag: 'Thinking',
                message: item.title,
            }))
            : [];

        return [...events, ...agentEntries, ...assignmentEntries, ...thinkingEntries]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 220);
    }, [eventLog, aiAgentLog, latestAssignments, isThinking, thinkingChain]);

    const eventsLast30m = useMemo(() => {
        const cutoff = nowTick - 30 * 60 * 1000;
        return streamItems.filter(item => new Date(item.timestamp).getTime() >= cutoff).length;
    }, [streamItems, nowTick]);

    return (
        <aside className="system-activity-rail card">
            <div className="system-activity-header">
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="activity" size={16} color="#38bdf8" />
                    Live System Stream
                </h3>
                <span className="system-activity-badge">
                    <span className="system-activity-pulse" />
                    Live
                </span>
            </div>

            <div className="system-activity-stats">
                <span>Cycle {autonomousState?.cycleCount || 0}</span>
                <span>{eventsLast30m} events / 30m</span>
                <span>{approvalQueue.length} approvals pending</span>
                <span>{operatorAlerts.length} action required</span>
            </div>

            <div className="system-activity-stream scrollbar-themed">
                {streamItems.map(item => (
                    <div key={item.id} className="system-activity-item">
                        <div className="system-activity-icon" style={{ color: item.color }}>
                            <Icon name={item.icon} size={13} color={item.color} />
                        </div>
                        <div className="system-activity-body">
                            <div className="system-activity-meta">
                                <span className="system-activity-tag" style={{ color: item.color }}>{item.tag}</span>
                                <span className="system-activity-time">{formatTime(item.timestamp)}</span>
                            </div>
                            <div className="system-activity-text">{item.message}</div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
