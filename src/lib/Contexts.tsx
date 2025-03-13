import { createContext } from "react";

export const SpeechContext = createContext<SpeechSynthesisVoice | null>(null);
