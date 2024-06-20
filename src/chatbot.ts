import OpenAI, { ClientOptions } from 'openai';
import * as dotenv from 'dotenv';
import { RateLimiterMemory } from "rate-limiter-flexible";

const opts = {
    points: 50, // 6 points
    duration: 1, // Per second
};

const rateLimiter = new RateLimiterMemory(opts);

// Load OpenAI API key from environment variable
dotenv.config();
const configuration: ClientOptions = {
    apiKey: process.env.OPENAI_API_KEY,
};
// Load OpenAI API key from environment variable
dotenv.config();
const openai = new OpenAI(configuration);

export async function chatBot(prompt: string): Promise<string> {
    try {

        return rateLimiter.consume("chatbot", 2) // consume 2 points
            .then(async (rateLimiterRes) => {
                // 2 points consumed
                //return "";
                const chatCompletion = await openai.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: 'gpt-3.5-turbo',
                });
                return (chatCompletion.choices[0]?.message?.content) || "";
            })
            .catch((rateLimiterRes) => {
                // Not enough points to consume
                // wait 200ms                
                console.log("Rate limiter error");
                return "Err"
            });
        
    } catch (err) {
        console.log(err);
        return "";
    }
}

