import React from 'react';

export const Badge = ({ children, type = "neutral" }) => {
    const styles = {
        neutral: "bg-slate-800 text-slate-400 border border-slate-700",
        success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20"
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[type] || styles.neutral}`}>
            {children}
        </span>
    );
};
