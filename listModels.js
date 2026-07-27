import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  const pager = await ai.models.list();

  for await (const model of pager) {
    console.log(model.name);
  }
}

main().catch(console.error);