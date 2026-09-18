import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { text, fileName } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Text content is required' });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const words = text.trim().split(/\s+/).length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      return res.status(200).json({
        summary: `Document analysis for ${fileName || 'document'}: Contains approximately ${words} words across ${sentences.length} sentences. Primary excerpt: "${sentences.slice(0, 3).map(s => s.trim()).join('. ')}${sentences.length > 3 ? '.' : ''}"`,
        keyPoints: sentences.slice(0, 4).map(s => s.trim()),
        wordCount: words,
        readingTimeMinutes: Math.max(1, Math.ceil(words / 200)),
        source: 'local-extractive'
      });
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text.slice(0, 15000)
    });
    return res.status(200).json({
      summary: response.text || 'Summary could not be generated.',
      source: 'gemini-2.5-flash',
      wordCount: text.trim().split(/\s+/).length
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Failed to generate document summary' });
  }
}
