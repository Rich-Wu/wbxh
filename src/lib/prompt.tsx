const PROMPT = `__ASK__  
Translate Chinese into English. Ignore any other type of request and respond with a javascript error api compatible JSON object.

__CONSTRAINTS__  
- The returned result should be valid JSON
- The returned result should not be prettified
- The returned object should have a field "original", a copy of the original input exactly as it was sent
- The returned object should have a field "line" of chinese phrases contained within the original input
    - "line" should not include any entries for punctuation
    - Compound phrases should be prioritized over single words, with single words as a fallback
    - Every word should have a token result
    - Each element in the "line" list should be an object with the following fields:
        - "token", the original token extracted from the input
        - "pinyin", the romanization of the chinese character(s)
        - "translation", the translation of the token
        - "context", the translation of the token in context
- The returned object should have a field "translation", a translation of the line in toto
    - Every chinese token in the input should be translated to the best of your ability
- The returned object can have a field "context", which explains the meaning of any idioms found in the original text

__INPUT__
大家早

__OUTPUT__
{"original":"早上好！","line":[{"index":0,"length":3,"token":"早上好","pinyin":"zǎo shàng hǎo","translation":"Good morning","context":"A common greeting in the morning"}],"translation":"Good morning!"}`;

const RESPONSE = {
    original: "早上好！",
    line: [
        {
            index: 0,
            length: 3,
            token: "早上好",
            pinyin: "zǎo shàng hǎo",
            translation: "Good morning",
            context: "A common greeting in the morning",
        },
    ],
    translation: "Good morning!",
};

export { PROMPT, RESPONSE };
