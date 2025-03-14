import {
    createContext,
    Dispatch,
    SetStateAction,
    ReactNode,
    useContext,
    useState,
} from "react";
import { Token } from "./Types";

export const SpeechContext = createContext<SpeechSynthesisVoice | null>(null);

export const DraggedTokenContext = createContext<{
    draggedToken: Token | null;
    setDraggedToken: Dispatch<SetStateAction<Token | null>>;
} | null>(null);

export const SavedTokensContext = createContext<{
    savedTokens: Array<Token>;
    setSavedTokens: Dispatch<SetStateAction<Array<Token>>>;
} | null>(null);

export const useSavedTokens = () => useContext(SavedTokensContext);
