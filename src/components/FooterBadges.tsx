import React from 'react';
import { WIKI_SITE_VERSION } from '../core/version';

interface FooterBadgesProps {
  onNavigate: (slug: string) => void;
  repositoryUrl?: string;
}

const BADGE_BASE_CLASS =
  'inline-flex items-center justify-between w-[88px] h-[31px] px-1.5 rounded-[3px] border text-left transition-transform hover:-translate-y-0.5 hover:shadow-sm select-none shrink-0 cursor-pointer overflow-hidden';

export const FooterBadges: React.FC<FooterBadgesProps> = ({
  onNavigate,
  repositoryUrl = 'https://github.com/WazzimaGiygg/WikiWazzimaGiygg',
}) => {
  return (
    <div
      className="flex flex-wrap items-center justify-center lg:justify-end gap-1.5"
      aria-label="Selos institucionais e técnicos da WikiWazzimaGiygg"
    >
      {/* 1. WikiWazzimaGiygg Official 88x31 Badge */}
      <button
        type="button"
        onClick={() => onNavigate('Página_principal')}
        title="WikiWazzimaGiygg — Enciclopédia Livre (core.wazzimagiygg.com)"
        className={`${BADGE_BASE_CLASS} bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100`}
      >
        <img
          src="/assets/aistudio/image_19fe7a14.png"
          alt="WikiWazzimaGiygg"
          className="w-5 h-5 object-contain shrink-0"
          loading="lazy"
        />
        <span className="flex flex-col leading-[1.05] text-right">
          <span className="text-[7px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Powered by
          </span>
          <span className="text-[8.5px] font-black tracking-tight text-blue-700 dark:text-blue-400">
            WazzimaWiki
          </span>
        </span>
      </button>

      {/* 2. Wiki-Site Version 88x31 Badge */}
      <button
        type="button"
        onClick={() => onNavigate('Especial:Versão')}
        title={`Wiki-Site versão ${WIKI_SITE_VERSION} — Ver Especial:Versão`}
        className={`${BADGE_BASE_CLASS} bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/90 dark:to-slate-900 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200`}
      >
        <svg className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </svg>
        <span className="flex flex-col leading-[1.05] text-right">
          <span className="text-[7px] uppercase tracking-wider text-blue-700/80 dark:text-blue-300/80 font-semibold">
            Wiki-Site
          </span>
          <span className="text-[8.5px] font-mono font-bold tracking-tight">
            {WIKI_SITE_VERSION}
          </span>
        </span>
      </button>

      {/* 3. LGPD & Marco Civil 88x31 Badge */}
      <button
        type="button"
        onClick={() => onNavigate('Especial:Privacidade')}
        title="Conformidade LGPD (Lei nº 13.709/2018) e Marco Civil da Internet (Lei nº 12.965/2014)"
        className={`${BADGE_BASE_CLASS} bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-emerald-950/80 dark:to-slate-900 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200`}
      >
        <svg className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.4-3 8.1-7 9-4-.9-7-4.6-7-9V6l7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.2 12.2l2 2 3.8-4.2" />
        </svg>
        <span className="flex flex-col leading-[1.05] text-right">
          <span className="text-[7px] uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300/80 font-semibold">
            Privacidade
          </span>
          <span className="text-[8.5px] font-extrabold tracking-tight">
            LGPD &amp; MCI
          </span>
        </span>
      </button>

      {/* 4. Firebase Firestore 88x31 Badge */}
      <a
        href="https://firebase.google.com/products/firestore"
        target="_blank"
        rel="noopener noreferrer"
        title="Armazenamento em tempo real com Google Firebase Cloud Firestore"
        className={`${BADGE_BASE_CLASS} bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-950/70 dark:to-slate-900 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 no-underline`}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <path d="M5.5 17.5L8.2 4.8c.1-.5.8-.6 1.1-.1l2.7 5.1 2.2-3.4c.3-.5 1-.4 1.2.1l3.1 11-6.5 3.6-6.5-3.6z" fill="#FFA000" />
          <path d="M12 21.1l6.5-3.6-3.1-11c-.2-.5-.9-.6-1.2-.1L5.5 17.5l6.5 3.6z" fill="#FFCA28" />
        </svg>
        <span className="flex flex-col leading-[1.05] text-right">
          <span className="text-[7px] uppercase tracking-wider text-amber-800/80 dark:text-amber-300/80 font-semibold">
            Database
          </span>
          <span className="text-[8.5px] font-extrabold tracking-tight">
            Firebase DB
          </span>
        </span>
      </a>

      {/* 5. GitHub Open Source 88x31 Badge */}
      <a
        href={repositoryUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Código-fonte aberto no GitHub (WazzimaGiygg/WikiWazzimaGiygg)"
        className={`${BADGE_BASE_CLASS} bg-gradient-to-b from-slate-800 to-slate-950 border-slate-700 text-white no-underline`}
      >
        <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
        </svg>
        <span className="flex flex-col leading-[1.05] text-right">
          <span className="text-[7px] uppercase tracking-wider text-slate-300 font-semibold">
            Open Source
          </span>
          <span className="text-[8.5px] font-extrabold tracking-tight text-white">
            GitHub
          </span>
        </span>
      </a>

      {/* 6. Creative Commons CC BY-SA 4.0 88x31 Badge */}
      <a
        href="https://creativecommons.org/licenses/by-sa/4.0/"
        target="_blank"
        rel="noopener noreferrer"
        title="Licença Creative Commons Atribuição-CompartilhaIgual 4.0 Internacional (CC BY-SA 4.0)"
        className={`${BADGE_BASE_CLASS} bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 no-underline`}
      >
        <span className="w-5 h-5 rounded-full border-[1.5px] border-current flex items-center justify-center text-[8px] font-black shrink-0">
          CC
        </span>
        <span className="flex flex-col leading-[1.05] text-right">
          <span className="text-[7px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Licença
          </span>
          <span className="text-[8.5px] font-extrabold tracking-tight">
            BY-SA 4.0
          </span>
        </span>
      </a>
    </div>
  );
};
