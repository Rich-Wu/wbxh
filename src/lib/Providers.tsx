import { ReactNode, useEffect, useRef, useState } from "react";
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
    const ocrWorker = useRef<Worker | null>(null);

    useEffect(() => {
        ocrWorker.current = new Worker(
            new URL("../workers/ocrWorker.js", import.meta.url),
            { type: "module" }
        );
        const workerRef = ocrWorker.current;

        ocrWorker.current.onmessage = (e: MessageEvent) => {
            console.log(e.data);
        };

        return () => {
            workerRef.terminate();
            ocrWorker.current = null;
        };
    }, []);

    const sendImage = (image: ImageLike) => {
        if (!ocrWorker.current) return;
        ocrWorker.current.postMessage({ image });
    };

    return (
        <OcrWorkerContext.Provider value={sendImage}>
            {children}
        </OcrWorkerContext.Provider>
    );
};
