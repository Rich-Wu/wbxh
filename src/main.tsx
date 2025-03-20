import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
    OcrWorkerProvider,
    VoiceProvider,
    LocalStorageProvider,
} from "./lib/Providers.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <LocalStorageProvider>
            <VoiceProvider>
                <OcrWorkerProvider>
                    <App />
                </OcrWorkerProvider>
            </VoiceProvider>
        </LocalStorageProvider>
    </StrictMode>
);
