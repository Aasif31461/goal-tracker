import React from 'react';

export const Card = ({ children, className = "", onClick }) => (
    <div
        onClick={onClick}
        className={`bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-slate-700 hover:bg-slate-900 ${className}`}
    >
        {children}
    </div>
);
