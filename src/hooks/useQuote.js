import { useState, useEffect, useCallback } from 'react';
import { FALLBACK_QUOTES } from '../data/quotes';

export function useQuote() {
    const [quote, setQuote] = useState(FALLBACK_QUOTES[0]);
    const [loading, setLoading] = useState(true);

    const fetchQuote = useCallback(async () => {
        // Simulate a tiny delay for better UX on "refresh" feel, but mostly instant
        setLoading(true);

        // Simple random pick from local array
        // Wrapped in timeout to make the UI transition smoother (optional, but looks nice with the loading spinner)
        setTimeout(() => {
            const random = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
            setQuote(random);
            setLoading(false);
        }, 400);

    }, []);

    useEffect(() => {
        fetchQuote();
    }, [fetchQuote]);

    return { quote, loading, refreshQuote: fetchQuote };
}
