import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../data/constants';

// Features
import Onboarding from '../features/onboarding/Onboarding';
import Dashboard from '../features/dashboard/Dashboard';
import SubjectDetail from '../features/subject/SubjectDetail';
import Timer from '../features/timer/Timer';

export default function ExamSprintTracker({ goalId, onBack }) {
    // Prefix keys with goalId to isolate data
    const key = (k) => `${goalId}_${k}`;

    const [onboardingComplete, setOnboardingComplete] = useLocalStorage(key(STORAGE_KEYS.ONBOARDING), false);
    const [subjects, setSubjects] = useLocalStorage(key(STORAGE_KEYS.DATA), []);
    const [globalTargetDate, setGlobalTargetDate] = useLocalStorage(key(STORAGE_KEYS.TARGET), new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
    const [scratchpad, setScratchpad] = useLocalStorage(key(STORAGE_KEYS.SCRATCHPAD), "");
    const [stats, setStats] = useLocalStorage(key(STORAGE_KEYS.STATS), { focusMinutes: 0, breakMinutes: 0, sessions: 0 });

    const [view, setView] = useState('dashboard');
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);

    const handleOnboardingComplete = (finalSubjects) => {
        setSubjects(finalSubjects);
        setOnboardingComplete(true);
    };

    const updateSubject = (id, updater) => {
        setSubjects(prev => prev.map(s => s.id === id ? updater(s) : s));
    };

    const toggleTopic = (subId, topicId) => {
        updateSubject(subId, (s) => ({
            ...s,
            topics: s.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t)
        }));
    };

    const updateTopicNotes = (subId, topicId, noteText) => {
        updateSubject(subId, (s) => ({
            ...s,
            topics: s.topics.map(t => t.id === topicId ? { ...t, notes: noteText } : t)
        }));
    };

    const updateTopicTitle = (subId, topicId, newTitle) => {
        updateSubject(subId, (s) => ({
            ...s,
            topics: s.topics.map(t => t.id === topicId ? { ...t, title: newTitle } : t)
        }));
    };

    const updateExamDate = (subId, date) => {
        updateSubject(subId, (s) => ({ ...s, examDate: date }));
    };

    const updateSubjectName = (subId, newName) => {
        updateSubject(subId, (s) => ({ ...s, name: newName }));
    };

    const updateSubjectIcon = (subId, newIcon) => {
        updateSubject(subId, (s) => ({ ...s, iconType: newIcon }));
    };

    const addTopic = (subId) => {
        updateSubject(subId, (s) => {
            const nextIdx = s.topics.length;
            return {
                ...s,
                topics: [
                    ...s.topics,
                    { id: `${Date.now()}`, title: `Topic ${nextIdx + 1}`, completed: false, notes: "" }
                ]
            };
        });
    };

    const deleteTopic = (subId, topicId) => {
        updateSubject(subId, (s) => ({
            ...s,
            topics: s.topics.filter(t => t.id !== topicId)
        }));
    };

    const replaceTopics = (subId, newTopics) => {
        updateSubject(subId, (s) => ({
            ...s,
            topics: newTopics
        }));
    };

    const handleSessionComplete = (mode, durationMins) => {
        setStats(prev => ({
            ...prev,
            focusMinutes: mode === 'focus' ? prev.focusMinutes + durationMins : prev.focusMinutes,
            breakMinutes: mode !== 'focus' ? prev.breakMinutes + durationMins : prev.breakMinutes,
            sessions: mode === 'focus' ? prev.sessions + 1 : prev.sessions
        }));
    };

    const handleExport = () => {
        const data = {
            onboardingComplete,
            subjects,
            globalTargetDate,
            scratchpad,
            stats,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam-sprint-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // Basic validation checks
                const isValid = data.subjects && Array.isArray(data.subjects);

                if (isValid) {
                    if (window.confirm("This will overwrite your current progress with the imported data. Are you sure?")) {
                        if (data.onboardingComplete !== undefined) setOnboardingComplete(data.onboardingComplete);
                        if (data.subjects) setSubjects(data.subjects);
                        if (data.globalTargetDate) setGlobalTargetDate(data.globalTargetDate);
                        if (data.scratchpad !== undefined) setScratchpad(data.scratchpad);
                        if (data.stats) setStats(data.stats);
                        alert("Data imported successfully!");
                        // Reset file input if needed, though React state handles the UI
                    }
                } else {
                    alert("Invalid or corrupted data file.");
                }
            } catch (error) {
                console.error("Import error:", error);
                alert("Failed to parse data file.");
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (window.confirm("ARE YOU SURE? This will permanently delete ALL subjects, notes, and progress. This action cannot be undone.")) {
            if (window.confirm("Last chance: Really wipe everything and start over?")) {
                setOnboardingComplete(false);
                setSubjects([]);
                setGlobalTargetDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
                setScratchpad("");
                setStats({ focusMinutes: 0, breakMinutes: 0, sessions: 0 });
                setView('dashboard');
            }
        }
    };

    if (!onboardingComplete) {
        return <Onboarding onComplete={handleOnboardingComplete} initialSubjects={subjects} />;
    }

    return (
        <div className="animate-in fade-in duration-300">
            {view === 'dashboard' && (
                <Dashboard
                    subjects={subjects}
                    globalTargetDate={globalTargetDate}
                    onGlobalDateChange={(e) => setGlobalTargetDate(e.target.value)}
                    onSubjectSelect={(id) => { setSelectedSubjectId(id); setView('subject'); }}
                    onToggleTopic={toggleTopic}
                    onUpdateTopicNotes={updateTopicNotes}
                    scratchpad={scratchpad}
                    setScratchpad={setScratchpad}
                    onStartPomodoro={() => setView('pomodoro')}
                    onEditSubjects={() => setOnboardingComplete(false)}
                    onExport={handleExport}
                    onImport={handleImport}
                    onReset={handleReset}
                />
            )}

            {view === 'subject' && (
                <SubjectDetail
                    subject={subjects.find(s => s.id === selectedSubjectId)}
                    globalTargetDate={globalTargetDate}
                    onBack={() => setView('dashboard')}
                    onToggleTopic={toggleTopic}
                    onUpdateTopicNotes={updateTopicNotes}
                    onUpdateTopicTitle={updateTopicTitle}
                    onUpdateExamDate={updateExamDate}
                    onUpdateSubjectName={updateSubjectName}
                    onUpdateSubjectIcon={updateSubjectIcon}
                    onAddTopic={addTopic}
                    onDeleteTopic={deleteTopic}
                    onReplaceTopics={replaceTopics}
                />
            )}

            {view === 'pomodoro' && (
                <Timer
                    onExit={() => setView('dashboard')}
                    onSessionComplete={handleSessionComplete}
                />
            )}
        </div>
    );
}
