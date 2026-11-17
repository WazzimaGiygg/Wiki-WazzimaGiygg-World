import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const WIKI_SITE_VERSION = 'W1.16.6J.1';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use((_req, res, next) => {
    res.setHeader('X-Wiki-Version', WIKI_SITE_VERSION);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-Privacy-Compliance', 'LGPD-13709-2018; MarcoCivil-12965-2014');
    next();
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      domain: 'core.wazzimagiygg.com',
      version: WIKI_SITE_VERSION,
      compliance: ['LGPD (Lei 13.709/2018)', 'Marco Civil da Internet (Lei 12.965/2014)'],
    });
  });

  app.post('/api/search-grounding', async (req: Request, res: Response) => {
    try {
      const { query, mode = 'research', articleTitle } = req.body as {
        query?: string;
        mode?: 'research' | 'seo-check';
        articleTitle?: string;
      };

      const trimmedQuery = (query || '').trim();
      if (!trimmedQuery) {
        res.status(400).json({ error: 'Informe um termo ou pergunta para pesquisar.' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'A chave GEMINI_API_KEY não está configurada no ambiente do servidor.',
        });
        return;
      }

      const prompt =
        mode === 'seo-check'
          ? `Use o Google Search para verificar resultados atuais e referências na web sobre "${trimmedQuery}" e o domínio oficial core.wazzimagiygg.com (WikiWazzimaGiygg). Resuma em português o que aparece indexado/encontrado na busca, cite o domínio core.wazzimagiygg.com quando presente e indique melhorias práticas de posicionamento acima de resultados genéricos.`
          : `Você é um pesquisador enciclopédico para o WikiWazzimaGiygg (core.wazzimagiygg.com). Pesquise no Google Search informações atuais, verificáveis e precisas em português sobre "${trimmedQuery}"${articleTitle ? ` no contexto do artigo "${articleTitle}"` : ''}. Apresente um resumo claro e objetivo em tópicos curtos baseado nos fatos encontrados.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const rawChunks = groundingMetadata?.groundingChunks || [];
      const sources = rawChunks
        .map(chunk => chunk.web)
        .filter((web): web is { uri: string; title?: string } => Boolean(web?.uri))
        .map(web => ({
          uri: web.uri,
          title: web.title || web.uri,
        }));

      const searchQueries = groundingMetadata?.webSearchQueries || [];

      res.json({
        answer: response.text || '',
        sources,
        searchQueries,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido ao consultar Google Search.';
      console.error('Search Grounding error:', message);
      res.status(500).json({ error: message });
    }
  });

  if (isProduction) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WikiWazzimaGiygg server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
