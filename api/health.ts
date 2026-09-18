import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ status: 'ok', service: 'MegaSort API', geminiConfigured: Boolean(process.env.GEMINI_API_KEY), timestamp: new Date().toISOString() });
}