import { useContext, useRef, useState } from "react";
import Api from "./api";
import classes from "classnames";
import {
    DraggedTokenContext,
    SavedTokensContext,
    SpeechContext,
} from "./Contexts";
import { Token } from "./Types";
import { SavedTokensProvider } from "./Providers";

const Line = ({ line, api }: { line: string; api: null | Api }) => {
    const [translated, setTranslated] = useState(false);
    const [translation, setTranslation] = useState({});
    const [loading, setLoading] = useState(false);

    const translate = async (line: string): Promise<void> => {
        setLoading(true);
        try {
            const response = await api?.translate(line);
            const choices = response?.choices;
            if (!choices) {
                throw new Error("Error");
            }
            const choice = choices[0];
            const { content } = choice.message;
            const data = JSON.parse(content || "");
            setTranslation(data);
            setTranslated(true);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div>
                {!translated ? (
                    <RawEntry
                        text={line}
                        getTranslation={translate}
                        loading={loading}
                    />
                ) : (
                    <Translated translation={translation} />
                )}
            </div>
        </>
    );
};

const RawEntry = ({
    text,
    getTranslation,
    loading,
}: {
    text: string;
    getTranslation: (text: string) => Promise<void>;
    loading: boolean;
}) => {
    return (
        <div className="bubble">
            <Speaker text={text} />
            <div className={classes("word")}>{text}</div>
            <div>
                <button
                    onClick={() => {
                        getTranslation(text);
                    }}
                >
                    {loading ? <Spinner /> : "Translate"}
                </button>
            </div>
        </div>
    );
};

const Speaker = ({ text }: { text: string }) => {
    const voice = useContext(SpeechContext);
    const speak = (token: string) => {
        const utterance = new SpeechSynthesisUtterance(token);
        utterance.voice = voice;
        utterance.lang = "zh-CN";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="speaker" onClick={() => speak(text)}>
            🔉
        </div>
    );
};

const Spinner = () => {
    return <div className="spinner"></div>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Translated = ({ translation }: { translation: any }) => {
    const {
        original,
        translation: translationText,
        line: tokens,
        context,
    } = translation;

    const out = [];

    type TokenIndexLength = Token & { length: number; idx: number };

    const tokensMap = tokens.map((token: Token) => {
        return {
            ...token,
            idx: original.indexOf(token.token),
            length: token.token.length,
        };
    });

    tokensMap.sort(
        (token1: TokenIndexLength, token2: TokenIndexLength) =>
            token1.idx < token2.idx
    );

    let j = 0;
    for (const token of tokensMap) {
        if (j < token.idx) {
            const untokenizedText = original.slice(j, token.idx);
            out.push(
                <UntranslatedText key={out.length} text={untokenizedText} />
            );
        }
        out.push(
            <TranslatedText
                key={out.length}
                text={token.token}
                translation={token}
            />
        );
        j = token.idx + token.length;
    }
    if (j < original.length) {
        out.push(
            <UntranslatedText
                key={out.length}
                text={original.slice(j, original.length)}
            />
        );
    }

    return (
        <div className="flex flex-column bubble">
            <Speaker text={original} />
            <div className={classes("flex", "flex-row", "flex-center")}>
                {out.map((el) => el)}
            </div>
            <div>{translationText}</div>
            {context && <div>{context}</div>}
        </div>
    );
};

const UntranslatedText = ({ text }: { text: string }) => {
    return <div className={classes("word")}>{text}</div>;
};

const TranslatedText = ({
    text,
    translation,
}: {
    text: string;
    translation: Token;
}) => {
    const [showTranslation, setShowTranslation] = useState(false);
    const { setDraggedToken } = useContext(DraggedTokenContext);

    const voice = useContext(SpeechContext);

    const speak = (token: string) => {
        const utterance = new SpeechSynthesisUtterance(token);
        utterance.voice = voice;
        utterance.lang = "zh-CN";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
    };

    const handleDrag = () => {
        setDraggedToken((prevToken: Token) => {
            if (prevToken === translation) {
                return prevToken;
            }
            return translation;
        });
    };

    return (
        <div
            className={classes("more-details", "word", "tooltip")}
            onClick={() => setShowTranslation(true)}
            onMouseLeave={() => setShowTranslation(false)}
            onDoubleClick={() => speak(text)}
            onDragStart={handleDrag}
            onDragEnd={() => setDraggedToken(null)}
            draggable
        >
            <div>{text}</div>
            <div
                className={classes("tooltiptext", {
                    show: showTranslation,
                })}
            >
                <div>{translation.pinyin}</div>
                <div>{translation.translation}</div>
                {translation.context && <div>{translation.context}</div>}
            </div>
        </div>
    );
};

const DropZone = () => {
    const { savedTokens, setSavedTokens } =
        useContext(SavedTokensContext) || {};
    const { draggedToken } = useContext(DraggedTokenContext);
    console.log(setSavedTokens);

    const handleDrop = () => {
        setSavedTokens([...savedTokens, { ...draggedToken }]);
    };

    return (
        <div
            className={classes("dropZone")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className={classes("center")}>✚</div>
        </div>
    );
};

export { Line, Spinner, DropZone };
