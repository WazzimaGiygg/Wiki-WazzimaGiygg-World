import React from 'react';
import { ExternalLink, Flag, Scale } from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import { UCoCPanel } from './admin/UCoCPanel';

export const SpecialReports: React.FC = () => {
  const { currentUser, isBureaucrat, isAdmin, loginWithGoogle, navigateToPage } = useWiki();

  return (
    <div className="py-2 space-y-5 text-xs">
      {/* Header */}
      <div className="border-b border-[#a2a9b1] dark:border-gray-700 pb-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-serif text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Flag className="w-6 h-6 text-rose-700 dark:text-rose-400" />
            <span>Central de Denúncias &amp; Conduta (UCoC)</span>
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToPage('Wiki:Código_Universal_de_Conduta')}
              className="px-2.5 py-1 text-[11px] bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-[#0645ad] dark:text-[#6ba4ff] font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Código de Conduta</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('Especial:Conselho_de_Arbitragem')}
              className="px-2.5 py-1 text-[11px] bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-purple-700 dark:text-purple-300 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Scale className="w-3 h-3" />
              <span>Conselho de Arbitragem</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          Canal aberto aos colaboradores para denunciar assédio, discurso de ódio, guerra de edições, exposição indevida
          de dados (doxxing), abuso de ferramentas ou qualquer violação ao Código Universal de Conduta.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-rose-700 dark:text-rose-300">Especial:Denúncias</span>
            <span>·</span>
            <span>
              {(isBureaucrat || isAdmin)
                ? 'Modo moderação ativo para emitir parecer e encerrar denúncias'
                : 'Acesso comunitário para registrar e acompanhar denúncias'}
            </span>
          </div>

          {currentUser.isAnonymous && (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-2.5 py-1 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-medium cursor-pointer"
            >
              Entrar com Google para denunciar
            </button>
          )}
        </div>
      </div>

      <UCoCPanel embeddedUserView />
    </div>
  );
};
