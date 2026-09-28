import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// Initialize Google GenAI on the server side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// POST /api/ai/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, model, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Fallback mock responses when API key is not configured
      return res.json({
        text: `[Editorial AI Analysis] In response to your draft request: "${prompt.slice(0, 60)}...", the editorial voice should emphasize typographic balance, clear thematic exposition, and precise domain references.`,
      });
    }

    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI content' });
  }
});

// POST /api/ai/editorial-assist
router.post('/editorial-assist', async (req: Request, res: Response) => {
  try {
    const { task, content, title } = req.body;
    const taskPrompts: Record<string, string> = {
      headline: `Generate 3 high-impact, prestigious editorial headlines for this article:\nTitle: ${title}\nContent: ${content?.slice(0, 800)}`,
      summary: `Write a compelling 2-sentence executive summary and lead excerpt for this publication piece:\nTitle: ${title}\nContent: ${content?.slice(0, 1000)}`,
      citations: `Extract key assertions from this text that warrant formal citation and provide recommended footnote formats:\n${content?.slice(0, 1200)}`,
      readability: `Critique the rhythm, prose velocity, and typographic cadence of this text:\n${content?.slice(0, 1000)}`,
    };

    const prompt = taskPrompts[task] || `Provide editorial improvements for: ${content?.slice(0, 800)}`;

    if (!ai) {
      return res.json({
        text: `• Suggested Enhancement: Strengthen paragraph transitions with active voice verbs.\n• Editorial Cadence: Measured and authoritative.`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an award-winning senior editor for a prestigious spatial and architectural publication. Provide concise, elegant, and actionable suggestions.',
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Editorial assist error:', error);
    res.status(500).json({ error: error.message || 'AI Assistant failed' });
  }
});

export default router;
