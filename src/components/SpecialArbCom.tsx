import React from 'react';
import { ExternalLink, Flag, Scale } from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import { ArbComPanel } from './admin/ArbComPanel';

export const SpecialArbCom: React.FC = () => {
  const { currentUser, isBureaucrat, isAdmin, loginWithGoogle, navigateToPage } = useWiki();

  return (
    <div className="py-2 space-y-5 text-xs">
      {/* Header */}
      <div className="border-b border-[#a2a9b1] dark:border-gray-700 pb-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-serif text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#0645ad] dark:text-[#6ba4ff]" />
            <span>Conselho de Arbitragem (ArbCom)</span>
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToPage('Wiki:Conselho_de_Arbitragem')}
              className="px-2.5 py-1 text-[11px] bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-[#0645ad] dark:text-[#6ba4ff] font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Regimento do ArbCom</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('Especial:Denúncias')}
              className="px-2.5 py-1 text-[11px] bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-rose-700 dark:text-rose-300 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Flag className="w-3 h-3" />
              <span>Ir para Denúncias</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          Instância comunitária para mediação formal e julgamento vinculativo de disputas editoriais, abusos de
          privilégios e recursos finais entre colaboradores. Qualquer usuário autenticado pode protocolar uma petição e
          acompanhar o andamento dos processos.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[#0645ad] dark:text-[#6ba4ff]">Especial:Conselho_de_Arbitragem</span>
            <span>·</span>
            <span>
              {(isBureaucrat || isAdmin)
                ? 'Modo árbitro/administração ativo para publicar acórdãos'
                : 'Acesso comunitário para consulta e abertura de petições'}
            </span>
          </div>

          {currentUser.isAnonymous && (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-2.5 py-1 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-medium cursor-pointer"
            >
              Entrar com Google para peticionar
            </button>
          )}
        </div>
      </div>

      <ArbComPanel embeddedUserView />
    </div>
  );
};
