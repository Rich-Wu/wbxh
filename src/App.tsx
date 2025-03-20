import { useContext, useEffect, useState } from "react";
import "./App.css";
import {
    AddTokenDropZone,
    Line,
    RemoveTokenDropZone,
    SavedTokensList,
    Spinner,
} from "./lib/Components";
import Api from "./lib/api";
import { processText } from "./lib/Utils";
import { OcrWorkerContext } from "./lib/Contexts";
import { DraggedTokenProvider, SavedTokensProvider } from "./lib/Providers";

function App() {
    const [, setKey] = useState(import.meta.env.VITE_API_KEY || "");
    const [api, setApi] = useState<null | Api>(
        import.meta.env.DEV ? new Api(import.meta.env.VITE_API_KEY) : null
    );
    const [lines, setLines] = useState<Array<string>>([]);
    const [file, setFile] = useState<File | null>(null);
    const [waiting, setWaiting] = useState(false);
    const [speechRate, setSpeechRate] = useState(1.0);
    const { worker, sendImage } = useContext(OcrWorkerContext) ?? {};

    useEffect(() => {
        if (!worker) return;

        worker.onmessage = handleReply;

        return () => {
            worker.onmessage = null;
        };
    }, [worker]);

    const handleReply = (message: MessageEvent<string>) => {
        const reply = processText(message.data);
        setLines(reply);
        setWaiting(false);
    };

    const handleAddKey = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const key = formData.get("api_key");
        if (key) {
            setKey(key.toString());
            setApi(new Api(key.toString()));
            e.currentTarget.reset();
        }
    };

    const handleAddLine = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const nextLine = formData.get("nextLine");
        if (nextLine) {
            setLines([nextLine.toString(), ...lines]);
            e.currentTarget.reset();
        }
    };

    const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target?.files?.length) return;
        const newFile = e.target.files[0];
        if (file != newFile) {
            setFile(() => newFile);
        }
    };

    const handleSubmitFile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;
        if (sendImage) sendImage(file);
        setWaiting(true);
        e.currentTarget.reset();
    };

    return (
        <>
            <DraggedTokenProvider>
                <SavedTokensProvider>
                    {!import.meta.env.DEV && (
                        <form onSubmit={handleAddKey}>
                            <input
                                type="text"
                                name="api_key"
                                id="api_key"
                                placeholder="Your ChatGPT api key"
                            />
                            <button type="submit">Set Key</button>
                        </form>
                    )}
                    <form>
                        <label htmlFor="speechRate">Rate: {speechRate}</label>
                        <input
                            type="range"
                            name="speechRate"
                            id="speechRate"
                            onChange={(e) =>
                                setSpeechRate(Number(e.target.value))
                            }
                            min="0.5"
                            max="2"
                            value={speechRate}
                            step="0.1"
                        />
                    </form>
                    <form onSubmit={handleAddLine}>
                        <input
                            type="text"
                            name="nextLine"
                            id="nextLine"
                            placeholder="Input Chinese text"
                        />
                        <button type="submit">Add Line</button>
                    </form>
                    <form onSubmit={handleSubmitFile}>
                        <input
                            type="file"
                            name="ocrImage"
                            id="ocrImage"
                            accept="image/*"
                            onChange={handleAddFile}
                        />
                        <button type="submit">
                            {waiting ? <Spinner /> : "Add File"}
                        </button>
                    </form>
                    {lines.map((line) => (
                        <Line
                            api={api}
                            line={line}
                            key={line}
                            speechRate={speechRate}
                        />
                    ))}
                    <SavedTokensList speechRate={speechRate} />
                    <RemoveTokenDropZone />
                    <AddTokenDropZone />
                </SavedTokensProvider>
            </DraggedTokenProvider>
        </>
    );
}

export default App;
