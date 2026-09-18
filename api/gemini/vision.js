import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(200).json({
      category: 'Other',
      confidence: 0.5,
      detectedItems: ['Visual content'],
      source: 'rule-fallback'
    });
    const cleanBase64 = String(imageBase64).replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanBase64 } },
          { text: 'Return JSON only with category, confidence, detectedItems, description. Category: People, Documents, Cars/Vehicles, Places/Locations, Screenshots, or Other.' }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });
    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json({
      category: parsed.category || 'Other',
      confidence: parsed.confidence || 0.75,
      detectedItems: parsed.detectedItems || [],
      description: parsed.description || '',
      source: 'gemini-2.5-flash'
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Vision classification failed' });
  }
}
