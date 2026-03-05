import React, { useState } from 'react';
import Icon from './Icon';
import { multimodalImagery } from '../data/mockData';

const typeColors = {
    drone_rgb: '#38bdf8',
    thermal_ir: '#ef4444',
    satellite_ndvi: '#34d399',
    pest_trap: '#f59e0b',
    hyperspectral: '#a78bfa',
    leaf_wetness: '#06b6d4',
};

const typeIcons = {
    drone_rgb: 'drone',
    thermal_ir: 'perception',
    satellite_ndvi: 'layers',
    pest_trap: 'alert-triangle',
    hyperspectral: 'perception',
    leaf_wetness: 'activity',
};

export default function MultimodalGallery({ compact = false }) {
    const [selected, setSelected] = useState(null);
    const [failedImages, setFailedImages] = useState({});

    const formatTimestamp = (ts) => {
        const d = new Date(ts);
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    };
    const markImageFailed = (filename) => {
        setFailedImages(prev => ({ ...prev, [filename]: true }));
    };

    if (compact) {
        return (
            <div className="multimodal-strip">
                {multimodalImagery.slice(0, 4).map(img => (
                    <div key={img.id} className="mm-thumb" onClick={() => setSelected(img)} style={{ cursor: 'pointer' }}>
                        {failedImages[img.filename] ? (
                            <div className="mm-fallback">
                                <Icon name="camera" size={14} color="#94a3b8" />
                                <span>Feed unavailable</span>
                            </div>
                        ) : (
                            <img src={`/${img.filename}`} alt={img.source} loading="lazy" onError={() => markImageFailed(img.filename)} />
                        )}
                        <div className="mm-thumb-label">
                            <Icon name={typeIcons[img.type]} size={10} color={typeColors[img.type]} />
                            <span>{img.source}</span>
                        </div>
                    </div>
                ))}
                {selected && <ImageModal img={selected} onClose={() => setSelected(null)} failed={Boolean(failedImages[selected.filename])} onImageError={() => markImageFailed(selected.filename)} />}
            </div>
        );
    }

    return (
        <div className="multimodal-gallery">
            <div className="mm-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(167,139,250,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="perception" size={16} color="#38bdf8" />
                    </div>
                    <div>
                        <div className="mm-title">Multimodal Sensor Feed</div>
                        <div className="mm-subtitle">{multimodalImagery.length} sources  |  Latest: {formatTimestamp(multimodalImagery[0].timestamp)}</div>
                    </div>
                </div>
            </div>
            <div className="mm-grid">
                {multimodalImagery.map(img => (
                    <div key={img.id} className="mm-card" onClick={() => setSelected(img)}>
                        <div className="mm-card-image">
                            {failedImages[img.filename] ? (
                                <div className="mm-fallback">
                                    <Icon name="camera" size={15} color="#94a3b8" />
                                    <span>Feed unavailable</span>
                                </div>
                            ) : (
                                <img src={`/${img.filename}`} alt={img.source} loading="lazy" onError={() => markImageFailed(img.filename)} />
                            )}
                            <div className="mm-card-type" style={{ background: typeColors[img.type] }}>
                                <Icon name={typeIcons[img.type]} size={10} color="#fff" />
                                {img.source}
                            </div>
                        </div>
                        <div className="mm-card-info">
                            <div className="mm-card-source">{img.sourceZh}</div>
                            <div className="mm-card-meta">
                                <span>{formatTimestamp(img.timestamp)}</span>
                                <span>{img.zone}</span>
                            </div>
                            <div className="mm-card-annotation">{img.annotation.slice(0, 80)}...</div>
                        </div>
                    </div>
                ))}
            </div>
            {selected && <ImageModal img={selected} onClose={() => setSelected(null)} failed={Boolean(failedImages[selected.filename])} onImageError={() => markImageFailed(selected.filename)} />}
        </div>
    );
}

function ImageModal({ img, onClose, failed, onImageError }) {
    return (
        <div className="mm-modal-overlay" onClick={onClose}>
            <div className="mm-modal" onClick={e => e.stopPropagation()}>
                <div className="mm-modal-image">
                    {failed ? (
                        <div className="mm-fallback">
                            <Icon name="camera" size={18} color="#94a3b8" />
                            <span>Feed unavailable</span>
                        </div>
                    ) : (
                        <img src={`/${img.filename}`} alt={img.source} onError={onImageError} />
                    )}
                </div>
                <div className="mm-modal-sidebar">
                    <button type="button" className="mm-modal-close icon-btn" onClick={onClose} aria-label="Close image detail">
                        <Icon name="x" size={14} color="#94a3b8" />
                    </button>
                    <div className="mm-modal-source" style={{ color: typeColors[img.type] }}>
                        <Icon name={typeIcons[img.type]} size={16} color={typeColors[img.type]} />
                        {img.source}
                    </div>
                    <div className="mm-modal-field">{img.sourceZh}</div>

                    <div className="mm-modal-section">
                        <div className="mm-modal-label">Timestamp</div>
                        <div className="mm-modal-value">{new Date(img.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="mm-modal-section">
                        <div className="mm-modal-label">Zone</div>
                        <div className="mm-modal-value">{img.zone}</div>
                    </div>
                    <div className="mm-modal-section">
                        <div className="mm-modal-label">Resolution</div>
                        <div className="mm-modal-value">{img.resolution}</div>
                    </div>
                    <div className="mm-modal-section">
                        <div className="mm-modal-label">AI Annotation</div>
                        <div className="mm-modal-annotation">{img.annotation}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

