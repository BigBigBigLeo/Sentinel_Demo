import React, { useState, useEffect } from 'react';

export default function SubtitleOverlay() {
    const [subtitle, setSubtitle] = useState('');

    useEffect(() => {
        const handleSubtitle = (e) => {
            if (e.detail && typeof e.detail === 'string') {
                setSubtitle(e.detail);
            }
        };

        window.addEventListener('set-subtitle', handleSubtitle);

        // Also allow setting via window property for easy access from browser_subagent
        window.setWalkthroughSubtitle = (text) => {
            setSubtitle(text);
        };

        return () => {
            window.removeEventListener('set-subtitle', handleSubtitle);
            delete window.setWalkthroughSubtitle;
        };
    }, []);

    if (!subtitle) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '1.25rem',
            fontWeight: '600',
            textAlign: 'center',
            maxWidth: '80%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            animation: 'fadeInUp 0.3s ease-out'
        }}>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>
            {subtitle}
        </div>
    );
}
