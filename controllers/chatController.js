import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client with explicit API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant for VK Services Enterprise, India's leading MLM software development company. You help customers understand our services and answer their queries professionally and concisely.

Our Services:
1. Customized MLM Software - Powerful backend dashboards tailored to your business with smart automation.
2. MLM Plan PDF Making - Professional compensation plan PDF design with premium presentation.
3. MLM Plan Video Making - HD animated presentation videos with voice-over and effects.
4. Result Based Promotion - Targeted audiences using automated marketing campaigns.
5. Latest MLM Database - Fresh verified databases with high quality genuine contacts.
6. MLM Leader Website - Modern responsive website for personal branding and business.

Contact Info:
- Phone: 8927656368
- WhatsApp: 9237377196
- Website: vkservicesenterprise.in

Rules:
- Be friendly, professional, and concise (2-4 sentences max unless asked for details).
- Always encourage users to contact us for personalized help.
- If asked about pricing, say pricing depends on requirements and encourage them to call/WhatsApp.
- Do NOT make up information not listed above.
- Respond in the same language the user writes in (Hindi or English).`;

export const generateChatResponse = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build conversation contents with history if provided
    const contents = [];

    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({ role: turn.role, parts: [{ text: turn.text }] });
      }
    }

    // Add current user message
    contents.push({ role: 'user', parts: [{ text: message }] });

const response = await ai.models.generateContent({
model: "gemini-2.5-pro",
  contents: "Hello",
});

console.log(response);

res.json({
  reply: response.text,
});

    res.json({ reply: response.text });
  } catch (error) {
console.dir(error, { depth: null });

if (error.response) {
  console.log(await error.response.text());
}    res.status(500).json({ error: "Failed to generate chat response. Please try again." });
  }
};
