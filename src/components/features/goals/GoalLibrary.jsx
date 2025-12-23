import React, { useState } from 'react';
import { Trophy, Code, Plus, ArrowRight, Calendar, ArrowUpRight } from 'lucide-react';
import { Card } from '../../ui/Card';
import QuoteWidget from '../quotes/QuoteWidget';

export default function GoalLibrary({ onCreateGoal, goals = [], onSelectGoal }) {
    const [showWizard, setShowWizard] = useState(false);
    const [newGoalData, setNewGoalData] = useState({ title: '', type: 'EXAM_SPRINT' });

    const handleCreate = () => {
        if (!newGoalData.title) return;
        onCreateGoal(newGoalData);
        setNewGoalData({ title: '', type: 'EXAM_SPRINT' });
        setShowWizard(false);
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    if (showWizard) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Create New Goal</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Goal Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newGoalData.title}
                                    onChange={e => setNewGoalData({ ...newGoalData, title: e.target.value })}
                                    placeholder="e.g. Semester 5 Finals"
                                    className="w-full text-xl font-bold bg-transparent border-b-2 border-slate-700 focus:border-indigo-500 outline-none py-2 text-white placeholder:text-slate-600 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase mb-3">Goal Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setNewGoalData({ ...newGoalData, type: 'EXAM_SPRINT' })}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newGoalData.type === 'EXAM_SPRINT' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 hover:border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                                    >
                                        <Trophy size={24} />
                                        <span className="font-bold text-sm">ExamSprint</span>
                                    </button>
                                    <button
                                        onClick={() => setNewGoalData({ ...newGoalData, type: 'DSA' })}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newGoalData.type === 'DSA' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 hover:border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                                    >
                                        <Code size={24} />
                                        <span className="font-bold text-sm">DSA Roadmap</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowWizard(false)} className="flex-1 py-3 font-bold text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                            <button
                                onClick={handleCreate}
                                disabled={!newGoalData.title}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50 transition-all"
                            >
                                Create Goal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4 pt-10 pb-6">
                <div className="inline-block p-4 rounded-full bg-slate-900 border border-slate-800 shadow-xl mb-2">
                    <Trophy size={48} className="text-indigo-500" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">Your Goal Library</h1>
                <p className="text-slate-400 max-w-lg mx-auto text-lg">Select an existing tracker to jump back in, or launch a new sprint.</p>
            </div>

            <div className="max-w-xl mx-auto mb-10">
                <QuoteWidget />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* New Goal Card */}
                <button
                    onClick={() => setShowWizard(true)}
                    className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/50 text-slate-500 hover:text-indigo-400 transition-all group min-h-[220px]"
                >
                    <div className="bg-slate-800 p-4 rounded-full mb-4 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold text-lg">Create New Goal</span>
                </button>

                {/* Existing Goals */}
                {goals.map(goal => (
                    <div
                        key={goal.id}
                        onClick={() => onSelectGoal && onSelectGoal(goal.id)}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-start justify-between min-h-[220px] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
                            <ArrowUpRight size={24} />
                        </div>

                        <div className="space-y-4 w-full">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${goal.type === 'DSA' ? 'bg-purple-500/10 text-purple-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                {goal.type === 'DSA' ? <Code size={24} /> : <Trophy size={24} />}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    {goal.type === 'DSA' ? 'Roadmap' : 'Sprint Tracker'}
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">{goal.title}</h3>
                            </div>
                        </div>

                        <div className="w-full pt-4 border-t border-slate-800 mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Calendar size={14} />
                            <span>Created {formatDate(goal.createdAt)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
