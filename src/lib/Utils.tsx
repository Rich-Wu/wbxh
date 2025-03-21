export const speak = (
    token: string,
    voice: SpeechSynthesisVoice | null,
    rate: number = 1.0
) => {
    const utterance = new SpeechSynthesisUtterance(token);
    utterance.voice = voice;
    utterance.lang = "zh-CN";
    utterance.rate = rate;
    utterance.pitch = 1.0;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
};

export const processText = (text: string): Array<string> => {
    const out: Array<string> = [];
    const curr: Array<string> = [];
    for (let i = 0; i < text.length; i++) {
        if (text[i] == " ") continue;
        else if (text[i] == "\n") {
            if (i < text.length - 1 && text[i + 1] == "\n") {
                out.push(curr.join(""));
                curr.length = 0;
            }
        } else {
            curr.push(text[i]);
        }
    }
    if (curr.length > 0) out.push(curr.join(""));
    return out;
};
