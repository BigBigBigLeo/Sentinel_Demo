import React from 'react';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import { pick } from '../i18n/locale.js';

export default function IntelligenceDossierModal({ item, onClose, locale = 'zh' }) {
    if (!item) return null;
    const isZh = locale === 'zh';
    const t = (en, zh) => pick(locale, en, zh);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(5, 8, 16, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#0a0f1d',
                    border: '1px solid #1e293b',
                    borderRadius: 12,
                    maxWidth: 760,
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #1e293b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.6)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 8,
                            background: `${item.tone || '#38bdf8'}20`,
                            border: `1px solid ${item.tone || '#38bdf8'}50`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Icon name={item.icon || 'activity'} size={18} color={item.tone || '#38bdf8'} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    fontSize: '0.65rem',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    fontFamily: 'monospace',
                                    fontWeight: 700
                                }}>
                                    {item.categoryZh || item.category || '全域情报'}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                    ID: {item.id || 'INTEL-NODE'}
                                </span>
                            </div>
                            <h2 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: 800 }}>
                                {isZh ? (item.titleZh || item.nameZh || item.title) : (item.titleEn || item.nameEn || item.title)}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid #334155',
                            borderRadius: 6,
                            width: 32,
                            height: 32,
                            color: '#94a3b8',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon name="x" size={14} color="#94a3b8" />
                    </button>
                </div>

                {/* Body Content */}
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Key Telemetry Ribbon */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: 10,
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8,
                        padding: 12
                    }}>
                        <div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{t('Primary Metric', '核心参量值')}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.tone || '#38bdf8', fontFamily: 'monospace', marginTop: 2 }}>
                                {item.primaryValue || item.temp || item.gradeJumbo || '--'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
                                {item.primaryUnit || '实时读数'}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{t('Status / Level', '状态评级')}</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                                {item.statusZh || item.ratingZh || item.level || '正常受控'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: 2 }}>
                                7x24 联锁合规
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{t('Source Provenance', '数据源通道')}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginTop: 4 }}>
                                {item.sourceZh || '北斗高精 / 国家农业大数据 / IoT'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>
                                采集频次: 60s 轮询
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{t('Verification Hash', '加密存证哈希')}</div>
                            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: 4, wordBreak: 'break-all' }}>
                                {item.hash || 'SHA256:8f4c...7b21'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: 2 }}>
                                GS1-128 批次互认
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Deep Description & Technical Specifications */}
                    <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="document" size={14} color="#38bdf8" />
                            {t('Technical Specifications & Contextual Detail', '技术规范、物理机理与实时背景')}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                            {isZh ? (item.detailZh || item.descZh || item.impactZh || item.routeZh || '实时物联网遥测正常接入中，各项参量均在标准受控包络线之内。') : (item.detailEn || item.descEn || item.detail || 'Telemetry active.')}
                        </p>
                    </div>

                    {/* Section 2: Farm & 12 Orders Operational Impact */}
                    <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 8, padding: 14 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="layers" size={14} color="#38bdf8" />
                            {t('900-Mu Farm & 12 Enterprise Orders Operational Impact', '900 亩园区生产与 12 批大单履约直接影响分析')}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                            <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>产销交期与 SLA 影响</div>
                                <div style={{ fontSize: '0.74rem', color: '#f8fafc', fontWeight: 600, marginTop: 3 }}>
                                    {item.slaImpactZh || '满足盒马/山姆/Ole 交付时序，保障全程冷链 0 脱温。'}
                                </div>
                            </div>
                            <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>财务损益与溢价影响</div>
                                <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, marginTop: 3 }}>
                                    {item.financeImpactZh || '锁定合同期现溢价 +¥12,500 ~ ¥48,750，规避违约扣款风险。'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Sentinel 14 Multi-Agent Coordinated Recommendation */}
                    <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="brain" size={14} color="#a855f7" />
                            {t('Sentinel 14 Multi-Agent Synthesis & Strategic Action', 'Sentinel 14 智能体多维博弈协同决策建议')}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#0f172a', padding: 8, borderRadius: 6 }}>
                                <span style={{ fontSize: '0.65rem', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    A01 运营管理
                                </span>
                                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                                    {item.a01AdviceZh || '统筹全园 12 批大单发货时序，将西南干线班车与长水空港航班发车时刻严格对齐。'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#0f172a', padding: 8, borderRadius: 6 }}>
                                <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 6px', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    A06 销售履约
                                </span>
                                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                                    {item.a06AdviceZh || '优先放行合格梯度预冷批次，维持成渝/滇中商超货架 18~22 天最长保鲜周期。'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#0f172a', padding: 8, borderRadius: 6 }}>
                                <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '2px 6px', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    A08 法规合规
                                </span>
                                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                                    {item.a08AdviceZh || '刚性复核 GB 2763 农残安全间隔期与出滇冷链检疫单，严格杜绝任何未达标批次流入市场。'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #1e293b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.4)'
                }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        云南澄江 900 亩数字农业基地 · 产业情报中枢实时授信
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '7px 18px',
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            border: 'none',
                            borderRadius: 6,
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            cursor: 'pointer'
                        }}
                    >
                        {t('Close Dossier', '关闭档案')}
                    </button>
                </div>
            </div>
        </div>
    );
}
