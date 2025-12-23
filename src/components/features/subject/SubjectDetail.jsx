import React, { useState } from 'react';
import { ChevronRight, Check, FileText, Edit2, CheckCircle2, Trash2, Plus, X } from 'lucide-react';
import { Card } from '../../ui/Card';
import { calculateDaysLeft, calculateSmartVelocity, calculateRawVelocity } from '../../../utils/helpers';
import { ICON_OPTIONS } from '../../../data/constants';
import MarkdownEditor from '../../ui/MarkdownEditor';

// Helper to get icon within this component or imported if shared
const getIcon = (type, className) => {
    const IconComponent = ICON_OPTIONS.find(opt => opt.id === type)?.icon || null;
    return IconComponent ? <IconComponent className={className} /> : null;
};

export default function SubjectDetail({
    subject,
    globalTargetDate,
    onBack,
    onToggleTopic,
    onUpdateTopicNotes,
    onUpdateTopicTitle,
    onUpdateExamDate,
    onUpdateSubjectName,
    onUpdateSubjectIcon,
    onAddTopic,
    onDeleteTopic,
    onReplaceTopics
}) {
    const [expandedNoteId, setExpandedNoteId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Bulk Edit State
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [bulkTopicText, setBulkTopicText] = useState("");

    const handleBulkUpdate = () => {
        if (!bulkTopicText.trim()) return;

        const lines = bulkTopicText.split('\n');
        const newTopics = lines
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index) => {
                // Clean start of line: removes "1.", "1)", etc.
                // Keeps the rest of the text intact (e.g., "Unit 01: Intro")
                let cleanTitle = line.replace(/^\s*\d+[\.\)]\s*/, '').trim();

                return {
                    id: `${Date.now()}-${index}`, // Unique IDs
                    title: cleanTitle,
                    completed: false,
                    notes: ""
                };
            });

        if (newTopics.length > 0) {
            if (window.confirm(`Replace all existing topics with these ${newTopics.length} new topics? This cannot be undone.`)) {
                onReplaceTopics(subject.id, newTopics);
                setIsBulkEditOpen(false);
                setBulkTopicText("");
                setIsEditing(false); // Optionally close edit mode
            }
        }
    };

    if (!subject) return null;

    // Calculate velocities for separate contexts
    const velocityExam = subject.examDate ? calculateRawVelocity(subject, subject.examDate) : null;
    const vGlobal = globalTargetDate ? calculateRawVelocity(subject, globalTargetDate) : null;

    const completedCount = subject.topics.filter(t => t.completed).length;

    return (
        <div className="animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-500 hover:text-indigo-400 transition-colors font-medium"
                >
                    <ChevronRight className="rotate-180 w-4 h-4 mr-1" /> Back to Dashboard
                </button>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isEditing
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                    {isEditing ? <><CheckCircle2 size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Subject</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <Card className="bg-slate-900/80 backdrop-blur-md">
                        {isEditing ? (
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Subject Name</label>
                                    <input
                                        type="text"
                                        value={subject.name}
                                        onChange={(e) => onUpdateSubjectName(subject.id, e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Icon</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                        {ICON_OPTIONS.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => onUpdateSubjectIcon(subject.id, opt.id)}
                                                className={`p-2 rounded-lg border flex-shrink-0 transition-all ${subject.iconType === opt.id ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                                            >
                                                <opt.icon size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${subject.color} text-white mb-4 shadow-lg shadow-indigo-900/20`}>
                                {getIcon(subject.iconType, "w-8 h-8")}
                            </div>
                        )}
                        {!isEditing && <h2 className="text-2xl font-bold text-white mb-1">{subject.name}</h2>}

                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-6">
                            <div
                                className={`h-full bg-gradient-to-r ${subject.color}`}
                                style={{ width: `${(completedCount / subject.topics.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>{completedCount} Completed</span>
                            <span>{subject.topics.length - completedCount} Left</span>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Exam Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={subject.examDate}
                                        onChange={(e) => onUpdateExamDate(subject.id, e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all [color-scheme:dark]"
                                    />
                                    {subject.examDate && (
                                        <button
                                            onClick={() => onUpdateExamDate(subject.id, "")}
                                            className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
                                            title="Clear Exam Date"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Exam Based Velocity (if Exam Date set) */}
                                {velocityExam !== null && (
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 shadow-inner flex justify-between items-center">
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">Pacing for Exam</div>
                                            <div className="text-2xl font-bold text-indigo-400">{velocityExam.toFixed(1)} <span className="text-xs text-slate-600 font-normal">/ day</span></div>
                                        </div>
                                    </div>
                                )}

                                {/* Global Sprint Based Velocity (if Global Date set) */}
                                {vGlobal !== null && (
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 shadow-inner flex justify-between items-center">
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">Global Sprint Pace</div>
                                            <div className="text-2xl font-bold text-emerald-400">{vGlobal.toFixed(1)} <span className="text-xs text-slate-600 font-normal">/ day</span></div>
                                        </div>
                                    </div>
                                )}

                                <div className="text-right pt-2 border-t border-slate-800/50">
                                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Topics Remaining</div>
                                    <div className="text-3xl font-black text-white">{subject.topics.length - completedCount}</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-xl text-white">Syllabus Tracker</h3>
                        <span className="text-sm text-slate-500">{completedCount}/{subject.topics.length} Completed</span>
                    </div>

                    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                        {subject.topics.map((topic, idx) => {
                            const isNotesOpen = expandedNoteId === topic.id;
                            return (
                                <div
                                    key={topic.id}
                                    className={`
                      group border-b border-slate-800/50 last:border-0 transition-all
                      ${topic.completed ? 'bg-slate-800/20' : 'hover:bg-slate-800/30'}
                  `}
                                >
                                    <div className="flex items-center p-4">
                                        {isEditing ? (
                                            <button
                                                onClick={() => onDeleteTopic(subject.id, topic.id)}
                                                className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center mr-4 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onToggleTopic(subject.id, topic.id)}
                                                className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all
                          ${topic.completed
                                                        ? `bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]`
                                                        : 'border-slate-600 hover:border-indigo-400 text-transparent'
                                                    }
                          `}
                                            >
                                                <Check size={14} strokeWidth={3} />
                                            </button>
                                        )}

                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={topic.title}
                                                onChange={(e) => onUpdateTopicTitle(subject.id, topic.id, e.target.value)}
                                                disabled={!isEditing && topic.completed}
                                                className={`
                              w-full bg-transparent outline-none text-sm font-medium transition-all
                              ${topic.completed && !isEditing ? 'text-slate-600 line-through' : 'text-slate-300 hover:text-white'}
                              ${isEditing ? 'border-b border-white/10 pb-1 focus:border-indigo-500' : ''}
                          `}
                                            />
                                        </div>

                                        {!isEditing && (
                                            <button
                                                onClick={() => setExpandedNoteId(isNotesOpen ? null : topic.id)}
                                                className={`p-2 rounded-lg transition-colors ml-2 ${isNotesOpen ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'}`}
                                                title="Notes"
                                            >
                                                <FileText size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {!isEditing && isNotesOpen && (
                                        <div className="px-4 pb-4 animate-in slide-in-from-top-1">
                                            <MarkdownEditor
                                                value={topic.notes || ""}
                                                onChange={(val) => onUpdateTopicNotes(subject.id, topic.id, val)}
                                                placeholder="Add detailed notes for this topic... (Markdown supported)"
                                                minHeight="300px"
                                                maxHeight="80vh"
                                                className="shadow-inner"
                                                pdfFilename={`${subject.name} - ${topic.title}`}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {isEditing && (
                            <>
                                {/* Bulk Edit Section */}
                                <div className="p-4 bg-slate-800/20 border-t border-slate-800">
                                    <button
                                        onClick={() => setIsBulkEditOpen(!isBulkEditOpen)}
                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-2 mb-2"
                                    >
                                        <Edit2 size={12} /> Bulk Replace Topics
                                    </button>

                                    {isBulkEditOpen && (
                                        <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 animate-in slide-in-from-top-2 mt-2">
                                            <p className="text-xs text-slate-500 mb-2">Paste a list of topics (one per line). Existing topics will be replaced!</p>
                                            <textarea
                                                value={bulkTopicText}
                                                onChange={(e) => setBulkTopicText(e.target.value)}
                                                placeholder={`1. Introduction\n2. Advanced Concepts\n3. Summary`}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder:text-slate-700 h-32 focus:ring-2 focus:ring-indigo-500/50 outline-none mb-3 font-mono"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setIsBulkEditOpen(false)}
                                                    className="px-4 py-2 text-slate-500 text-xs font-bold hover:text-white transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleBulkUpdate}
                                                    disabled={!bulkTopicText.trim()}
                                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    Update Topics
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => onAddTopic(subject.id)}
                                    className="w-full py-4 text-slate-500 hover:text-indigo-400 hover:bg-white/5 font-bold text-sm flex items-center justify-center gap-2 transition-all border-t border-slate-800"
                                >
                                    <Plus size={16} /> Add New Topic
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
