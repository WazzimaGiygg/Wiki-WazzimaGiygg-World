import React, { useState } from 'react';
import {
  Globe,
  Search,
  CheckCircle2,
  ExternalLink,
  Loader2,
  FileCode,
  AlertCircle,
} from 'lucide-react';
import { SITE_SEO_METADATA } from '../../utils/seo';
import { queryGoogleSearchGrounding, SearchGroundingResult } from '../../services/groundingService';

export const SeoSearchPanel: React.FC = () => {
  const [query, setQuery] = useState('site:wikiwazzimagiygg.wazzimagiygg.com OR WikiWazzimaGiygg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchGroundingResult | null>(null);

  const handleCheckSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await queryGoogleSearchGrounding({
        query: query.trim(),
        mode: 'seo-check',
      });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar Google Search.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-xs">
      {/* SEO Configuration Summary for wikiwazzimagiygg.wazzimagiygg.com */}
      <div className="p-4 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
          <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-600" />
            <span>Configuração de SEO & Prioridade de Domínio Oficial</span>
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>{SITE_SEO_METADATA.domain}</span>
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Todas as páginas deste wiki emitem metadados canônicos, OpenGraph, Twitter Cards e dados estruturados
          Schema.org (<code>Organization</code>, <code>WebSite</code>, <code>Article</code> e{' '}
          <code>BreadcrumbList</code>) apontando exclusivamente para{' '}
          <strong className="text-gray-900 dark:text-gray-100">{SITE_SEO_METADATA.canonicalBase}</strong>,
          consolidando a autoridade oficial do domínio nos motores de busca.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded space-y-1.5">
            <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-purple-600" />
              <span>Arquivos e Sinais de Indexação</span>
            </div>
            <ul className="space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
              <li>
                • <strong>URL Canônica Base:</strong>{' '}
                <code className="text-purple-700 dark:text-purple-300">{SITE_SEO_METADATA.canonicalBase}/</code>
              </li>
              <li>
                • <strong>Robots.txt:</strong>{' '}
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline">
                  /robots.txt
                </a>
              </li>
              <li>
                • <strong>Sitemap XML:</strong>{' '}
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline">
                  /sitemap.xml
                </a>
              </li>
              <li>
                • <strong>Google Search Console:</strong>{' '}
                <code>{SITE_SEO_METADATA.verificationFile}</code>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded space-y-1.5">
            <div className="font-semibold text-gray-800 dark:text-gray-200">
              Dados Estruturados Ativos (JSON-LD)
            </div>
            <ul className="space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
              <li>• <strong>Organization &amp; WebSite:</strong> identidade oficial + <code>SearchAction</code></li>
              <li>• <strong>WebApplication:</strong> categorização semântica de referência enciclopédica</li>
              <li>• <strong>Article / BreadcrumbList:</strong> atualização dinâmica por artigo em tempo real</li>
              <li>• <strong>Robots Meta:</strong> <code>index, follow, max-snippet:-1, max-image-preview:large</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Live Google Search Grounding Check */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded shadow-2xs space-y-3">
        <div>
          <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#3366cc]" />
            <span>Auditoria de Presença no Google Search (Tempo Real)</span>
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Consulte resultados reais da web via Google Search para verificar referências ao domínio{' '}
            <code>wikiwazzimagiygg.wazzimagiygg.com</code> e termos da wiki.
          </p>
        </div>

        <form onSubmit={handleCheckSearch} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ex: site:wikiwazzimagiygg.wazzimagiygg.com ou WikiWazzimaGiygg"
            className="flex-1 min-w-[240px] px-3 py-1.5 text-xs bg-[#f8f9fa] dark:bg-gray-800 border border-[#a2a9b1] dark:border-gray-700 rounded focus:outline-hidden focus:border-[#3366cc]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 bg-[#3366cc] hover:bg-[#254b99] disabled:opacity-50 text-white rounded font-medium flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{loading ? 'Consultando...' : 'Consultar Google Search'}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div className="p-3 bg-[#f8f9fa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {result.answer}
            </div>

            {result.sources.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-semibold text-[11px] text-gray-600 dark:text-gray-400">
                  Fontes e URLs encontradas no Google Search ({result.sources.length}):
                </div>
                <ul className="space-y-1">
                  {result.sources.map((src, idx) => (
                    <li key={`${src.uri}-${idx}`}>
                      <a
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#0645ad] dark:text-[#6ba4ff] hover:underline break-all"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span>{src.title}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({src.uri})</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
