import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
    OcrWorkerProvider,
    SavedTokensProvider,
    SpeechRateProvider,
    VoiceProvider,
} from "./lib/Providers.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SavedTokensProvider>
            <SpeechRateProvider>
                <VoiceProvider>
                    <OcrWorkerProvider>
                        <App />
                    </OcrWorkerProvider>
                </VoiceProvider>
            </SpeechRateProvider>
        </SavedTokensProvider>
    </StrictMode>
);
