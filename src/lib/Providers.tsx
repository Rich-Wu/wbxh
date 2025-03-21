import {
    OcrWorkerContext,
    SpeechContext,
    DraggedTokenContext,
    SavedTokensContext,
    SpeechRateContext,
} from "./Contexts";
import { ImageLike } from "tesseract.js";

import { FC, ReactNode, useEffect, useState } from "react";
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

        loadVoices();
        speechSynthesis.addEventListener("voiceschanged", loadVoices);
        return () =>
            window.speechSynthesis.removeEventListener(
                "voiceschanged",
                loadVoices
            );
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

export const SavedTokensProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [savedTokens, setSavedTokens] = useStorage<Array<Token>>(
        "savedTokens",
        []
    );
    return (
        <SavedTokensContext.Provider
            value={{ savedValue: savedTokens, setSavedValue: setSavedTokens }}
        >
            {children}
        </SavedTokensContext.Provider>
    );
};

export const SpeechRateProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [speechRate, setSpeechRate] = useStorage<number>("speechRate", 1);
    return (
        <SpeechRateContext.Provider
            value={{
                savedValue: speechRate,
                setSavedValue: setSpeechRate,
            }}
        >
            {children}
        </SpeechRateContext.Provider>
    );
};

export const OcrWorkerProvider = ({ children }: { children: ReactNode }) => {
    const [ocrWorker, setOcrWorker] = useState<Worker | null>(null);

    useEffect(() => {
        const worker = new Worker(
            new URL("../workers/ocrWorker.js", import.meta.url),
            { type: "module" }
        );
        setOcrWorker(worker);

        return () => {
            worker.terminate();
        };
    }, []);

    const sendImage = (image: ImageLike) => {
        if (!ocrWorker) return;
        ocrWorker.postMessage({ image });
    };

    return (
        <OcrWorkerContext.Provider value={{ worker: ocrWorker, sendImage }}>
            {children}
        </OcrWorkerContext.Provider>
    );
};
