import React from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { useQuote } from '../../../hooks/useQuote';

export default function QuoteWidget() {
    const { quote, loading, refreshQuote } = useQuote();

    if (loading && !quote) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="absolute top-4 right-4 opacity-10 text-indigo-400">
                <Quote size={48} />
            </div>

            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={refreshQuote}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="New Quote"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="relative z-10 pr-8">
                <p className="text-lg md:text-xl font-medium text-slate-200 italic font-serif leading-relaxed animate-in fade-in duration-500">
                    "{quote.text}"
                </p>
                <p className="mt-3 text-sm font-bold text-indigo-400 uppercase tracking-widest opacity-80 animate-in slide-in-from-left duration-500 delay-100">
                    — {quote.author}
                </p>
            </div>
        </div>
    );
}
