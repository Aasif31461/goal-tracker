export const calculateDaysLeft = (dateStr) => {
    if (!dateStr) return 0;

    // Create TODAY at local midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse Input manually to ensure LOCAL midnight construction
    // "2025-12-24" -> [2025, 12, 24]
    const [year, month, day] = dateStr.split('-').map(Number);
    // Note: Month is 0-indexed in JS Date constructor
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);

    const diffTime = target - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, days);
};

export const calculateRawVelocity = (subject, targetDateStr) => {
    if (!targetDateStr) return 0;
    const days = calculateDaysLeft(targetDateStr);
    const effectiveDays = Math.max(1, days);

    const remaining = subject.topics.filter(t => !t.completed).length;
    if (remaining === 0) return 0;
    return remaining / effectiveDays;
};

export const calculateSmartVelocity = (subject, globalTargetDate) => {
    // 1. Determine effective days remaining
    let effectiveDays = null;

    const subjectDays = subject.examDate ? calculateDaysLeft(subject.examDate) : null;
    const globalDays = globalTargetDate ? calculateDaysLeft(globalTargetDate) : null;

    if (subjectDays !== null && globalDays !== null) {
        // Both set: Use the tighter deadline (earlier date)
        // If Global is Dec 31 and Sub is Jan 15 -> Use Dec 31 (Global overrides)
        // If Global is Dec 31 and Sub is Dec 1 -> Use Dec 1 (Exam Reality)
        effectiveDays = Math.min(subjectDays, globalDays);
    } else if (subjectDays !== null) {
        effectiveDays = subjectDays;
    } else if (globalDays !== null) {
        effectiveDays = globalDays;
    }

    // If no deadline set at all, velocity is 0 (Comfortable / No Rush)
    if (effectiveDays === null) return 0;

    // Safety: If days are 0 or negative (overdue), treat as 1 day (Panic mode!) to avoid Infinity
    // But if it's truly today, maybe we want a high number. Let's clamp to 0.5 (need to do 2x topics/day)
    effectiveDays = Math.max(0.5, effectiveDays);

    const remaining = subject.topics.filter(t => !t.completed).length;
    if (remaining === 0) return 0;

    return remaining / effectiveDays;
};

export const getUrgencyLevel = (velocity) => {
    if (velocity > 3) return { label: "CRITICAL", color: "danger" };
    if (velocity > 1.5) return { label: "HIGH", color: "warning" };
    if (velocity <= 0) return { label: "DONE", color: "success" };
    return { label: "COMFORTABLE", color: "success" };
};
