import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { OcrWorkerProvider, VoiceProvider } from "./lib/Providers.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <VoiceProvider>
            <OcrWorkerProvider>
                <App />
            </OcrWorkerProvider>
        </VoiceProvider>
    </StrictMode>
);
