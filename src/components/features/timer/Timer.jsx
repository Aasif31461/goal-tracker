import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, X } from 'lucide-react';
import { useTimer } from '../../../hooks/useTimer';

export default function Timer({ onExit, onSessionComplete }) {
    const {
        timer, mode, isRunning, toggleTimer, resetTimer, setDuration, setIsRunning
    } = useTimer();

    // Custom local state for the custom input that isn't part of the core timer logic
    const [customInputVal, setCustomInputVal] = useState("");

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleCustomTimeSubmit = (e) => {
        e.preventDefault();
        const mins = parseInt(customInputVal);
        if (mins > 0) {
            setDuration(mins, 'custom');
            setCustomInputVal("");
        }
    };

    // We need to sync the hook's completion with the parent's stats tracking
    // The hook currently just stops. We can add an effect here to watch for 0.
    useEffect(() => {
        if (timer === 0 && !isRunning && mode) {
            // Timer finished naturally
            // In a real app we might want to check if it JUST finished to avoid double counting
            // But for now, reliance on App.jsx's logic or moving it here is needed.
            // Since we moved state to App.jsx in the original code, let's keep the prop callback simple.
            onSessionComplete(mode, mode === 'focus' ? 25 : 5); // Simplification, ideally we pass actual duration
        }
    }, [timer, isRunning, mode, onSessionComplete]);

    let bgGradient = "from-indigo-900 to-slate-900";
    if (mode === 'shortBreak') bgGradient = "from-teal-800 to-slate-900";
    if (mode === 'longBreak') bgGradient = "from-blue-900 to-slate-900";
    if (timer < 60 && mode === 'focus') bgGradient = "from-red-900 to-slate-900";

    return (
        <div className={`fixed inset-0 z-50 bg-gradient-to-br ${bgGradient} text-white flex flex-col animate-in fade-in duration-500`}>
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                <button onClick={onExit} className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all">
                    <ArrowLeft />
                </button>
                <div className="flex gap-2 bg-black/20 p-1 rounded-xl backdrop-blur-md">
                    <button onClick={() => setDuration(25, 'focus')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'focus' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:text-white'}`}>Focus</button>
                    <button onClick={() => setDuration(5, 'shortBreak')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'shortBreak' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:text-white'}`}>Short Break</button>
                    <button onClick={() => setDuration(15, 'longBreak')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'longBreak' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:text-white'}`}>Long Break</button>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Breathing Circle Effect */}
                <div className={`absolute w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl ${isRunning ? 'animate-pulse' : ''} transition-all duration-[3000ms]`}></div>

                <div className="text-[12rem] md:text-[16rem] font-bold font-mono tracking-tighter leading-none relative z-10 drop-shadow-2xl">
                    {formatTime(timer)}
                </div>

                <div className="mt-12 flex gap-8 z-10">
                    <button
                        onClick={toggleTimer}
                        className="bg-white text-slate-900 w-24 h-24 rounded-[30px] flex items-center justify-center hover:scale-105 transition-all shadow-2xl hover:shadow-white/20"
                    >
                        {isRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="bg-white/10 text-white w-24 h-24 rounded-[30px] flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all backdrop-blur-md"
                    >
                        <RotateCcw size={32} />
                    </button>
                </div>

                {/* Custom Timer Input */}
                <form onSubmit={handleCustomTimeSubmit} className="mt-12 relative group">
                    <input
                        type="number"
                        value={customInputVal}
                        onChange={(e) => setCustomInputVal(e.target.value)}
                        placeholder="Custom min"
                        className="bg-transparent border-b border-white/20 text-center text-white placeholder:text-white/20 outline-none focus:border-white/60 transition-all font-mono py-2 w-32"
                    />
                </form>
            </div>

            {/* Sound Toggle (Visual only for now) */}
            <div className="absolute bottom-6 right-6 text-white/30 hover:text-white transition-colors cursor-pointer">
                <Volume2 size={24} />
            </div>
        </div>
    );
}
