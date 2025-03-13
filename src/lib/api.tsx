import OpenAI from "openai";
import { PROMPT } from "./prompt";

class Api {
    private _key: string;
    constructor(key: string) {
        this._key = key;
    }

    set key(key: string) {
        this.key = key;
    }

    translationParams(
        text: string
    ): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
        return {
            model: "gpt-4o-mini-2024-07-18",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: PROMPT },
                { role: "user", content: text },
            ],
        };
    }

    async translate(
        text: string
    ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
        const client = new OpenAI({
            apiKey: this._key,
            dangerouslyAllowBrowser: true,
            maxRetries: 0,
        });
        const params = this.translationParams(text);
        const completion = await client.chat.completions.create(params);
        console.log(completion);
        return completion;
    }
}

export default Api;
