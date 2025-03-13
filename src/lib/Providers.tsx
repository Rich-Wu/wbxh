import { ReactNode, useEffect, useState } from "react";
import { SpeechContext } from "./Contexts";

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
