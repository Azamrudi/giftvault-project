import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { recipientName, relationship, vibe, extraDetails } = body || {};

  if (!recipientName) {
    res.status(400).json({ error: 'Missing required field: recipientName' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the deployment environment.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Write a personalized birthday wish or greeting for ${recipientName}.\n` +
      `- Relationship: ${relationship || 'friend'}\n` +
      `- Style/vibe: ${vibe || 'warm and sentimental'}\n` +
      `- Additional details: ${extraDetails || 'none'}\n\n` +
      `Please write a highly engaging letter or poem that is emotional, thoughtful, and expressive. Make it feel authentic, creative, and memorable. Keep it polished. Output in rich, formatted markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal AI engine failure';
    res.status(500).json({ error: message });
  }
}
