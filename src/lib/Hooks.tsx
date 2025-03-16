import { useContext, useEffect, useState } from "react";
import { SavedTokensContext, StorageContext } from "./Contexts";

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

export const useStorageContext = () => {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error(
            "useStorageContext must be used within a StorageProvider"
        );
    }
    return context;
};
