import React, { useState, useEffect } from 'react';

export default function PageClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatted = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    return (
        <div className="page-clock">
            <span className="page-clock-dot" />
            <span className="page-clock-time">{formatted}</span>
            <span className="page-clock-tz">CST</span>
        </div>
    );
}
