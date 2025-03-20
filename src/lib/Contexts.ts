import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { ImageLike } from "tesseract.js";
import { Token } from "./Types";

export const SpeechContext = createContext<SpeechSynthesisVoice | null>(null);

export const OcrWorkerContext = createContext<{
    worker: Worker | null;
    sendImage: (image: ImageLike) => void;
} | null>(null);

export const useVoice = () => useContext(SpeechContext);

export const DraggedTokenContext = createContext<{
    draggedToken: Token | null;
    setDraggedToken: Dispatch<SetStateAction<Token | null>>;
} | null>(null);

export interface StorageContextType<T> {
    savedValue: T;
    setSavedValue: Dispatch<SetStateAction<T>>;
}

export const createStorageContext = <T>() =>
    createContext<StorageContextType<T> | null>(null);

export const SavedTokensContext = createStorageContext<Array<Token>>();
