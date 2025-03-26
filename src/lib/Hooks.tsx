import { useContext, useEffect, useState } from "react";
import { SavedTokensContext, SpeechRateContext } from "./Contexts";

export const useStorage = <T,>(key: string, initialValue: T) => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error saving to localStorage`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
};

export const useSavedTokensContext = () => {
    const context = useContext(SavedTokensContext);
    if (!context) {
        throw new Error(
            "useStorageContext must be used within a StorageProvider"
        );
    }
    const savedTokens = context.savedValue;
    const seenTokens = new Set();
    for (const token of savedTokens) {
        seenTokens.add(token.token);
    }
    return { seenTokens, ...context };
};

export const useSpeechRate = () => {
    const context = useContext(SpeechRateContext);
    if (!context) {
        throw new Error(
            "useStorageContext must be used within a StorageProvider"
        );
    }
    return context;
};
