import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
    OcrWorkerProvider,
    SavedTokensProvider,
    VoiceProvider,
} from "./lib/Providers.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SavedTokensProvider>
            <VoiceProvider>
                <OcrWorkerProvider>
                    <App />
                </OcrWorkerProvider>
            </VoiceProvider>
        </SavedTokensProvider>
    </StrictMode>
);
