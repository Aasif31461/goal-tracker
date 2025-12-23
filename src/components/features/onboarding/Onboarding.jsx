import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Plus, Trash2, ArrowRight, Minus, Check, BookOpen, Upload } from 'lucide-react';
import { ICON_OPTIONS, COLORS } from '../../../data/constants';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

// Helper to get icon within this component or imported if shared
const getIcon = (type, className) => {
    const IconComponent = ICON_OPTIONS.find(opt => opt.id === type)?.icon || BookOpen;
    return <IconComponent className={className} />;
};

export default function Onboarding({ onComplete, goalId, initialSubjects = [], onImport }) {
    // ... (existing state) ...
    // ...
    // ...

    // Use persistent state for the onboarding draft
    const draftKey = `onboarding_draft_${goalId || 'default'}`;

    const fileInputRef = useRef(null);
    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // If editing (initialSubjects has data), start at Step 1, otherwise 0
    const [step, setStep] = useLocalStorage(`${draftKey}_step`, initialSubjects.length > 0 ? 1 : 0);

    // Initialize with existing data if available, mapped to setup format
    const [setupSubjects, setSetupSubjects] = useLocalStorage(`${draftKey}_subjects`,
        initialSubjects.length > 0
            ? initialSubjects.map(s => ({
                ...s,
                topicCount: s.topics.length // Ensure count matches existing
            }))
            : [{ id: 1, name: "Subject 1", iconType: 'book', examDate: "", topicCount: 14, topics: [] }]
    );

    const clearDraft = () => {
        localStorage.removeItem(`${draftKey}_step`);
        localStorage.removeItem(`${draftKey}_subjects`);
    };

    // ... (handlers same as before) ...
    const handleAddSetupSubject = () => {
        setSetupSubjects(prev => [
            ...prev,
            { id: Date.now(), name: "", iconType: 'book', examDate: "", topicCount: 14, topics: [] }
        ]);
    };
    const handleRemoveSetupSubject = (id) => setSetupSubjects(prev => prev.filter(s => s.id !== id));
    const updateSetupSubject = (id, field, value) => {
        setSetupSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    // Bulk Add Logic
    const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
    const [bulkText, setBulkText] = useState("");

    const handleBulkAdd = () => {
        if (!bulkText.trim()) return;

        const lines = bulkText.split('\n');
        const newSubjects = lines
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index) => {
                // Remove leading numbers (e.g., "1. ", "2) ") if present
                // Also handles lines without numbers correctly
                const cleanName = line.replace(/^\s*\d+[\.\)]\s*/, '').trim();

                // Assign random icon
                const randomIcon = ICON_OPTIONS[Math.floor(Math.random() * ICON_OPTIONS.length)].id;

                return {
                    id: Date.now() + index, // Ensure unique ID
                    name: cleanName,
                    iconType: randomIcon,
                    examDate: "",
                    topicCount: 14,
                    topics: []
                };
            });

        setSetupSubjects(prev => {
            // If the only item is the default empty one, replace it
            if (prev.length === 1 && !prev[0].name) {
                return newSubjects;
            }
            return [...prev, ...newSubjects];
        });

        setBulkText("");
        setIsBulkAddOpen(false);
    };

    // Smart Merge: Reconcile new count while keeping existing topic data
    const reconcileTopics = (existingTopics, targetCount) => {
        const currentCount = existingTopics.length;
        if (targetCount === currentCount) return existingTopics;

        if (targetCount > currentCount) {
            // Add new topics
            const newTopics = Array.from({ length: targetCount - currentCount }, (_, i) => ({
                id: `${Date.now()}-${i}`,
                title: `Topic ${currentCount + i + 1}`,
                completed: false,
                notes: ""
            }));
            return [...existingTopics, ...newTopics];
        } else {
            // Truncate (Remove from end)
            return existingTopics.slice(0, targetCount);
        }
    };

    const handleComplete = () => {
        const finalSubjects = setupSubjects.map((s, index) => {
            // Generate or Merge topics
            let finalTopics = [];
            if (s.topics && s.topics.length > 0) {
                // Existing subject with topics -> Reconcile
                finalTopics = reconcileTopics(s.topics, s.topicCount || 10);
            } else {
                // New subject -> Generate fresh
                finalTopics = Array.from({ length: s.topicCount || 10 }, (_, i) => ({
                    id: `${s.id}-${i}`, title: `Topic ${i + 1}`, completed: false, notes: ""
                }));
            }

            return {
                ...s,
                color: COLORS[index % COLORS.length],
                topics: finalTopics
            };
        });
        clearDraft();
        onComplete(finalSubjects);
    };

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to delete all subjects?")) {
            setSetupSubjects([{ id: Date.now(), name: "", iconType: 'book', examDate: "", topicCount: 14, topics: [] }]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="max-w-4xl w-full bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative z-10">
                {/* Steps Progress */}
                <div className="bg-slate-900 border-b border-white/5 p-6 flex justify-between items-center">
                    <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                            <div key={i} className={`h-1.5 w-12 rounded-full transition-colors ${step >= i ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
                        ))}
                    </div>
                    {step > 0 && <button onClick={() => setStep(s => s - 1)} className="text-slate-500 hover:text-white transition-colors"><ArrowLeft size={20} /></button>}
                </div>

                <div className="flex-1 p-8 md:p-12 flex flex-col">
                    {step === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-indigo-500/10 p-6 rounded-full text-indigo-400 ring-1 ring-indigo-500/20 shadow-xl shadow-indigo-500/10 mb-4">
                                <Sparkles size={64} />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Study Tracker Setup</h1>
                                <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
                                    Build your personalized study plan. Track exams, manage topics, and focus like a pro.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4 w-full max-w-xs">
                                <button
                                    onClick={() => setStep(1)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold px-12 py-4 rounded-2xl shadow-lg shadow-indigo-900/50 hover:shadow-indigo-900/80 transition-all transform hover:-translate-y-1 w-full"
                                >
                                    Let's Get Started
                                </button>
                                {onImport && (
                                    <>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={onImport}
                                            accept=".json"
                                            className="hidden"
                                        />
                                        <button
                                            onClick={handleImportClick}
                                            className="text-slate-500 hover:text-indigo-400 font-medium text-sm flex items-center justify-center gap-2 transition-colors py-2"
                                        >
                                            <Upload size={16} /> Import from Backup
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Define Your Subjects</h2>
                                    <p className="text-slate-400">What are you studying? Add them below.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleClearAll}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-wider"
                                    >
                                        <Trash2 size={14} /> Clear All
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6 custom-scrollbar">
                                {setupSubjects.map((sub, idx) => (
                                    <div key={sub.id} className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-xl border border-white/5 group hover:bg-slate-800 transition-colors">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="md:col-span-5">
                                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Subject Name</label>
                                                <input
                                                    type="text"
                                                    value={sub.name}
                                                    onChange={(e) => updateSetupSubject(sub.id, 'name', e.target.value)}
                                                    placeholder="e.g. Data Structures"
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                                                    autoFocus={idx === setupSubjects.length - 1}
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Exam Date</label>
                                                <input
                                                    type="date"
                                                    value={sub.examDate}
                                                    onChange={(e) => updateSetupSubject(sub.id, 'examDate', e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Icon</label>
                                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                                                    {ICON_OPTIONS.map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => updateSetupSubject(sub.id, 'iconType', opt.id)}
                                                            className={`p-2.5 rounded-lg border transition-all ${sub.iconType === opt.id ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'}`}
                                                            title={opt.label}
                                                        >
                                                            <opt.icon size={16} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveSetupSubject(sub.id)}
                                            className="mt-7 text-slate-600 hover:text-rose-400 p-2 transition-colors"
                                            disabled={setupSubjects.length === 1}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}

                                {/* Standard Add Button */}
                                <button
                                    onClick={handleAddSetupSubject}
                                    className="w-full py-4 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-400 font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    <Plus size={20} /> Add Another Subject
                                </button>

                                {/* Bulk Add Section */}
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => setIsBulkAddOpen(!isBulkAddOpen)}
                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-2 mb-2"
                                    >
                                        <Sparkles size={14} /> Bulk Add from Text
                                    </button>

                                    {isBulkAddOpen && (
                                        <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 animate-in slide-in-from-top-2">
                                            <p className="text-xs text-slate-500 mb-2">Paste a list of subjects (one per line). We'll handle numbering cleanup.</p>
                                            <textarea
                                                value={bulkText}
                                                onChange={(e) => setBulkText(e.target.value)}
                                                placeholder={`1. Discrete Mathematics\n2. Data Visualization\n3. Python Programming`}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder:text-slate-700 h-32 focus:ring-2 focus:ring-indigo-500/50 outline-none mb-3 font-mono"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setIsBulkAddOpen(false)}
                                                    className="px-4 py-2 text-slate-500 text-xs font-bold hover:text-white transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleBulkAdd}
                                                    disabled={!bulkText.trim()}
                                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    Generate Subjects
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/5">
                                <button
                                    onClick={() => setStep(2)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-900/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    disabled={setupSubjects.some(s => !s.name.trim())}
                                >
                                    Next: Define Topics <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">Configure Topics</h2>
                                <p className="text-slate-400">How many chapters or modules in each subject?</p>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6 custom-scrollbar">
                                {setupSubjects.map(sub => (
                                    <div key={sub.id} className="bg-slate-800/50 p-6 rounded-xl border border-white/5 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg ring-1 ring-indigo-500/20">
                                                {getIcon(sub.iconType, "w-6 h-6")}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{sub.name}</h3>
                                                <p className="text-xs text-slate-500">Default: Topic 1 - Topic N</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateSetupSubject(sub.id, 'topicCount', Math.max(1, (sub.topicCount || 0) - 1))}
                                                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <div className="text-center w-16">
                                                <span className="text-2xl font-bold text-white">{sub.topicCount}</span>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold">Topics</div>
                                            </div>
                                            <button
                                                onClick={() => updateSetupSubject(sub.id, 'topicCount', (sub.topicCount || 0) + 1)}
                                                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/5">
                                <button
                                    onClick={handleComplete}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-900/50 flex items-center gap-2 transition-all"
                                >
                                    Finish Setup <Check size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
