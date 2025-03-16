import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { Token } from "./Types";

export const SpeechContext = createContext<SpeechSynthesisVoice | null>(null);

export const useVoice = () => useContext(SpeechContext);

export const DraggedTokenContext = createContext<{
    draggedToken: Token | null;
    setDraggedToken: Dispatch<SetStateAction<Token | null>>;
} | null>(null);

export const SavedTokensContext = createContext<{
    savedTokens: Array<Token>;
    setSavedTokens: Dispatch<SetStateAction<Array<Token>>>;
} | null>(null);

export interface StorageContextType {
    savedTokens: Array<Token>;
    setSavedTokens: (value: Array<Token>) => void;
}

export const StorageContext = createContext<StorageContextType | null>(null);
