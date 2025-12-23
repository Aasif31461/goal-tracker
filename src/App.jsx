import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';

// Components
import Sidebar from './components/layout/Sidebar';
import GoalLibrary from './components/features/goals/GoalLibrary';
import ExamSprintTracker from './components/trackers/ExamSprintTracker';

export default function App() {
  // --- Persistent State for Goals List ---
  const [goals, setGoals] = useLocalStorage('goal-tracker-goals', [
    { id: 'default', title: 'ExamSprint', type: 'EXAM_SPRINT', createdAt: new Date().toISOString() }
  ]);

  const [activeGoalId, setActiveGoalId] = useLocalStorage('goal-tracker-active-id', null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Migration: Fix old goal titles ---
  React.useEffect(() => {
    const hasOldTitles = goals.some(g => g.title === 'Exam Sprint' || g.title === 'My Exam Sprint');
    if (hasOldTitles) {
      setGoals(prev => prev.map(g => {
        if (g.title === 'Exam Sprint' || g.title === 'My Exam Sprint') {
          return { ...g, title: 'ExamSprint' };
        }
        return g;
      }));
    }
  }, [goals, setGoals]);

  // --- Handlers ---
  const handleCreateGoal = (goalData) => {
    const newGoal = {
      id: `goal_${Date.now()}`,
      ...goalData,
      createdAt: new Date().toISOString()
    };
    setGoals(prev => [...prev, newGoal]);
    setActiveGoalId(newGoal.id);
  };

  const handleSelectGoal = (id) => {
    setActiveGoalId(id);
    setIsSidebarOpen(false);
  };

  const activeGoal = goals.find(g => g.id === activeGoalId);

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        goals={goals}
        activeGoalId={activeGoalId}
        onSelectGoal={handleSelectGoal}
        onAddGoal={() => setActiveGoalId(null)}
      />

      <div className="flex-1 flex flex-col min-h-screen transition-all md:pl-0 w-full max-w-[100vw] overflow-x-hidden">

        {/* Mobile Header / Hamburger */}
        <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
          >
            <Menu size={24} />
          </button>
          <div className="font-bold text-slate-200 truncate text-lg tracking-tight">
            {activeGoal ? activeGoal.title : "ExamSprint"}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {!activeGoalId && (
            <GoalLibrary
              onCreateGoal={handleCreateGoal}
              goals={goals}
              onSelectGoal={handleSelectGoal}
            />
          )}

          {activeGoalId && activeGoal?.type === 'EXAM_SPRINT' && (
            <ExamSprintTracker
              key={activeGoalId} // Force remount on goal switch
              goalId={activeGoalId}
              onBack={() => setActiveGoalId(null)}
            />
          )}

          {activeGoalId && activeGoal?.type === 'DSA' && (
            <div className="text-center py-20 animate-in fade-in">
              <div className="text-4xl font-bold text-slate-800 mb-4 select-none">Coming Soon</div>
              <p className="text-slate-600">The DSA Roadmap tracker logic is currently being implemented.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}