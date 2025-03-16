import { FC, ReactNode, useEffect, useState } from "react";
import {
    DraggedTokenContext,
    SavedTokensContext,
    SpeechContext,
    StorageContext,
} from "./Contexts";
import { Token } from "./Types";
import { useStorage } from "./Hooks";

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        const loadVoices = () => {
            const mandarinVoices = speechSynthesis
                .getVoices()
                .filter((voice) => voice.lang === "zh-CN");
            if (mandarinVoices) {
                const googleVoice = mandarinVoices.find((voice) =>
                    voice.name.startsWith("Google")
                );
                if (googleVoice) {
                    setVoice(googleVoice);
                    return;
                }
                setVoice(mandarinVoices[0]);
                return;
            }
            return;
        };

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
            return () =>
                window.speechSynthesis.removeEventListener(
                    "voiceschanged",
                    loadVoices
                );
        }

        loadVoices();
    }, []);

    return (
        <SpeechContext.Provider value={voice}>
            {children}
        </SpeechContext.Provider>
    );
};

export const DraggedTokenProvider = ({ children }: { children: ReactNode }) => {
    const [draggedToken, setDraggedToken] = useState<Token | null>(null);

    return (
        <DraggedTokenContext.Provider value={{ draggedToken, setDraggedToken }}>
            {children}
        </DraggedTokenContext.Provider>
    );
};

export const SavedTokensProvider = ({ children }: { children: ReactNode }) => {
    const [savedTokens, setSavedTokens] = useState<Array<Token>>([]);

    return (
        <SavedTokensContext.Provider value={{ savedTokens, setSavedTokens }}>
            {children}
        </SavedTokensContext.Provider>
    );
};

export const LocalStorageProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [savedTokens, setSavedTokens] = useStorage<Array<Token>>(
        "savedTokens",
        []
    );
    return (
        <StorageContext.Provider value={{ savedTokens, setSavedTokens }}>
            {children}
        </StorageContext.Provider>
    );
};
