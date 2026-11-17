import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  RefreshCw,
  Download,
  Megaphone,
  Wrench,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  ExternalLink,
  ShieldCheck,
  Layers,
  Lock,
} from 'lucide-react';
import { useWiki } from '../../context/WikiContext';
import {
  getFirebaseProjectMeta,
  getFirestoreCollectionStats,
  subscribeToAdminAuditLogs,
  recordAdminAuditLog,
  deleteWikiPageWithAudit,
  exportFirestoreBackupJson,
  resyncCoreSystemData,
  FirestoreCollectionStat,
} from '../../services/firebaseAdminService';
import { subscribeToAllPages } from '../../services/wikiService';
import { AdminAuditAction, AdminAuditLogEntry, WikiPage } from '../../types/wiki';

const ACTION_LABELS: Record<AdminAuditAction, { label: string; cls: string }> = {
  page_delete: { label: 'Eliminação de Página', cls: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  site_notice_update: { label: 'Aviso Global', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  maintenance_toggle: { label: 'Modo Manutenção', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  backup_export: { label: 'Backup JSON', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  system_resync: { label: 'Ressincronização', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  settings_update: { label: 'Configurações', cls: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
};

export const FirebaseAdminPanel: React.FC = () => {
  const { currentUser, isBureaucrat, settings, updateSettings, navigateToPage } = useWiki();
  const projectMeta = getFirebaseProjectMeta();

  const [stats, setStats] = useState<FirestoreCollectionStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [pageSearch, setPageSearch] = useState('');

  // SiteNotice & Maintenance controls
  const [siteNotice, setSiteNotice] = useState(settings.siteNotice || '');
  const [siteNoticeLevel, setSiteNoticeLevel] = useState<'info' | 'warning' | 'alert'>(
    settings.siteNoticeLevel || 'info'
  );
  const [maintenanceMode, setMaintenanceMode] = useState(Boolean(settings.maintenanceMode));
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    settings.maintenanceMessage ||
      'O WikiWazzimaGiygg está temporariamente em modo somente leitura para manutenção programada do banco de dados.'
  );

  // Page delete confirmation state
  const [pendingDeletePage, setPendingDeletePage] = useState<WikiPage | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Action busy/feedback state
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    setSiteNotice(settings.siteNotice || '');
    setSiteNoticeLevel(settings.siteNoticeLevel || 'info');
    setMaintenanceMode(Boolean(settings.maintenanceMode));
    if (settings.maintenanceMessage) {
      setMaintenanceMessage(settings.maintenanceMessage);
    }
  }, [settings.siteNotice, settings.siteNoticeLevel, settings.maintenanceMode, settings.maintenanceMessage]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getFirestoreCollectionStats();
      setStats(data);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
    const unsubPages = subscribeToAllPages(list => setPages(list));
    const unsubAudit = isBureaucrat ? subscribeToAdminAuditLogs(setAuditLogs, 60) : () => {};
    return () => {
      unsubPages();
      unsubAudit();
    };
  }, [isBureaucrat]);

  const filteredPages = useMemo(() => {
    const q = pageSearch.trim().toLowerCase();
    if (!q) return pages.slice(0, 30);
    return pages
      .filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.author || '').toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [pages, pageSearch]);

  const handleSaveGlobalControls = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBureaucrat) return;
    setBusyAction('controls');
    setFeedback(null);
    try {
      const maintenanceChanged = maintenanceMode !== Boolean(settings.maintenanceMode);
      await updateSettings({
        siteNotice: siteNotice.trim(),
        siteNoticeLevel,
        maintenanceMode,
        maintenanceMessage: maintenanceMessage.trim(),
      });
      await recordAdminAuditLog({
        action: maintenanceChanged ? 'maintenance_toggle' : 'site_notice_update',
        target: 'wiki_settings/global',
        details: maintenanceChanged
          ? `Modo manutenção ${maintenanceMode ? 'ATIVADO' : 'DESATIVADO'}. Aviso global: "${siteNotice.trim() || '(vazio)'}".`
          : `Aviso global (${siteNoticeLevel}) atualizado para: "${siteNotice.trim() || '(removido)'}".`,
        performedBy: currentUser.username,
        performedByUid: currentUser.uid,
      });
      setFeedback({
        type: 'ok',
        text: 'Controles globais salvos no Firestore e sincronizados em tempo real para todos os visitantes.',
      });
      loadStats();
    } catch (err: unknown) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao atualizar controles globais no Firestore.',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleExportBackup = async () => {
    if (!isBureaucrat) return;
    setBusyAction('backup');
    setFeedback(null);
    try {
      const summary = await exportFirestoreBackupJson({
        performedBy: currentUser.username,
        performedByUid: currentUser.uid,
      });
      setFeedback({
        type: 'ok',
        text: `Backup JSON baixado com sucesso (${summary.pagesCount} páginas, ${summary.rolesCount} perfis de direitos, ${summary.extensionsCount} extensões).`,
      });
      loadStats();
    } catch (err: unknown) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Falha ao exportar backup do Firestore.',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleResyncSystem = async () => {
    if (!isBureaucrat) return;
    setBusyAction('resync');
    setFeedback(null);
    try {
      await resyncCoreSystemData({
        performedBy: currentUser.username,
        performedByUid: currentUser.uid,
      });
      setFeedback({
        type: 'ok',
        text: 'Páginas institucionais padrão e extensões verificadas e ressincronizadas no Firestore.',
      });
      loadStats();
    } catch (err: unknown) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao ressincronizar dados do sistema.',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmDeletePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBureaucrat || !pendingDeletePage || !deleteReason.trim()) return;
    setBusyAction('delete');
    setFeedback(null);
    try {
      await deleteWikiPageWithAudit({
        page: pendingDeletePage,
        reason: deleteReason,
        performedBy: currentUser.username,
        performedByUid: currentUser.uid,
      });
      setFeedback({
        type: 'ok',
        text: `Página "${pendingDeletePage.title}" eliminada do Firestore e registrada na auditoria.`,
      });
      setPendingDeletePage(null);
      setDeleteReason('');
      loadStats();
    } catch (err: unknown) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao eliminar página do Firestore.',
      });
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded border flex items-center gap-2 ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Section 1: Firestore Overview & Quick Ops */}
      <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Administração da Base de Dados Firebase Firestore</span>
            </h2>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
              Projeto: {projectMeta.projectId} · Database ID: {projectMeta.databaseId}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadStats}
              disabled={loadingStats}
              className="px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
              <span>Atualizar contagens</span>
            </button>
            <button
              type="button"
              disabled={!isBureaucrat || busyAction !== null}
              onClick={handleResyncSystem}
              className="px-2.5 py-1.5 rounded border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 disabled:opacity-50 text-purple-800 dark:text-purple-200 font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{busyAction === 'resync' ? 'Sincronizando...' : 'Ressincronizar Padrões'}</span>
            </button>
            <button
              type="button"
              disabled={!isBureaucrat || busyAction !== null}
              onClick={handleExportBackup}
              className="px-3 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] disabled:opacity-50 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{busyAction === 'backup' ? 'Exportando...' : 'Exportar Backup JSON'}</span>
            </button>
          </div>
        </div>

        {/* Collection count cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {stats.map(col => (
            <div
              key={col.id}
              className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={col.label}>
                  {col.label}
                </span>
                <span className="font-mono font-bold text-sm text-[#0645ad] dark:text-[#6ba4ff] tabular-nums">
                  {col.count >= 0 ? col.count : '—'}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate">{col.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Real-Time SiteNotice & Maintenance Mode */}
      <form
        onSubmit={handleSaveGlobalControls}
        className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-white dark:bg-gray-900 space-y-4"
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
          <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-600" />
            <span>Controles Globais em Tempo Real (wiki_settings/global)</span>
          </h2>
          {maintenanceMode && (
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold text-[10px]">
              Modo Manutenção Ativo
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Aviso Global do Site (SiteNotice — deixe vazio para ocultar):
            </label>
            <input
              type="text"
              maxLength={400}
              disabled={!isBureaucrat}
              value={siteNotice}
              onChange={e => setSiteNotice(e.target.value)}
              placeholder="Ex: Bem-vindo(a) à nova versão WC1.16.C7.1 do WikiWazzimaGiygg!"
              className="w-full px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Nível do Aviso:</label>
            <select
              disabled={!isBureaucrat}
              value={siteNoticeLevel}
              onChange={e => setSiteNoticeLevel(e.target.value as 'info' | 'warning' | 'alert')}
              className="w-full px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            >
              <option value="info">Informativo (Azul)</option>
              <option value="warning">Atenção (Âmbar)</option>
              <option value="alert">Alerta Crítico (Vermelho)</option>
            </select>
          </div>
        </div>

        <div className="p-3 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-900 dark:text-gray-100">
            <input
              type="checkbox"
              disabled={!isBureaucrat}
              checked={maintenanceMode}
              onChange={e => setMaintenanceMode(e.target.checked)}
              className="rounded text-amber-600"
            />
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>Ativar Modo de Manutenção (Somente Leitura para não-Burocratas)</span>
          </label>
          <div>
            <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">
              Mensagem exibida durante a manutenção:
            </label>
            <input
              type="text"
              maxLength={400}
              disabled={!isBureaucrat}
              value={maintenanceMessage}
              onChange={e => setMaintenanceMessage(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!isBureaucrat || busyAction !== null}
            className="px-4 py-1.5 rounded bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{busyAction === 'controls' ? 'Salvando no Firestore...' : 'Aplicar Controles Globais'}</span>
          </button>
        </div>
      </form>

      {/* Section 3: Firestore Page Manager (wiki_pages) */}
      <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100">
            Gerenciador de Páginas no Firestore ({pages.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={pageSearch}
              onChange={e => setPageSearch(e.target.value)}
              placeholder="Filtrar por título, slug ou autor..."
              className="w-full pl-8 pr-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-xs"
            />
          </div>
        </div>

        {pendingDeletePage && (
          <form
            onSubmit={handleConfirmDeletePage}
            className="p-3 rounded border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 space-y-2"
          >
            <div className="font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Confirmar eliminação permanente de &quot;{pendingDeletePage.title}&quot;</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                required
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                placeholder="Informe o motivo obrigatório para o registro de auditoria..."
                className="flex-1 min-w-[220px] px-2.5 py-1.5 rounded border border-red-300 dark:border-red-700 bg-white dark:bg-gray-950 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  setPendingDeletePage(null);
                  setDeleteReason('');
                }}
                className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busyAction === 'delete'}
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
              >
                {busyAction === 'delete' ? 'Eliminando...' : 'Eliminar definitivamente'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-gray-950 max-h-80 overflow-y-auto">
          <table className="wikitable w-full text-left">
            <thead>
              <tr className="bg-[#eaecf0] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="p-2 font-semibold">Página</th>
                <th className="p-2 font-semibold">Namespace</th>
                <th className="p-2 font-semibold">Último autor</th>
                <th className="p-2 font-semibold">Rev.</th>
                <th className="p-2 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredPages.map(p => (
                <tr key={p.slug} className="hover:bg-gray-50 dark:hover:bg-gray-900/60">
                  <td className="p-2 font-medium">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigateToPage(p.slug)}
                        className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline text-left cursor-pointer"
                      >
                        {p.title}
                      </button>
                      {(p.isLocked || p.protectionLevel === 'locked') && (
                        <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="p-2 font-mono text-[10px] text-gray-500">{p.namespace}</td>
                  <td className="p-2 text-gray-600 dark:text-gray-400">{p.author}</td>
                  <td className="p-2 font-mono text-[11px]">{p.revisionCount}</td>
                  <td className="p-2 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigateToPage(p.slug)}
                        className="p-1 text-gray-500 hover:text-[#0645ad] cursor-pointer"
                        title="Abrir página"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={!isBureaucrat || p.slug === 'Página_principal'}
                        onClick={() => {
                          setPendingDeletePage(p);
                          setDeleteReason('');
                        }}
                        title={
                          p.slug === 'Página_principal'
                            ? 'A Página Principal não pode ser eliminada'
                            : 'Eliminar página do Firestore'
                        }
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Centralized Admin Audit Logs */}
      <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-white dark:bg-gray-900 space-y-3">
        <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <History className="w-4 h-4 text-purple-600" />
          <span>Registro Central de Auditoria do Banco de Dados ({auditLogs.length})</span>
        </h2>

        {!isBureaucrat ? (
          <p className="text-gray-500 dark:text-gray-400">
            A visualização dos registros de auditoria administrativa é restrita a Burocratas autenticados.
          </p>
        ) : auditLogs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma ação registrada em <code>admin_audit_logs</code> até o momento.
          </p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
            <table className="wikitable w-full text-left">
              <thead>
                <tr className="bg-[#eaecf0] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="p-2 font-semibold">Data/Hora</th>
                  <th className="p-2 font-semibold">Ação</th>
                  <th className="p-2 font-semibold">Alvo</th>
                  <th className="p-2 font-semibold">Executado por</th>
                  <th className="p-2 font-semibold">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {auditLogs.map((log, idx) => {
                  const badge = ACTION_LABELS[log.action] || ACTION_LABELS.settings_update;
                  return (
                    <tr key={log.id || idx}>
                      <td className="p-2 font-mono text-[10px] whitespace-nowrap text-gray-500">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-[11px] text-gray-800 dark:text-gray-200">{log.target}</td>
                      <td className="p-2 font-medium text-gray-800 dark:text-gray-200">{log.performedBy}</td>
                      <td className="p-2 text-gray-600 dark:text-gray-400">{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
