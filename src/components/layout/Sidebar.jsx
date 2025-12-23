import React from 'react';
import { Target, Trophy, Sparkles, Plus, Grid, Code, ChevronRight, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, goals, activeGoalId, onSelectGoal, onAddGoal }) {
    return (
        <>
            {/* Overlay for all screens when open */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div className={`
        fixed top-0 left-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-md z-50 transform transition-transform duration-300 ease-out shadow-2xl border-r border-white/5
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                                <Target size={22} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-white">Goal Tracker</h1>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 px-2">Your Trackers</div>

                        {goals.map(goal => (
                            <button
                                key={goal.id}
                                onClick={() => { onSelectGoal(goal.id); onClose(); }}
                                className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all group border ${activeGoalId === goal.id
                                    ? 'bg-slate-800 text-white shadow-lg border-white/5'
                                    : 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 border-transparent'
                                    }`}
                            >
                                <div className={`p-2 rounded-xl transition-colors ${activeGoalId === goal.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-indigo-400 group-hover:bg-slate-800'}`}>
                                    {goal.type === 'DSA' ? <Code size={18} /> : <Trophy size={18} />}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="font-bold truncate text-sm">{goal.title}</div>
                                    <div className={`text-[10px] font-medium uppercase tracking-wide mt-0.5 ${activeGoalId === goal.id ? 'text-slate-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                                        {goal.type === 'DSA' ? 'Roadmap' : 'Sprint Tracker'}
                                    </div>
                                </div>
                                {activeGoalId === goal.id && <ChevronRight size={16} className="text-slate-500" />}
                            </button>
                        ))}

                        <button
                            onClick={() => { onAddGoal(); onClose(); }}
                            className="w-full p-3.5 rounded-2xl border border-dashed border-slate-700 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2 mt-4 font-bold text-sm group"
                        >
                            <div className="p-1 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                                <Plus size={14} />
                            </div>
                            New Goal
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:border-white/10 transition-all">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10 shadow-inner"></div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">User Account</div>
                                    <div className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">PRO PLAN</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
