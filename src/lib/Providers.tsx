import { ReactNode, useEffect, useState } from "react";
import { OcrWorkerContext, SpeechContext } from "./Contexts";
import { ImageLike } from "tesseract.js";

export function VoiceProvider({ children }: { children: ReactNode }) {
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
}

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
