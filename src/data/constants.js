import {
    Code, Database, Sigma, BookOpen, Activity, Layout
} from 'lucide-react';

export const ICON_OPTIONS = [
    { id: 'code', icon: Code, label: 'Code' },
    { id: 'database', icon: Database, label: 'Data' },
    { id: 'math', icon: Sigma, label: 'Math' },
    { id: 'book', icon: BookOpen, label: 'Theory' },
    { id: 'activity', icon: Activity, label: 'Stats' },
    { id: 'layout', icon: Layout, label: 'Design' },
];

export const COLORS = [
    "from-purple-500 to-indigo-600",
    "from-pink-500 to-rose-600",
    "from-blue-500 to-cyan-600",
    "from-yellow-400 to-orange-500",
    "from-emerald-500 to-teal-600",
    "from-red-500 to-orange-600",
    "from-cyan-500 to-blue-600",
];

export const STORAGE_KEYS = {
    DATA: 'mca-tracker-v4-data',
    ONBOARDING: 'mca-tracker-v4-onboarded',
    TARGET: 'mca-tracker-v4-target',
    STATS: 'mca-tracker-v4-stats',
    SCRATCHPAD: 'mca-tracker-v4-scratchpad'
};
