import {
    ClassAttributes,
    DragEventHandler,
    HTMLAttributes,
    MouseEventHandler,
    ReactNode,
    useContext,
    useState,
} from "react";
import Api from "./api";
import classes from "classnames";
import { DraggedTokenContext, SpeechContext } from "./Contexts";
import { Token } from "./Types";
import { useSavedTokensContext } from "./Hooks";
import classNames from "classnames";
import { speak } from "./Utils";
import { JSX } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

export const Line = ({
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

const Speaker = ({
    text,
    speechRate,
}: {
    text: string;
    speechRate: number;
}) => {
    const voice = useContext(SpeechContext);

    return (
        <div className="speaker" onClick={() => speak(text, voice, speechRate)}>
            🔉
        </div>
    );
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

    let j = 0;
    for (const token of tokensMap) {
        if (j < token.idx) {
            const untokenizedText = original.slice(j, token.idx);
            out.push(
                <UntranslatedText key={out.length} text={untokenizedText} />
            );
        }
        out.push(
            <DraggableTranslatedText
                key={out.length}
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
            <div className={classes("flex", "flex-row", "flex-center", "wrap")}>
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
    translation,
    speechRate,
    ...rest
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translation: any;
    speechRate: number;
} & React.HTMLAttributes<HTMLDivElement>) => {
    const [showTranslation, setShowTranslation] = useState(false);

    const voice = useContext(SpeechContext);

    return (
        <div
            className={classes("more-details", "word", "tooltip")}
            onClick={() => setShowTranslation(true)}
            onMouseLeave={() => setShowTranslation(false)}
            onDoubleClick={() => speak(translation.token, voice, speechRate)}
            {...rest}
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
    const {
        seenTokens,
        savedValue: savedTokens,
        setSavedValue: setSavedTokens,
    } = useSavedTokensContext();
    const draggedToken = useContext(DraggedTokenContext)?.draggedToken;
    const [hovered, setHovered] = useState(false);

    const handleDrop = () => {
        if (draggedToken?.token && !seenTokens.has(draggedToken.token))
            setSavedTokens([...savedTokens, { ...draggedToken }]);
        setHovered(false);
    };

    return (
        <DroppableAddButton
            onDragOver={() => setHovered(true)}
            onDragLeave={() => setHovered(false)}
            onDrop={handleDrop}
            classes={classNames("dropZone", "add", {
                hovered: hovered && draggedToken,
            })}
        />
    );
};

export const RemoveTokenDropZone = () => {
    const { savedValue: savedTokens, setSavedValue: setSavedTokens } =
        useSavedTokensContext();
    const draggedToken = useContext(DraggedTokenContext)?.draggedToken;
    const [hovered, setHovered] = useState(false);

    const handleDrop = () => {
        setHovered(false);
        setSavedTokens(
            savedTokens.filter(
                (token) =>
                    draggedToken?.token && token.token != draggedToken.token
            )
        );
    };

    return (
        <DroppableRemoveButton
            onDragOver={() => setHovered(true)}
            onDragLeave={() => setHovered(false)}
            onDrop={handleDrop}
            classes={classNames("dropZone", "remove", {
                hovered: draggedToken && hovered,
            })}
        />
    );
};

const withDroppable = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    return (
        props: P & {
            classes?: string;
            onDrop?: DragEventHandler;
            onDragOver?: MouseEventHandler;
            onDragLeave?: MouseEventHandler;
        }
    ) => {
        const handleDragOver = (event: React.DragEvent) => {
            event.preventDefault();
            if (props.onDragOver) {
                props.onDragOver(event);
            }
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
                onDragLeave={props.onDragLeave}
                onDrop={handleDrop}
                className={props.classes}
            >
                <WrappedComponent {...props} />
            </div>
        );
    };
};

const RemoveButton = () => {
    return <Trash2 />;
};

const AddButton = () => {
    return <Plus size={"4rem"} strokeWidth={1} />;
};

const DroppableRemoveButton = withDroppable(RemoveButton);
const DroppableAddButton = withDroppable(AddButton);

export const SavedTokensList = ({ speechRate }: { speechRate: number }) => {
    const { savedValue: savedTokens } = useSavedTokensContext();

    return (
        <div className={classNames("token-list")}>
            {savedTokens.map((token: Token) => (
                <DraggableTranslatedText
                    key={token.token}
                    translation={token}
                    speechRate={speechRate}
                    style={{ margin: "5px 10px" }}
                />
            ))}
        </div>
    );
};

export const Spinner = () => {
    return <div className="spinner"></div>;
};

export const SavedTokensPane = ({ speechRate }: { speechRate: number }) => {
    const [hovered, setHovered] = useState(false);
    const [shown, setShown] = useState(false);

    const handleHoverOver = () => {
        setHovered(true);
    };
    const handleHoverOut = () => {
        setHovered(false);
    };
    const handleShow = () => {
        setShown(!shown);
    };

    return (
        <div
            className={classNames(
                "tokens",
                { hovered: hovered },
                { shown: shown }
            )}
            onMouseEnter={handleHoverOver}
            onMouseLeave={handleHoverOut}
        >
            <FlexContainer>
                <ShowTokensArrow onClick={handleShow} shown={shown} />
                <SavedTokensList speechRate={speechRate} />
            </FlexContainer>
            <FlexContainer
                style={{
                    position: "fixed",
                    flexDirection: "column-reverse",
                    bottom: "1%",
                    right: "1%",
                }}
            >
                <AddTokenDropZone />
                <RemoveTokenDropZone />
            </FlexContainer>
        </div>
    );
};

export const FlexContainer = ({
    children,
    ...rest
}: { children: ReactNode } & JSX.IntrinsicAttributes &
    ClassAttributes<HTMLDivElement> &
    HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={classNames("flex")} {...rest}>
            {children}
        </div>
    );
};

const withDraggable = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: P & { translation: any; speechRate: number; style?: object }
    ) => {
        const { setDraggedToken } = useContext(DraggedTokenContext) || {};
        const draggedToken = useContext(DraggedTokenContext)?.draggedToken;
        const { translation } = props || {};

        const handleDrag = () => {
            if (!setDraggedToken) return;
            setDraggedToken((prevToken: Token | null) => {
                if (prevToken === translation) {
                    return prevToken;
                }
                return translation;
            });
        };
        return (
            <WrappedComponent
                {...props}
                style={{
                    ...props.style,
                    cursor: draggedToken ? "grabbing" : "grab",
                }}
                draggable
                onDragStart={handleDrag}
                onDragEnd={() => {
                    if (setDraggedToken) setDraggedToken(null);
                }}
            />
        );
    };
};

export const DraggableTranslatedText = withDraggable(TranslatedText);

const ShowTokensArrow = (
    props: JSX.IntrinsicAttributes &
        ClassAttributes<HTMLDivElement> &
        HTMLAttributes<HTMLDivElement> & { shown: boolean }
) => {
    const { shown, ...rest } = props;
    return (
        <div className={classNames("flex", "w-150")}>
            <div className={classNames("arrow", "center", "button")} {...rest}>
                {shown ? <ChevronRight /> : <ChevronLeft />}
            </div>
        </div>
    );
};
