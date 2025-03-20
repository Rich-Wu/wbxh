import { useContext, useEffect, useState } from "react";
import "./App.css";
import { Line, Spinner } from "./lib/Components";
import Api from "./lib/api";
import { OcrWorkerContext } from "./lib/Contexts";

function App() {
    const [, setKey] = useState(import.meta.env.VITE_API_KEY || "");
    const [api, setApi] = useState<null | Api>(
        import.meta.env.DEV ? new Api(import.meta.env.VITE_API_KEY) : null
    );
    const [lines, setLines] = useState<Array<string>>([]);
    const [file, setFile] = useState<File | null>(null);
    const [waiting, setWaiting] = useState(false);
    const { worker, sendImage } = useContext(OcrWorkerContext) ?? {};

    useEffect(() => {
        if (!worker) return;

        worker.onmessage = handleReply;

        return () => {
            worker.onmessage = null;
        };
    }, [worker]);

    const handleReply = (message: MessageEvent<string>) => {
        console.log(message.data);
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
                <Line api={api} line={line} key={line} />
            ))}
        </>
    );
}

export default App;
