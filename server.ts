import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Chat API endpoint
  app.post('/api/chat', async (req: express.Request, res: express.Response) => {
    try {
      const { message, history, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Format curriculum context for system instructions
      const curriculumContextText = `
You are the AI MBA Curriculum Specialist for UCW (University Canada West) MBA program.
You are assisting professors, curriculum developers, and administrators in mapping Course Learning Outcomes (CLOs) to Program Learning Outcomes (PLOs).

Current MBA Curriculum Context:
- Program Learning Outcomes (PLOs):
${JSON.stringify(context?.plos || [], null, 2)}

- Courses and Course Learning Outcomes (CLOs):
${JSON.stringify(context?.courses || [], null, 2)}

- Current CLO-to-PLO Mappings (mapped as courseId_cloId -> Array of PLO IDs):
${JSON.stringify(context?.mappings || {}, null, 2)}

Provide expert curriculum analysis, direct suggestions on how to refine CLO-to-PLO mappings, Bloom's level alignment tips, identify curriculum gaps (undercovered PLOs), and answer any technical questions about the program.
Keep your answers professional, helpful, and constructive. If suggesting mappings, reference course codes and CLO IDs explicitly (e.g. BUSI 601, CLO1 -> PLO2). Provide succinct, well-structured feedback with markdown lists or bold key points for high readability.
`;

      const formattedContents = [];
      
      // Add history if present
      if (history && history.length > 0) {
        for (const msg of history) {
          formattedContents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }

      // Add the final user message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      let response;
      
      const callGeminiWithRetryAndFallback = async (
        client: GoogleGenAI,
        contents: any[],
        systemInstruction: string
      ): Promise<any> => {
        // Preferred stable and super fast models first
        const models = [
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-3.5-flash',
          'gemini-2.5-pro',
          'gemini-1.5-pro'
        ];

        let lastError: any = null;

        for (const model of models) {
          try {
            console.log(`Attempting generateContent using model ${model}...`);
            const res = await client.models.generateContent({
              model: model,
              contents: contents,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
              }
            });
            if (res) {
              console.log(`Success with model ${model}`);
              return res;
            }
          } catch (err: any) {
            lastError = err;
            const errorMessage = err.message || JSON.stringify(err);
            console.warn(`Model ${model} failed: ${errorMessage}`);
            // Instant fallback to next model in the list (no sleep delay)
          }
        }

        throw lastError || new Error('All available models failed to return a response.');
      };

      try {
        response = await callGeminiWithRetryAndFallback(ai, formattedContents, curriculumContextText);
      } catch (err: any) {
        throw new Error(`All available Gemini models are currently under heavy load or unavailable: ${err.message || err}`);
      }

      const text = response.text || "I apologize, but I could not formulate a response. Let's try again.";
      res.json({ text });
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({ error: error.message || 'Internal server error calling AI model' });
    }
  });

  // Serve static/vite assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
