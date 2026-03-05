import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';

const DATA_SOURCES = [
    { id: 'iot_mesh', name: 'IoT Sensor Mesh', nameZh: '物联网传感器', type: 'realtime', icon: 'perception', color: '#38bdf8', channels: 32, freq: '5-min', format: 'MQTT JSON', volume: 384, unit: 'readings/hr', latency: 180 },
    { id: 'drone_hyper', name: 'Drone Hyperspectral', nameZh: '无人机高光谱', type: 'batch', icon: 'drone', color: '#a78bfa', channels: 224, freq: 'On-demand', format: 'GeoTIFF 224-band', volume: 2.4, unit: 'GB/flight', latency: 240000 },
    { id: 'weather_api', name: 'Weather Forecast API', nameZh: '天气预报 API', type: 'realtime', icon: 'activity', color: '#60a5fa', channels: 8, freq: '15-min', format: 'JSON REST', volume: 96, unit: 'updates/day', latency: 850 },
    { id: 'pest_traps', name: 'Automated Pest Traps', nameZh: '自动虫情监测', type: 'batch', icon: 'activity', color: '#f472b6', channels: 48, freq: '6-hr cycle', format: 'Image + Count', volume: 192, unit: 'captures/day', latency: 21600000 },
    { id: 'satellite', name: 'Sentinel-2 Satellite', nameZh: '卫星遥感', type: 'batch', icon: 'perception', color: '#818cf8', channels: 13, freq: '5-day revisit', format: 'NDVI/EVI bands', volume: 1.8, unit: 'GB/pass', latency: 432000000 },
    { id: 'soil_lab', name: 'Soil Lab Reports', nameZh: '土壤实验室', type: 'batch', icon: 'activity', color: '#a3e635', channels: 14, freq: 'Weekly', format: 'PDF + CSV', volume: 14, unit: 'parameters', latency: 604800000 },
    { id: 'market_feed', name: 'Market Price Feed', nameZh: '市场价格', type: 'realtime', icon: 'dollar', color: '#fbbf24', channels: 6, freq: 'Daily', format: 'JSON API', volume: 42, unit: 'quotes/day', latency: 3600000 },
    { id: 'historical_db', name: 'Historical Outbreak DB', nameZh: '历史病害数据库', type: 'reference', icon: 'box', color: '#94a3b8', channels: 1, freq: 'Persistent', format: 'PostgreSQL', volume: 847, unit: 'events (3yr)', latency: 45 },
    { id: 'drone_rgb', name: 'Drone RGB Video', nameZh: '无人机可见光', type: 'batch', icon: 'drone', color: '#34d399', channels: 3, freq: 'On-demand', format: '4K H.265', volume: 12.6, unit: 'GB/flight', latency: 180000 },
    { id: 'worker_reports', name: 'Field Scout Reports', nameZh: '人工巡田记录', type: 'manual', icon: 'star', color: '#fb923c', channels: 1, freq: 'As-needed', format: 'Text + Photos', volume: 8, unit: 'reports/day', latency: 7200000 },
    { id: 'growth_model', name: 'GDD Growth Model', nameZh: '生长模型', type: 'computed', icon: 'reasoning', color: '#e879f9', channels: 5, freq: 'Hourly', format: 'Model output', volume: 120, unit: 'predictions/day', latency: 500 },
    { id: 'regulatory', name: 'Regulatory Compliance', nameZh: '法规合规数据', type: 'reference', icon: 'lock', color: '#f87171', channels: 3, freq: 'On-update', format: 'Government API', volume: 3, unit: 'feeds', latency: 86400000 },
];

function formatFreshness(ms, locale) {
    const jitter = Math.random() * ms * 0.3;
    const actual = ms + jitter;
    if (locale === 'zh') {
        if (actual < 1000) return '刚刚';
        if (actual < 60000) return `${Math.round(actual / 1000)}秒前`;
        if (actual < 3600000) return `${Math.round(actual / 60000)}分钟前`;
        if (actual < 86400000) return `${Math.round(actual / 3600000)}小时前`;
        return `${Math.round(actual / 86400000)}天前`;
    }
    if (actual < 1000) return 'just now';
    if (actual < 60000) return `${Math.round(actual / 1000)}s ago`;
    if (actual < 3600000) return `${Math.round(actual / 60000)}min ago`;
    if (actual < 86400000) return `${Math.round(actual / 3600000)}hr ago`;
    return `${Math.round(actual / 86400000)}d ago`;
}

function SignalBars({ strength }) {
    return (
        <div className="signal-bars">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`signal-bar ${i <= strength ? 'active' : ''}`} style={{ height: 4 + i * 3 }} />
            ))}
        </div>
    );
}

function StreamRow({ source, isAnimating, delay, locale }) {
    const [pulseKey, setPulseKey] = useState(0);
    const t = (en, zh) => pick(locale, en, zh);

    useEffect(() => {
        if (!isAnimating) return;
        const interval = setInterval(() => setPulseKey(k => k + 1), 2000 + Math.random() * 3000);
        return () => clearInterval(interval);
    }, [isAnimating]);

    const strength = source.type === 'realtime' ? 4 : source.type === 'batch' ? 3 : source.type === 'computed' ? 4 : 2;

    return (
        <div className="ingestion-row" style={{ animationDelay: `${delay}ms` }}>
            <div className="ingestion-source">
                <div className="ingestion-icon" style={{ background: `${source.color}15`, color: source.color }}>
                    <Icon name={source.icon} size={16} color={source.color} />
                </div>
                <div className="ingestion-source-info">
                    <div className="ingestion-source-name">{t(source.name, source.nameZh)}</div>
                </div>
            </div>
            <div className="ingestion-meta">
                <span className="ingestion-type-badge" style={{ background: `${source.color}15`, color: source.color, borderColor: `${source.color}30` }}>
                    {source.type === 'realtime'
                        ? t('realtime', '实时')
                        : source.type === 'batch'
                            ? t('batch', '批处理')
                            : source.type === 'manual'
                                ? t('manual', '人工')
                                : source.type === 'computed'
                                    ? t('computed', '计算')
                                    : source.type === 'reference'
                                        ? t('reference', '参考')
                                        : source.type}
                </span>
            </div>
            <div className="ingestion-detail">
                <span className="ingestion-channels">{source.channels} {t('ch', '通道')}</span>
                <span className="ingestion-sep">|</span>
                <span className="ingestion-format">{source.format}</span>
            </div>
            <div className="ingestion-volume">
                <span className="ingestion-volume-value">{source.volume}</span>
                <span className="ingestion-volume-unit">{source.unit}</span>
            </div>
            <div className="ingestion-status">
                <div className={`ingestion-pulse ${isAnimating ? 'active' : ''}`} key={pulseKey} style={{ background: source.color, boxShadow: `0 0 6px ${source.color}40` }} />
                <span className="ingestion-freshness">{formatFreshness(source.latency, locale)}</span>
            </div>
            <div className="ingestion-signal">
                <SignalBars strength={strength} />
            </div>
        </div>
    );
}

export default function DataIngestionPanel({ isActive = true }) {
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);
    const [animating, setAnimating] = useState(false);
    const totalVolume = DATA_SOURCES.reduce((sum, s) => sum + (typeof s.volume === 'number' ? s.volume : 0), 0);
    const totalChannels = DATA_SOURCES.reduce((sum, s) => sum + s.channels, 0);

    useEffect(() => {
        if (isActive) {
            const timer = setTimeout(() => setAnimating(true), 300);
            return () => clearTimeout(timer);
        }
    }, [isActive]);

    return (
        <div className={`ingestion-panel ${animating ? 'active' : ''}`}>
            {/* Header */}
            <div className="ingestion-header">
                <div className="ingestion-header-left">
                    <div className="ingestion-header-icon">
                        <Icon name="perception" size={18} />
                    </div>
                    <div>
                        <div className="ingestion-title">{t('Multimodal Data Ingestion', '多模态数据接入')}</div>
                        <div className="ingestion-subtitle">{DATA_SOURCES.length} {t('sources', '个来源')} | {totalChannels} {t('channels', '条通道')} | {t('Processing in real-time', '实时处理中')}</div>
                    </div>
                </div>
                <div className="ingestion-header-right">
                    <div className="ingestion-total-badge">
                        <span className="ingestion-total-label">{t('Total Volume', '总数据量')}</span>
                        <span className="ingestion-total-value">{totalVolume.toLocaleString()}+ {t('data points', '数据点')}</span>
                    </div>
                </div>
            </div>

            {/* Column Headers */}
            <div className="ingestion-columns">
                <span>{t('Source', '来源')}</span>
                <span>{t('Type', '类型')}</span>
                <span>{t('Format', '格式')}</span>
                <span>{t('Volume', '体量')}</span>
                <span>{t('Status', '状态')}</span>
                <span>{t('Signal', '信号')}</span>
            </div>

            {/* Stream Rows */}
            <div className="ingestion-streams">
                {DATA_SOURCES.map((source, i) => (
                    <StreamRow key={source.id} source={source} isAnimating={animating} delay={i * 80} locale={locale} />
                ))}
            </div>
        </div>
    );
}

