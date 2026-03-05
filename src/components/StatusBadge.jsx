import React from 'react';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';

export default function StatusBadge({ status, label, size = 'sm' }) {
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);

    const zhLabelMap = {
        'ACTION REQUIRED': '需要处理',
        ELEVATED: '升高',
        MONITORING: '监测中',
        LOW: '低',
        PASS: '通过',
        FAIL: '失败',
        PENDING: '待处理',
        COMPLETED: '已完成',
        FAILED: '失败',
        MATCH: '匹配',
        MISMATCH: '不匹配',
        WARNING: '告警',
        SYSTEM: '系统',
        OPERATOR: '人工',
        APPROVAL: '审批',
        REJECTION: '驳回',
        MODIFICATION: '修改',
        PRESCRIPTION: '处方',
        SUCCESS: '成功',
        PARTIAL: '部分完成',
        'NO ACTION': '无需动作',
        BANNED: '禁用',
    };

    const explicitLabel = (() => {
        if (!label) return null;
        if (locale !== 'zh') return label;
        const normalized = String(label).replace(/_/g, ' ').trim().toUpperCase();
        return zhLabelMap[normalized] || label;
    })();

    const text = (en, zh) => (explicitLabel || t(en, zh));

    const config = {
        critical: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '#ef4444', text: text('ACTION REQUIRED', '需要处理') },
        elevated: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', dot: '#f59e0b', text: text('ELEVATED', '升高') },
        monitoring: { bg: 'rgba(61,171,245,0.15)', color: '#3dabf5', dot: '#3dabf5', text: text('MONITORING', '监测中') },
        low: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '#10b981', text: text('LOW', '低') },
        pass: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '#10b981', text: text('PASS', '通过') },
        fail: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '#ef4444', text: text('FAIL', '失败') },
        pending: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', dot: '#94a3b8', text: text('PENDING', '待处理') },
        completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '#10b981', text: text('COMPLETED', '已完成') },
        failed: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '#ef4444', text: text('FAILED', '失败') },
        match: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '#10b981', text: text('MATCH', '匹配') },
        mismatch: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '#ef4444', text: text('MISMATCH', '不匹配') },
        warning: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', dot: '#f59e0b', text: text('WARNING', '告警') },
        system: { bg: 'rgba(61,171,245,0.15)', color: '#3dabf5', dot: '#3dabf5', text: text('SYSTEM', '系统') },
        operator: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', dot: '#f59e0b', text: text('OPERATOR', '人工') },
    };

    const c = config[status] || config.pending;
    const fontSize = size === 'lg' ? '0.85rem' : '0.7rem';
    const padding = size === 'lg' ? '6px 14px' : '3px 10px';

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: c.bg, color: c.color, borderRadius: 20,
            fontSize, fontWeight: 600, padding, letterSpacing: '0.03em',
            textTransform: locale === 'zh' ? 'none' : 'uppercase', whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
            {c.text}
        </span>
    );
}
