import React, { useState, useRef } from 'react';
import { Target, Clock, Calendar, Zap, List, PenTool, CheckCircle, FileText, Save, Settings, Download, Upload, Trash2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import MarkdownEditor from '../../ui/MarkdownEditor';
import { calculateDaysLeft, calculateSmartVelocity, getUrgencyLevel } from '../../../utils/helpers';
import { ICON_OPTIONS } from '../../../data/constants';
import QuoteWidget from '../quotes/QuoteWidget';
const getIcon = (type, className) => {
    const IconComponent = ICON_OPTIONS.find(opt => opt.id === type)?.icon || null;
    return IconComponent ? <IconComponent className={className} /> : null;
};

export default function Dashboard({
    subjects,
    globalTargetDate,
    onGlobalDateChange,
    onSubjectSelect,
    onToggleTopic,
    onUpdateTopicNotes,
    scratchpad,
    setScratchpad,
    onStartPomodoro,
    onEditSubjects,
    onExport,
    onImport,
    onReset
}) {
    const [dashboardTab, setDashboardTab] = useState('agenda');
    const [expandedNoteId, setExpandedNoteId] = useState(null);
    const fileInputRef = useRef(null);

    const sortedSubjects = [...subjects].sort((a, b) => {
        // Calculate effective dates (min of Global vs Exam)
        const getEffectiveDate = (sub) => {
            const global = globalTargetDate ? new Date(globalTargetDate) : null;
            const exam = sub.examDate ? new Date(sub.examDate) : null;

            if (global && exam) return global < exam ? global : exam;
            return exam || global; // If one missing, take the other
        };

        const dateA = getEffectiveDate(a);
        const dateB = getEffectiveDate(b);

        if (!dateA) return 1; // Limitless goes to bottom
        if (!dateB) return -1;
        return dateA - dateB;
    });

    const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
    const completedTopics = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.completed).length, 0);
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    let totalDailyTopicsNeeded = 0;
    const subjectsNeedingAttention = [];

    sortedSubjects.forEach(sub => {
        const v = calculateSmartVelocity(sub, globalTargetDate);
        if (v > 0) {
            totalDailyTopicsNeeded += v;
            const nextTopics = sub.topics.filter(t => !t.completed).slice(0, Math.ceil(v));
            if (nextTopics.length > 0) {
                subjectsNeedingAttention.push({
                    subject: sub,
                    velocity: v,
                    topics: nextTopics
                });
            }
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header & Main Stats */}
            <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-800">
                <div className="bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-500">
                        <Target size={200} />
                    </div>
                    {/* Ambient Glow */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[80px]"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black flex items-center gap-3 text-white tracking-tight">
                                Study Planner
                                <span className="hidden md:inline-flex text-indigo-400 text-xs font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">{subjects.length > 0 ? 'ExamSprint' : 'Dashboard'}</span>
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">Track your progress and crush your exams.</p>

                            <button
                                onClick={onStartPomodoro}
                                className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/50 md:hidden active:scale-95"
                            >
                                <Clock size={18} /> Start Focus Session
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto md:items-end">
                            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex flex-col gap-1 w-full md:min-w-[200px] shadow-lg">
                                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                    <Calendar size={12} /> Global Finish Date
                                </label>
                                <input
                                    type="date"
                                    value={globalTargetDate}
                                    onChange={onGlobalDateChange}
                                    className="bg-transparent text-xl font-bold text-white outline-none w-full cursor-pointer hover:text-indigo-300 transition-colors [color-scheme:dark]"
                                />
                            </div>

                            {/* Data Controls */}
                            <div className="flex flex-wrap gap-2 w-full">
                                <button
                                    onClick={onExport}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-700"
                                    title="Export Data to JSON"
                                >
                                    <Download size={14} /> Export
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-700"
                                    title="Import Data from JSON"
                                >
                                    <Upload size={14} /> Import
                                </button>
                                <button
                                    onClick={onReset}
                                    className="bg-slate-800 hover:bg-rose-900/30 text-rose-500/70 hover:text-rose-400 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-700 hover:border-rose-500/30"
                                    title="Reset All Data"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={onImport}
                                    accept=".json"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-800 border-b border-slate-800 bg-slate-900/50">
                    <div className="p-6 text-center group hover:bg-slate-800/50 transition-colors">
                        <div className="text-3xl font-black text-indigo-400 group-hover:scale-110 transition-transform duration-300">{totalDailyTopicsNeeded.toFixed(1)}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Topics / Day</div>
                    </div>

                    <div className="p-6 text-center group hover:bg-slate-800/50 transition-colors">
                        <div className="text-3xl font-black text-blue-400 group-hover:scale-110 transition-transform duration-300">{subjects.length}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Subjects</div>
                    </div>
                    <div className="p-6 text-center group hover:bg-slate-800/50 transition-colors">
                        <div className="text-3xl font-black text-emerald-400 group-hover:scale-110 transition-transform duration-300">{overallProgress}%</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Completed</div>
                    </div>
                    <div className="p-6 text-center group hover:bg-slate-800/50 transition-colors">
                        <div className="text-3xl font-black text-rose-400 group-hover:scale-110 transition-transform duration-300">{calculateDaysLeft(globalTargetDate)}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Days Left</div>
                    </div>
                    <button
                        type="button"
                        onClick={onStartPomodoro}
                        className="p-6 text-center cursor-pointer hover:bg-slate-800/80 transition-colors group w-full relative z-10 hidden md:flex flex-col items-center justify-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors"></div>
                        <div className="text-2xl font-bold text-slate-400 group-hover:text-indigo-400 flex justify-center items-center gap-2 transition-colors mb-1 group-hover:scale-110 duration-300">
                            <Clock className="w-8 h-8" strokeWidth={2.5} />
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold group-hover:text-indigo-400 transition-colors tracking-widest">Start Focus</div>
                    </button>
                </div>
            </div>

            {/* Quote Widget */}
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-700 delay-100">
                <QuoteWidget />
            </div>

            {/* Navigation */}
            <div className="flex gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto shadow-inner">
                {[
                    { id: 'agenda', icon: <Zap size={18} />, label: "Today's Agenda" },
                    { id: 'subjects', icon: <List size={18} />, label: "All Subjects" },
                    { id: 'scratchpad', icon: <PenTool size={18} />, label: "Brain Dump" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setDashboardTab(tab.id)}
                        className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex-1 justify-center relative overflow-hidden
              ${dashboardTab === tab.id
                                ? 'bg-slate-800 text-white shadow-lg shadow-black/20 border border-slate-700'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                            }
            `}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Views */}
            {
                dashboardTab === 'agenda' && (
                    <div className="animate-in slide-in-from-left duration-300 space-y-8">

                        {subjectsNeedingAttention.length === 0 ? (
                            <div className="bg-emerald-500/5 rounded-3xl p-12 text-center border border-emerald-500/10 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                                <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/20">
                                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                                </div>
                                <h3 className="text-emerald-400 font-black text-3xl mb-3 tracking-tight">You're All Caught Up!</h3>
                                <p className="text-emerald-500/60 max-w-md mx-auto font-medium">No urgent topics for today based on your velocity. Relax or pick a subject to study ahead.</p>
                                <button onClick={() => setDashboardTab('subjects')} className="mt-6 text-emerald-400 font-bold hover:text-emerald-300 bg-emerald-500/10 px-6 py-2 rounded-full transition-colors">Study Ahead &rarr;</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Attention Needed</h3>
                                {subjectsNeedingAttention.map((item, idx) => (
                                    <div key={idx} className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden group hover:border-slate-700 transition-colors">
                                        <div className="bg-slate-950/50 px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                                                <div className={`p-2 rounded-xl bg-gradient-to-br ${item.subject.color} text-white shadow-lg shrink-0`}>
                                                    {getIcon(item.subject.iconType, "w-4 h-4")}
                                                </div>
                                                <span className="font-bold text-slate-200 text-base sm:text-lg truncate">{item.subject.name}</span>
                                            </div>
                                            <div className="flex sm:block justify-end w-full sm:w-auto">
                                                <Badge type="warning">Target: {Math.ceil(item.velocity)}</Badge>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-slate-800">
                                            {item.topics.map(topic => {
                                                const isNotesOpen = expandedNoteId === topic.id;
                                                return (
                                                    <div key={topic.id} className="transition-colors hover:bg-white/5 bg-slate-900">
                                                        <div className="p-4 flex items-start gap-4">
                                                            <button
                                                                onClick={() => onToggleTopic(item.subject.id, topic.id)}
                                                                className="mt-1 w-6 h-6 rounded-full border-2 border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/20 transition-all flex-shrink-0 flex items-center justify-center group/btn"
                                                            >
                                                                <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                                            </button>
                                                            <div className="flex-1 min-w-0 pt-0.5">
                                                                <p className="text-slate-300 font-semibold leading-relaxed group-hover:text-white transition-colors">{topic.title}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setExpandedNoteId(isNotesOpen ? null : topic.id)}
                                                                className={`p-2 rounded-xl transition-all ${isNotesOpen ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10'}`}
                                                                title="Add Notes"
                                                            >
                                                                <FileText size={18} />
                                                            </button>
                                                        </div>

                                                        {isNotesOpen && (
                                                            <div className="px-4 md:px-12 pb-6 animate-in slide-in-from-top-2">
                                                                <div className="relative group/input">
                                                                    <MarkdownEditor
                                                                        value={topic.notes || ""}
                                                                        onChange={(val) => onUpdateTopicNotes(item.subject.id, topic.id, val)}
                                                                        placeholder="Add quick notes, formulas, or key concepts here..."
                                                                        minHeight="150px"
                                                                        maxHeight="80vh"
                                                                        className="shadow-inner"
                                                                        pdfFilename={`${item.subject.name} - ${topic.title}`}
                                                                    />
                                                                    <div className="absolute bottom-3 right-3 text-xs text-slate-600 flex items-center gap-1 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none">
                                                                        <Save size={12} /> Auto-saving
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                dashboardTab === 'subjects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right duration-300">
                        {sortedSubjects.map(sub => {
                            const daysLeft = calculateDaysLeft(sub.examDate);
                            const velocity = calculateSmartVelocity(sub, globalTargetDate);
                            const urgency = getUrgencyLevel(velocity);
                            const progress = sub.topics.length > 0 ? Math.round((sub.topics.filter(t => t.completed).length / sub.topics.length) * 100) : 0;

                            return (
                                <Card
                                    key={sub.id}
                                    onClick={() => onSubjectSelect(sub.id)}
                                    className="cursor-pointer group hover:-translate-y-1 hover:border-indigo-500/30 bg-slate-900 border-slate-800"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${sub.color} text-white shadow-lg group-hover:shadow-indigo-500/20 transition-all`}>
                                            {getIcon(sub.iconType, "w-6 h-6")}
                                        </div>
                                        <Badge type={urgency.color}>{daysLeft > 0 ? `${daysLeft} Days` : 'No Date'}</Badge>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-200 mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{sub.name}</h3>

                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-5">
                                        <div className="flex items-center gap-1"><Target size={12} /> Vel: {velocity.toFixed(1)}</div>
                                        <div className="flex items-center gap-1"><List size={12} /> {sub.topics.length} Topics</div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-800/50">
                                            <div
                                                className={`h-full bg-gradient-to-r ${sub.color} shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-500`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                        <Card
                            onClick={onEditSubjects}
                            className="border-2 border-dashed border-slate-800 bg-transparent flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-slate-900/50 group min-h-[200px]"
                        >
                            <div className="p-4 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all mb-3 text-slate-500">
                                <Settings className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-slate-500 group-hover:text-indigo-400 transition-colors">Edit Subjects</span>
                        </Card>
                    </div>
                )
            }

            {
                dashboardTab === 'scratchpad' && (
                    <div className="animate-in zoom-in duration-300 h-full">
                        <div className="bg-amber-950/10 border border-amber-900/30 rounded-3xl p-6 shadow-sm relative min-h-[600px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-amber-500/80 flex items-center gap-2 text-xl">
                                    <PenTool className="w-6 h-6" /> Brain Dump
                                </h3>
                                <span className="text-xs font-bold text-amber-500/40 uppercase tracking-widest border border-amber-500/20 px-3 py-1 rounded-full">Auto-Saved</span>
                            </div>
                            <MarkdownEditor
                                value={scratchpad}
                                onChange={setScratchpad}
                                placeholder="Write anything here... Ideas, quick tasks, or random thoughts. Markdown supported!"
                                minHeight="500px"
                                maxHeight="80vh"
                                className="border-amber-900/30 bg-amber-900/10"
                                pdfFilename="Brain Dump"
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}
