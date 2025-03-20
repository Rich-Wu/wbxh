import { createContext } from "react";
import { ImageLike } from "tesseract.js";

export const SpeechContext = createContext<SpeechSynthesisVoice | null>(null);

export const OcrWorkerContext = createContext<{
    worker: Worker | null;
    sendImage: (image: ImageLike) => void;
} | null>(null);
