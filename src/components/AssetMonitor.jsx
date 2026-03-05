import React from 'react';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';
import Icon from './Icon';

export default function AssetMonitor({ assets = [] }) {
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';

    const assetIcon = (type) => {
        const map = {
            drone: 'drone',
            human: 'users',
            facility: 'facility',
            service: 'layers',
        };
        return map[type] || 'gear';
    };

    const statusStyle = (status) => {
        const map = {
            active: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
            charging: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
            standby: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
            maintenance: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            lunch_break: { color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
            online: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
            degraded: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        };
        return map[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
    };

    const statusLabel = (status) => {
        if (!status) return '--';
        const mapZh = {
            active: '运行中',
            charging: '充电中',
            standby: '待命',
            maintenance: '维护中',
            lunch_break: '休息中',
            online: '在线',
            degraded: '降级',
        };
        return isZh ? (mapZh[status] || status) : status.replace('_', ' ');
    };

    return (
        <div className="asset-monitor">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 }}>
                <Icon name="drone" size={18} color="#f59e0b" /> {t('System Assets & Fleet Readiness', '系统资产与舰队就绪度')}
            </h3>
            <div className="grid grid-3" style={{ gap: 12 }}>
                {assets.map(asset => {
                    const style = statusStyle(asset.status);
                    return (
                        <div key={asset.id} className="card asset-card" style={{ borderLeft: `3px solid ${style.color}`, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ padding: 8, background: 'rgba(15,23,42,0.4)', borderRadius: 8 }}>
                                        <Icon name={assetIcon(asset.type)} size={18} color={style.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0' }}>{isZh ? (asset.nameZh || asset.name) : asset.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{asset.id}</div>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    background: style.bg,
                                    color: style.color,
                                    textTransform: 'uppercase',
                                }}>
                                    {statusLabel(asset.status)}
                                </div>
                            </div>

                            <div className="asset-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {asset.battery !== undefined && (
                                    <div className="asset-tag">
                                        <Icon name="activity" size={10} color="#34d399" /> {asset.battery}% {t('Battery', '电量')}
                                    </div>
                                )}
                                {asset.members !== undefined && (
                                    <div className="asset-tag">
                                        <Icon name="users" size={10} color="#38bdf8" /> {asset.members} {t('People', '人员')}
                                    </div>
                                )}
                                {asset.load && (
                                    <div className="asset-tag">
                                        <Icon name="activity" size={10} color="#a78bfa" /> {asset.load} {t('Load', '负载')}
                                    </div>
                                )}
                                {asset.latency && (
                                    <div className="asset-tag">
                                        <Icon name="signal" size={10} color="#f59e0b" /> {asset.latency}
                                    </div>
                                )}
                                <div className="asset-tag" style={{ border: 'none', background: 'transparent', paddingLeft: 0 }}>
                                    <Icon name="map-pin" size={10} color="#64748b" /> {isZh ? (asset.locationZh || asset.typeLabelZh || asset.location || asset.typeLabel || t('Ops Center', '运维中心')) : (asset.location || asset.typeLabel || t('Ops Center', '运维中心'))}
                                </div>
                            </div>

                            {asset.status === 'charging' && (
                                <div className="charge-bar">
                                    <div className="charge-fill" style={{ width: `${asset.battery}%` }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .asset-monitor { margin-bottom: 24px; }
                .asset-card { transition: all 0.2s ease; cursor: default; }
                .asset-card:hover { transform: translateY(-2px); background: rgba(30, 41, 59, 0.4); }
                .asset-tag {
                    display: flex;
                    align-items: center;
                    gap: 4;
                    padding: 2px 6px;
                    background: rgba(15, 23, 42, 0.3);
                    border: 1px solid rgba(255,255,255,0.03);
                    border-radius: 4px;
                    font-size: 0.62rem;
                    color: #94a3b8;
                }
                .charge-bar {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: rgba(255,255,255,0.05);
                }
                .charge-fill {
                    height: 100%;
                    background: #38bdf8;
                    box-shadow: 0 0 10px #38bdf8;
                    animation: pulse-charge 2s infinite;
                }
                @keyframes pulse-charge {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
