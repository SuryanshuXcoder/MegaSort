export default function handler(_req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'MegaSort API',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
}
