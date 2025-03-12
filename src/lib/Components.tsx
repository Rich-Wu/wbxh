import { useState } from 'react'
import Api from './api';
import classes from 'classnames';

const Line = ({ line, api }: {line: string, api: null | Api}) => {
  const [translated, setTranslated] = useState(false);
  const [translation, setTranslation] = useState({});
  const [loading, setLoading] = useState(false);

  const translate = async (line: string) => {
    setLoading(true);
    try {
      const response = await api?.translate(line);
      const choices = response?.choices;
      if (!choices) {
        throw new Error("Error")
      }
      const choice = choices[0];
      const {content} = choice.message;
      const data = JSON.parse(content || "");
      setTranslation(data);
      setTranslated(true);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        {!translated ? <RawEntry text={line} getTranslation={translate} loading={loading} /> : <Translated translation={translation} />}
      </div>
    </>
  )
}

const RawEntry = ({ text, getTranslation, loading }) => {
  return (
    <div className="bubble">
      <Speaker text={text} />
      <div className={classes("word")}>{text}</div>
      <div>
        <button onClick={() => {getTranslation(text)}}>{loading ? <Spinner /> : "Translate"}</button>
      </div>
    </div>
  )
}

const Speaker = ({text}: {text: string}) => {
  const speak = (token: string) => {
    const mandarinVoices = speechSynthesis.getVoices().filter(voice => voice.lang === "zh-CN");
    const utterance = new SpeechSynthesisUtterance(token);
    if (mandarinVoices) {
      const googleVoice = mandarinVoices.find(voice => voice.name.startsWith("Google"))
      if (googleVoice) {
        utterance.voice = googleVoice;
      } else {
        utterance.voice = mandarinVoices[0];
      }
    }
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="speaker" onClick={() => speak(text)}>🔉</div>
  )
}

const Spinner = () => {
  return <div className="spinner"></div>;
};

const Translated = ({ translation }) => {
  const {original, translation: translationText, line: tokens, context} = translation;

  const out = []

  let j = 0;
  for (const token of tokens) {
    const length = token.token.length;
    const occurrence = original.indexOf(token.token, j);
    if (j < occurrence) {
      out.push(<UntranslatedText key={out.length} text={original.slice(j, occurrence)} />)
    }
    out.push(<TranslatedText key={out.length} text={token.token} translation={token}/>)
    j = occurrence + length;
  }
  if (j < original.length) {
    out.push(<UntranslatedText key={out.length} text={original.slice(j, original.length)} />)
  }

  return (
    <div className="flex flex-column bubble">
      <Speaker text={original} />
      <div className={classes('flex', 'flex-row', 'flex-center')}>
        {out.map(el => el)}
      </div>
      <div>
        {translationText}
      </div>
      {context && (
        <div>{context}</div>
      )}
    </div>
  )
}

const UntranslatedText = ({ text }: { text: string }) => {
  return (
    <div className={classes("word")}>{text}</div>
  )
}

const TranslatedText = ({ text, translation }) => {
  const [showTranslation, setShowTranslation] = useState(false);

  const speak = (token: string) => {
    const mandarinVoices = speechSynthesis.getVoices().filter(voice => voice.lang === "zh-CN");
    const utterance = new SpeechSynthesisUtterance(token);
    if (mandarinVoices) {
      const googleVoice = mandarinVoices.find(voice => voice.name.startsWith("Google"))
      if (googleVoice) {
        utterance.voice = googleVoice;
      } else {
        utterance.voice = mandarinVoices[0];
      }
    }
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  }

  return (
    <div className={classes("more-details", "word", "tooltip")}
        onClick={() => setShowTranslation(true)}
        onMouseLeave={() => setShowTranslation(false)}
        onDoubleClick={() => speak(text)
    }>
      <div>
        {text}
      </div>
      <div className={classes("tooltiptext", {"show": showTranslation})}>
        <div>
          {translation.pinyin}
        </div>
        <div>
          {translation.translation}
        </div>
        {translation.context && (
        <div>
          {translation.context}
        </div>
        )}
      </div>
    </div>
  )
}

export { Line, Spinner }
