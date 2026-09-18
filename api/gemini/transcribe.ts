import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { audioBase64, mimeType = 'audio/webm', prompt = 'Transcribe this audio verbatim with accurate punctuation.' } = req.body || {};
    if (!audioBase64) return res.status(400).json({ error: 'audioBase64 is required' });
    const cleanBase64 = String(audioBase64).replace(/^data:audio\/[a-zA-Z0-9+.-]+;base64,/, '');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const approxKb = Math.round((cleanBase64.length * 0.75) / 1024);
      return res.status(200).json({ success: true, transcript: `[Preview] Audio received successfully (${approxKb} KB). Add GEMINI_API_KEY on Vercel for live AI transcription.`, model: 'preview-fallback', fallback: true });
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ inlineData: { mimeType, data: cleanBase64 } }, { text: prompt }] } });
    return res.status(200).json({ success: true, transcript: (response.text || '').trim(), model: 'gemini-2.5-flash', mimeType });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Audio transcription failed' });
  }
}