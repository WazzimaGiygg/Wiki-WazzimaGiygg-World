import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useWiki } from '../../context/WikiContext';
import {
  PRIVACY_REQUEST_LABELS,
  subscribeToAllPrivacyRequests,
  updatePrivacyRequestStatus,
} from '../../services/privacyService';
import {
  PrivacyRequestRecord,
  PrivacyRequestStatus,
  PrivacyRequestType,
} from '../../types/wiki';

const STATUS_META: Record<
  PrivacyRequestStatus,
  { label: string; textClass: string; borderClass: string; bgClass: string }
> = {
  recebida: {
    label: 'Recebida',
    textClass: 'text-blue-800 dark:text-blue-300',
    borderClass: 'border-blue-300 dark:border-blue-800',
    bgClass: 'bg-blue-50 dark:bg-blue-950/50',
  },
  em_analise: {
    label: 'Em análise',
    textClass: 'text-amber-800 dark:text-amber-300',
    borderClass: 'border-amber-300 dark:border-amber-800',
    bgClass: 'bg-amber-50 dark:bg-amber-950/50',
  },
  atendida: {
    label: 'Atendida',
    textClass: 'text-emerald-800 dark:text-emerald-300',
    borderClass: 'border-emerald-300 dark:border-emerald-800',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  indeferida: {
    label: 'Indeferida',
    textClass: 'text-red-800 dark:text-red-300',
    borderClass: 'border-red-300 dark:border-red-800',
    bgClass: 'bg-red-50 dark:bg-red-950/50',
  },
};

export const LgpdRequestsPanel: React.FC = () => {
  const { currentUser, isBureaucrat, isAdmin, loginWithGoogle, navigateToPage } = useWiki();
  const isStaff = isBureaucrat || isAdmin;

  const [requests, setRequests] = useState<PrivacyRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'todos' | PrivacyRequestStatus>('todos');
  const [filterType, setFilterType] = useState<'todos' | PrivacyRequestType>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isStaff) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToAllPrivacyRequests(items => {
      setRequests(items);
      setLoading(false);
    });
    return () => unsub();
  }, [isStaff]);

  const counts = useMemo(() => {
    return {
      total: requests.length,
      recebida: requests.filter(r => r.status === 'recebida').length,
      em_analise: requests.filter(r => r.status === 'em_analise').length,
      atendida: requests.filter(r => r.status === 'atendida').length,
      indeferida: requests.filter(r => r.status === 'indeferida').length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requests.filter(req => {
      if (filterStatus !== 'todos' && req.status !== filterStatus) return false;
      if (filterType !== 'todos' && req.type !== filterType) return false;
      if (q) {
        const hay = [
          req.requesterName,
          req.requesterEmail || '',
          req.requesterUid,
          req.targetUrlOrPage || '',
          req.details,
          PRIVACY_REQUEST_LABELS[req.type] || req.type,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, filterStatus, filterType, searchQuery]);

  const handleUpdateStatus = async (req: PrivacyRequestRecord, status: PrivacyRequestStatus) => {
    const note = (noteMap[req.id] ?? req.responseNote ?? '').trim();
    setSavingId(req.id);
    setFeedback(null);
    try {
      await updatePrivacyRequestStatus(
        req.id,
        status,
        note,
        currentUser.username || 'DPO / Administração'
      );
      setFeedback({
        kind: 'success',
        text: `Solicitação de "${req.requesterName}" atualizada para "${STATUS_META[status].label}".`,
      });
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Erro ao atualizar pedido LGPD no Firestore.',
      });
    } finally {
      setSavingId(null);
    }
  };

  if (!isStaff) {
    return (
      <div className="p-5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs space-y-3">
        <div className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-950 dark:text-amber-200">
              Acesso restrito ao Encarregado (DPO), Administradores e Burocratas
            </div>
            <p className="text-amber-900 dark:text-amber-300 leading-relaxed">
              Por força do sigilo de dados pessoais (LGPD Art. 18 e isolamento de PII no Firestore), apenas membros da
              administração e burocratas podem visualizar a fila completa de requerimentos de outros titulares.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {currentUser.isAnonymous && (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-3 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-medium cursor-pointer"
            >
              Entrar com Conta Administrativa
            </button>
          )}
          <button
            type="button"
            onClick={() => navigateToPage('Especial:Privacidade')}
            className="px-3 py-1.5 rounded border border-amber-400 dark:border-amber-700 bg-white dark:bg-gray-900 text-amber-900 dark:text-amber-200 font-medium cursor-pointer"
          >
            Ir para Central de Privacidade (Meus Pedidos)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-xs">
      {/* Header */}
      <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-purple-700 dark:text-purple-400" />
            <h2 className="text-base font-serif font-bold text-gray-900 dark:text-gray-100">
              Pedidos de LGPD &amp; Marco Civil da Internet (Fila DPO)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateToPage('Especial:Privacidade')}
            className="px-2.5 py-1 text-[11px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded text-[#0645ad] dark:text-[#6ba4ff] font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Abrir Portal Público LGPD</span>
          </button>
        </div>
        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
          Gerencie solicitações de titulares de dados (LGPD Art. 18: acesso, retificação, eliminação, portabilidade e
          revogação) e notificações do Marco Civil (Arts. 19 e 21) com registro de parecer e trilha auditada no Firestore.
        </p>

        {/* Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Total</div>
            <div className="text-base font-bold font-mono tabular-nums text-gray-900 dark:text-gray-100">
              {counts.total}
            </div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] uppercase tracking-wide text-blue-700 dark:text-blue-400">Recebidas</div>
            <div className="text-base font-bold font-mono tabular-nums text-blue-800 dark:text-blue-300">
              {counts.recebida}
            </div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] uppercase tracking-wide text-amber-700 dark:text-amber-400">Em Análise</div>
            <div className="text-base font-bold font-mono tabular-nums text-amber-800 dark:text-amber-300">
              {counts.em_analise}
            </div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Atendidas</div>
            <div className="text-base font-bold font-mono tabular-nums text-emerald-800 dark:text-emerald-300">
              {counts.atendida}
            </div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] uppercase tracking-wide text-red-700 dark:text-red-400">Indeferidas</div>
            <div className="text-base font-bold font-mono tabular-nums text-red-800 dark:text-red-300">
              {counts.indeferida}
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded border flex items-center gap-2 text-xs ${
            feedback.kind === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {feedback.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filtrar por titular, e-mail, UID, URL ou descrição..."
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as 'todos' | PrivacyRequestType)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100"
          >
            <option value="todos">Todos os fundamentos</option>
            {(Object.keys(PRIVACY_REQUEST_LABELS) as PrivacyRequestType[]).map(key => (
              <option key={key} value={key}>
                {PRIVACY_REQUEST_LABELS[key]}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as 'todos' | PrivacyRequestStatus)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100"
          >
            <option value="todos">Todos os status ({requests.length})</option>
            <option value="recebida">Recebidas ({counts.recebida})</option>
            <option value="em_analise">Em análise ({counts.em_analise})</option>
            <option value="atendida">Atendidas ({counts.atendida})</option>
            <option value="indeferida">Indeferidas ({counts.indeferida})</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">
          <Clock className="w-5 h-5 mx-auto mb-2 animate-spin text-purple-600" />
          <span>Carregando requerimentos LGPD do Firestore...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded text-gray-500">
          <ShieldCheck className="w-7 h-7 mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
            Nenhum pedido de LGPD encontrado
          </p>
          <p className="text-[11px] mt-1">Não há solicitações correspondentes aos filtros atuais.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(req => {
            const meta = STATUS_META[req.status] || STATUS_META.recebida;
            const isSaving = savingId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {req.requesterName}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                        UID: {req.requesterUid}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-semibold text-[#0645ad] dark:text-[#6ba4ff]">
                        {PRIVACY_REQUEST_LABELS[req.type] || req.type}
                      </span>
                      {req.requesterEmail && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{req.requesterEmail}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono tabular-nums text-right">
                    <div>Aberto: {new Date(req.createdAt).toLocaleString('pt-BR')}</div>
                    <div>Atualizado: {new Date(req.updatedAt).toLocaleString('pt-BR')}</div>
                  </div>
                </div>

                {req.targetUrlOrPage && (
                  <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-[11px] font-mono text-gray-700 dark:text-gray-300 break-all">
                    URL / Página indicada: {req.targetUrlOrPage}
                  </div>
                )}

                <div className="p-3 rounded bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                  {req.details}
                </div>

                {req.handledBy && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Último parecer registrado por <strong>{req.handledBy}</strong>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Despacho do DPO / fundamentação da decisão (opcional ou obrigatório ao indeferir)..."
                    value={noteMap[req.id] ?? req.responseNote ?? ''}
                    onChange={e => setNoteMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                    className="flex-1 min-w-[240px] px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleUpdateStatus(req, 'em_analise')}
                    className="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium cursor-pointer"
                  >
                    Em análise
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleUpdateStatus(req, 'atendida')}
                    className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Atender</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleUpdateStatus(req, 'indeferida')}
                    className="px-2.5 py-1.5 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Indeferir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
