import React from 'react';
import { Monitor, Moon, Layout, Settings, ShieldCheck, BookOpen, Scale, Globe } from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import { WIKI_SITE_VERSION, WIKI_SITE_DOMAIN } from '../core/version';
import { LEGAL_COMPLIANCE_INFO } from '../core/compliance';
import { FooterBadges } from './FooterBadges';

interface FooterProps {
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSettings }) => {
  const { skin, setSkin, settings, navigateToPage, isBureaucrat } = useWiki();

  const dpoContact = settings.lgpdDpoContact || LEGAL_COMPLIANCE_INFO.defaultDpoContact;
  const repoUrl = settings.repositoryUrl || 'https://github.com/WazzimaGiygg/WikiWazzimaGiygg';
  const currentYear = new Date().getFullYear();

  const institutionalLinks: Array<{ label: string; slug: string }> = [
    { label: 'Política de Privacidade', slug: 'Wiki:Política_de_Privacidade' },
    { label: 'Termos de Uso', slug: 'Wiki:Termos_de_Uso' },
    { label: 'Portal LGPD & Marco Civil', slug: 'Especial:Privacidade' },
    { label: 'Investigação LGPD (Wikipédia)', slug: 'Investigação_LGPD_e_Marco_Civil_sobre_a_Wikipédia' },
    { label: 'Código de Conduta (UCoC)', slug: 'Wiki:Código_Universal_de_Conduta' },
    { label: 'Sobre a Wiki', slug: 'Página_principal' },
    { label: `Versão (${WIKI_SITE_VERSION})`, slug: 'Especial:Versão' },
    { label: 'Extensões', slug: 'Especial:Extensões' },
    { label: 'Mudanças recentes', slug: 'Especial:Mudanças_recentes' },
    { label: 'Ajuda de Wikitexto', slug: 'Ajuda:Wikitexto' },
    { label: 'Guia de Infobox', slug: 'Ajuda:Infobox' },
    { label: 'Predefinições', slug: 'Ajuda:Predefinições' },
    ...(isBureaucrat ? [{ label: 'Administração', slug: 'Especial:Administração' }] : []),
  ];

  return (
    <footer
      role="contentinfo"
      className="mt-12 bg-[#f8f9fa] dark:bg-[#0b0f17] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 py-6 transition-colors select-none font-sans print:hidden w-full max-w-full overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        {/* Institutional Navigation Links Row */}
        <nav
          aria-label="Links institucionais do rodapé"
          className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-[11px]"
        >
          {institutionalLinks.map((link) => (
            <button
              key={link.slug}
              type="button"
              onClick={() => navigateToPage(link.slug)}
              className="text-blue-700 dark:text-blue-400 hover:underline cursor-pointer transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Official Wikimedia-style Display Mode / Skin Selector Bar */}
        <div className="bg-slate-200/70 dark:bg-slate-900/80 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2 border border-slate-300/80 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Modo de Exibição:
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              (Escolha a aparência da enciclopédia)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSkin('vector-modern')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                skin === 'vector-modern'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Layout className="w-3 h-3" />
              <span>Vector 2022</span>
            </button>

            <button
              type="button"
              onClick={() => setSkin('vector-legacy')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                skin === 'vector-legacy'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Vector Clássico</span>
            </button>

            <button
              type="button"
              onClick={() => setSkin('dark-mode')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                skin === 'dark-mode'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Modo Escuro</span>
            </button>

            {isBureaucrat && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Abrir configurações globais da Wiki ($wg — Somente Burocratas)"
              >
                <Settings className="w-3 h-3" />
                <span>Configurações ($wg)</span>
              </button>
            )}
          </div>
        </div>

        {/* Official Wiki Motto Box (Frase Principal da Wiki) */}
        <div className="bg-blue-50/80 dark:bg-slate-900/90 border border-blue-200/80 dark:border-slate-800 rounded-lg px-4 py-3 text-center">
          <p className="text-xs sm:text-sm font-serif italic font-semibold text-blue-950 dark:text-blue-200 tracking-wide">
            «Όχι, ο Χρόνος δεν είναι ο άρχοντας της γνώσης!»
          </p>
          <p className="text-[10.5px] text-slate-600 dark:text-slate-400 mt-0.5">
            Frase Principal da Wiki • &ldquo;Não, o Tempo não é o senhor do conhecimento!&rdquo;
          </p>
        </div>

        {/* Counter-Campaign Dossier Callout: WikiWazzimaGiygg vs Wikipédia (LGPD & Marco Civil) */}
        <div className="bg-amber-50/90 dark:bg-amber-950/25 border border-amber-300/80 dark:border-amber-900/60 rounded-lg px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="text-center sm:text-left text-amber-950 dark:text-amber-200 leading-snug">
            <strong className="font-semibold">
              Por que o WikiWazzimaGiygg supera a Wikipédia em privacidade?
            </strong>{' '}
            Sem exposição histórica de IPs, com DPO no Brasil, guarda de 6 meses (Marco Civil Art. 15) e direitos reais da LGPD.
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigateToPage('Investigação_LGPD_e_Marco_Civil_sobre_a_Wikipédia')}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10.5px] transition-colors cursor-pointer"
            >
              Ler Dossiê Completo
            </button>
            <a
              href="https://wazzimagiygg.com/Investiga%C3%A7%C3%A3o%20LGPD%20e%20Marco%20Civ%C3%ADl%20WMF%20e%20Wikip%C3%A9dia.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded border border-amber-400 dark:border-amber-700 bg-white/80 dark:bg-slate-900 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-medium text-[10.5px] transition-colors no-underline"
            >
              PDF (41 págs.)
            </a>
          </div>
        </div>

        {/* Bottom Legal, Compliance & 88x31 Badges Row */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center lg:text-left leading-relaxed">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-white">
                {settings.sitename}
              </strong>{' '}
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {WIKI_SITE_VERSION}
              </span>{' '}
              •{' '}
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3 h-3 inline text-slate-400" />
                {WIKI_SITE_DOMAIN}
              </span>{' '}
              © {currentYear}
            </p>
            <p>
              Conteúdo disponibilizado sob licença{' '}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 dark:text-blue-400 hover:underline font-medium"
              >
                Creative Commons CC BY-SA 4.0
              </a>{' '}
              e motor sob{' '}
              <a
                href="https://www.gnu.org/licenses/old-licenses/gpl-2.0.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 dark:text-blue-400 hover:underline font-medium"
              >
                GNU GPL v2.0+
              </a>
              . Persistência em tempo real via{' '}
              <strong className="font-medium text-slate-700 dark:text-slate-300">
                Google Firebase (Cloud Firestore)
              </strong>
              .
            </p>
            <p className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-0.5 text-[10.5px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                LGPD (Lei nº 13.709/2018)
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Scale className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Marco Civil da Internet (Lei nº 12.965/2014)
              </span>
              <span>•</span>
              <span>
                Encarregado (DPO):{' '}
                <button
                  type="button"
                  onClick={() => navigateToPage('Especial:Privacidade')}
                  className="text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {dpoContact}
                </button>
              </span>
            </p>
          </div>

          <FooterBadges onNavigate={navigateToPage} repositoryUrl={repoUrl} />
        </div>
      </div>
    </footer>
  );
};
