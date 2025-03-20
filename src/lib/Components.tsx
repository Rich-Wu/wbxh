import { useContext, useState } from "react";
import Api from "./api";
import classes from "classnames";
import { DraggedTokenContext, SpeechContext, useVoice } from "./Contexts";
import { speak } from "./Utils";
import { Token } from "./Types";
import { useStorageContext } from "./Hooks";
import classNames from "classnames";

const Line = ({
    line,
    api,
    speechRate,
}: {
    line: string;
    api: null | Api;
    speechRate: number;
}) => {
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
                        speechRate={speechRate}
                    />
                ) : (
                    <Translated
                        translation={translation}
                        speechRate={speechRate}
                    />
                )}
            </div>
        </>
    );
};

const RawEntry = ({
    text,
    getTranslation,
    loading,
    speechRate,
}: {
    text: string;
    getTranslation: (text: string) => Promise<void>;
    loading: boolean;
    speechRate: number;
}) => {
    return (
        <div className="bubble">
            <Speaker text={text} speechRate={speechRate} />
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
    const voice = useVoice();
    const speak = (token: string) => {
        const utterance = new SpeechSynthesisUtterance(token);
        utterance.voice = voice;
        utterance.lang = "zh-CN";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
    };
const Speaker = ({
    text,
    speechRate,
}: {
    text: string;
    speechRate: number;
}) => {
    const voiceContext = useContext(SpeechContext);

    return (
        <div
            className="speaker"
            onClick={() => speak(text, voiceContext, speechRate)}
        >
            🔉
        </div>
    );
};

const Spinner = () => {
    return <div className="spinner"></div>;
};

const Translated = ({
    translation,
    speechRate,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translation: any;
    speechRate: number;
}) => {
    const {
        original,
        translation: translationText,
        line: tokens,
        context,
    } = translation;

    const out = [];

    let prev = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokensMap = tokens.map((token: any) => {
        const occurrence = original.indexOf(token.token, prev);
        prev = occurrence + token.token.length;
        return {
            ...token,
            idx: occurrence,
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
                speechRate={speechRate}
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
            <Speaker text={original} speechRate={speechRate} />
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
    speechRate,
}: {
    text: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translation: any;
    speechRate: number;
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
            onDoubleClick={() => speak(translation.token)}
            onDragStart={handleDrag}
            onDragEnd={() => setDraggedToken(null)}
            draggable
        >
            <div>{translation.token}</div>
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

export const AddTokenDropZone = () => {
    const { savedTokens, setSavedTokens } = useStorageContext();
    const { draggedToken } = useContext(DraggedTokenContext);

    const handleDrop = () => {
        setSavedTokens([...savedTokens, { ...draggedToken }]);
    };

    return (
        <DroppableAddButton
            onDrop={handleDrop}
            classes={classNames("dropZone", "add")}
        />
    );
};

export const RemoveTokenDropZone = () => {
    const { savedTokens, setSavedTokens } = useStorageContext();
    const { draggedToken } = useContext(DraggedTokenContext);

    const handleDrop = () => {
        setSavedTokens(
            savedTokens.filter((token) => token.token != draggedToken.token)
        );
    };

    return (
        <DroppableRemoveButton
            onDrop={handleDrop}
            classes={classNames("dropZone", "remove")}
        />
    );
};

const withDroppable = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    return (
        props: P & {
            classes?: string;
            onDrop?: (event: React.DragEvent) => void;
        }
    ) => {
        const handleDragOver = (event: React.DragEvent) => {
            event.preventDefault();
        };
        const handleDrop = (event: React.DragEvent) => {
            event.preventDefault();
            if (props.onDrop) {
                props.onDrop(event);
            }
        };
        return (
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={props.classes}
            >
                <WrappedComponent {...props} />
            </div>
        );
    };
};

const RemoveButton = () => {
    return <div className="center">-</div>;
};

const AddButton = () => {
    return <div className={classes("center")}>✚</div>;
};

const DroppableRemoveButton = withDroppable(RemoveButton);
const DroppableAddButton = withDroppable(AddButton);

const SavedTokensList = (props) => {
    const { savedTokens, setSavedTokens } = useStorageContext();

    return (
        <div>
            {savedTokens.map((token: Token) => (
                <TranslatedText key={token.token} translation={token} />
            ))}
        </div>
    );
};

export { Line, Spinner, SavedTokensList };
