import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Scale,
  Download,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Send,
  Clock,
  SlidersHorizontal,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import {
  getStoredConsent,
  saveStoredConsent,
  clearNonEssentialLocalData,
  LEGAL_COMPLIANCE_INFO,
  PrivacyConsentPreferences,
} from '../core/compliance';
import {
  PRIVACY_REQUEST_LABELS,
  submitPrivacyRequest,
  subscribeToMyPrivacyRequests,
  subscribeToAllPrivacyRequests,
  updatePrivacyRequestStatus,
  exportUserPersonalDataJson,
} from '../services/privacyService';
import { PrivacyRequestRecord, PrivacyRequestStatus, PrivacyRequestType } from '../types/wiki';

type PrivacyTab = 'consent' | 'rights' | 'transparency';

const STATUS_BADGE: Record<PrivacyRequestStatus, { label: string; cls: string }> = {
  recebida: {
    label: 'Recebida',
    cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  },
  em_analise: {
    label: 'Em análise (DPO)',
    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  atendida: {
    label: 'Atendida',
    cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  indeferida: {
    label: 'Indeferida / Fundamentada',
    cls: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  },
};

export const SpecialPrivacy: React.FC = () => {
  const { currentUser, settings, navigateToPage, loginWithGoogle } = useWiki();
  const [activeTab, setActiveTab] = useState<PrivacyTab>('consent');

  const initialConsent = getStoredConsent();
  const [allowPreferences, setAllowPreferences] = useState<boolean>(initialConsent?.preferences ?? true);
  const [allowExternal, setAllowExternal] = useState<boolean>(initialConsent?.externalIntegrations ?? true);
  const [consentRecord, setConsentRecord] = useState<PrivacyConsentPreferences | null>(initialConsent);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // LGPD Art. 18 & Marco Civil Art. 19/21 request form
  const [requestType, setRequestType] = useState<PrivacyRequestType>('lgpd_acesso');
  const [targetUrlOrPage, setTargetUrlOrPage] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [myRequests, setMyRequests] = useState<PrivacyRequestRecord[]>([]);
  const [adminRequests, setAdminRequests] = useState<PrivacyRequestRecord[]>([]);
  const [adminNoteMap, setAdminNoteMap] = useState<Record<string, string>>({});

  const isPrivileged = Boolean(currentUser.isBureaucrat || currentUser.isAdmin);
  const dpoContact = settings.lgpdDpoContact || LEGAL_COMPLIANCE_INFO.defaultDpoContact;
  const retentionMonths = settings.marcoCivilRetentionMonths ?? LEGAL_COMPLIANCE_INFO.defaultRetentionMonths;

  useEffect(() => {
    if (currentUser.isAnonymous) {
      setMyRequests([]);
      return;
    }
    const unsub = subscribeToMyPrivacyRequests(currentUser.uid, setMyRequests);
    return () => unsub();
  }, [currentUser.uid, currentUser.isAnonymous]);

  useEffect(() => {
    if (!isPrivileged) {
      setAdminRequests([]);
      return;
    }
    const unsub = subscribeToAllPrivacyRequests(setAdminRequests);
    return () => unsub();
  }, [isPrivileged]);

  const handleSaveConsent = () => {
    const saved = saveStoredConsent({
      preferences: allowPreferences,
      externalIntegrations: allowExternal,
    });
    setConsentRecord(saved);
    setFeedback({
      type: 'ok',
      text: 'Preferências de privacidade e cookies salvas conforme a LGPD (Art. 8º).',
    });
  };

  const handleClearLocal = () => {
    clearNonEssentialLocalData();
    setAllowPreferences(false);
    setAllowExternal(false);
    setConsentRecord(getStoredConsent());
    setFeedback({
      type: 'ok',
      text: 'Consentimentos opcionais revogados e dados locais não essenciais removidos do navegador.',
    });
  };

  const handleExportData = async () => {
    setExporting(true);
    setFeedback(null);
    try {
      await exportUserPersonalDataJson(currentUser);
      setFeedback({
        type: 'ok',
        text: 'Arquivo JSON com seus dados pessoais e contribuições gerado (LGPD Art. 18, II e V).',
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Não foi possível exportar seus dados.',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDetails.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const protocolId = await submitPrivacyRequest({
        requester: currentUser,
        type: requestType,
        targetUrlOrPage,
        details: requestDetails,
      });
      setTargetUrlOrPage('');
      setRequestDetails('');
      setFeedback({
        type: 'ok',
        text: `Solicitação protocolada com sucesso no Firestore (Protocolo #${protocolId.slice(0, 8)}).`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao registrar solicitação.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminStatusUpdate = async (reqId: string, status: PrivacyRequestStatus) => {
    try {
      await updatePrivacyRequestStatus(
        reqId,
        status,
        adminNoteMap[reqId] || `Status atualizado para ${STATUS_BADGE[status].label}.`,
        currentUser.username
      );
      setFeedback({ type: 'ok', text: 'Protocolo atualizado com sucesso.' });
    } catch (err: unknown) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao atualizar protocolo.',
      });
    }
  };

  return (
    <div className="py-2 space-y-5 text-xs">
      {/* Header */}
      <div className="border-b border-[#a2a9b1] dark:border-gray-700 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-serif text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#3366cc]" />
            <span>Central de Privacidade, LGPD e Marco Civil</span>
          </h1>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => navigateToPage('Wiki:Política_de_Privacidade')}
              className="px-2.5 py-1 rounded border border-gray-300 dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 text-[#0645ad] dark:text-[#6ba4ff] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Política de Privacidade</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('Wiki:Termos_de_Uso')}
              className="px-2.5 py-1 rounded border border-gray-300 dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 text-[#0645ad] dark:text-[#6ba4ff] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Termos de Uso (Marco Civil)</span>
            </button>
          </div>
        </div>
        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
          Gestão de consentimento, exercício de direitos do titular conforme a{' '}
          <strong>{LEGAL_COMPLIANCE_INFO.lgpdLaw}</strong> e transparência de registros conforme o{' '}
          <strong>{LEGAL_COMPLIANCE_INFO.marcoCivilLaw}</strong>.
        </p>
      </div>

      {/* Feedback alert */}
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
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'consent' as PrivacyTab, label: 'Cookies e Consentimento', icon: SlidersHorizontal },
          { id: 'rights' as PrivacyTab, label: 'Direitos do Titular (LGPD Art. 18) & Remoção', icon: UserCheck },
          { id: 'transparency' as PrivacyTab, label: 'Transparência, Marco Civil e DPO', icon: Scale },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 font-medium inline-flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                active
                  ? 'border-[#3366cc] text-[#0645ad] dark:text-[#6ba4ff] bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Consent & Cookies */}
      {activeTab === 'consent' && (
        <div className="space-y-4">
          <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100">
                Gerenciamento Granular de Armazenamento e Cookies
              </h2>
              {consentRecord && (
                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                  Última atualização: {new Date(consentRecord.updatedAt).toLocaleString('pt-BR')} · Política{' '}
                  {consentRecord.policyVersion}
                </span>
              )}
            </div>

            {/* Category 1: Essential */}
            <div className="p-3 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Estritamente necessários (Sempre ativo)</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Sessão de autenticação Google/Firebase Auth, prevenção a fraudes, integridade de edições e registro da
                  sua própria escolha de privacidade. Base legal: Execução de contrato e obrigação legal (Art. 7º, II e V
                  da LGPD).
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold shrink-0">
                Obrigatório
              </span>
            </div>

            {/* Category 2: Preferences */}
            <label className="p-3 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  2. Preferências de interface (Armazenamento local)
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Salva localmente no navegador o tema selecionado (Vector 2022, Clássico ou Modo Escuro) e preferências
                  de exibição. Base legal: Consentimento (Art. 7º, I da LGPD).
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowPreferences}
                onChange={e => setAllowPreferences(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-[#3366cc]"
              />
            </label>

            {/* Category 3: External Services */}
            <label className="p-3 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  3. Integrações externas sob demanda (GitHub API e Pesquisa Web)
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Permite consultas sob demanda à API pública do GitHub (commits do repositório) e pesquisa externa no
                  Google Search quando acionadas pelo usuário. Base legal: Consentimento (Art. 7º, I da LGPD).
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowExternal}
                onChange={e => setAllowExternal(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-[#3366cc]"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleClearLocal}
                className="px-3 py-1.5 rounded border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revogar opcionais e limpar dados locais</span>
              </button>
              <button
                type="button"
                onClick={handleSaveConsent}
                className="px-4 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-semibold cursor-pointer"
              >
                Salvar preferências
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LGPD Art. 18 Rights + Marco Civil Art. 19/21 */}
      {activeTab === 'rights' && (
        <div className="space-y-5">
          {/* Summary + Portability Export */}
          <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100">
                  Seus Dados Pessoais e Portabilidade (LGPD Art. 18, I, II e V)
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                  Consulte o resumo dos dados associados à sua sessão e baixe uma cópia estruturada em JSON.
                </p>
              </div>
              <button
                type="button"
                disabled={exporting}
                onClick={handleExportData}
                className="px-3.5 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] disabled:opacity-50 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exporting ? 'Exportando...' : 'Exportar meus dados (JSON)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase">Tipo de Sessão</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                  {currentUser.isAnonymous ? 'Visitante (Não autenticado)' : 'Conta Google (Firebase Auth)'}
                </div>
              </div>
              <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase">Nome Público / Identificador</div>
                <div className="font-mono text-gray-900 dark:text-gray-100 mt-0.5 truncate">{currentUser.username}</div>
              </div>
              <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase">E-mail (Privado por padrão)</div>
                <div className="font-mono text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                  {currentUser.email || 'Não coletado'}
                </div>
              </div>
              <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase">UID Técnico</div>
                <div className="font-mono text-gray-900 dark:text-gray-100 mt-0.5 truncate">{currentUser.uid}</div>
              </div>
            </div>
          </div>

          {/* Submit Request Form */}
          <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-white dark:bg-gray-900 space-y-3">
            <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100">
              Protocolar Requerimento ao Encarregado (LGPD Art. 18) ou Notificação Marco Civil (Art. 19 / Art. 21)
            </h2>

            {currentUser.isAnonymous ? (
              <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-amber-900 dark:text-amber-200">
                  Para protocolar requerimentos autenticados e acompanhar o andamento com sigilo, entre com sua conta
                  Google ou envie diretamente ao DPO ({dpoContact}).
                </span>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="px-3 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-semibold cursor-pointer"
                >
                  Entrar com Google
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de requerimento:
                    </label>
                    <select
                      value={requestType}
                      onChange={e => setRequestType(e.target.value as PrivacyRequestType)}
                      className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                    >
                      {(Object.keys(PRIVACY_REQUEST_LABELS) as PrivacyRequestType[]).map(key => (
                        <option key={key} value={key}>
                          {PRIVACY_REQUEST_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      URL ou página específica (obrigatório para Marco Civil Art. 19/21):
                    </label>
                    <input
                      type="text"
                      value={targetUrlOrPage}
                      onChange={e => setTargetUrlOrPage(e.target.value)}
                      placeholder="Ex: https://core.wazzimagiygg.com/#/wiki/Nome_da_Pagina"
                      className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Descrição detalhada do pedido:
                  </label>
                  <textarea
                    required
                    rows={3}
                    maxLength={4000}
                    value={requestDetails}
                    onChange={e => setRequestDetails(e.target.value)}
                    placeholder="Descreva claramente os dados pessoais envolvidos, correções desejadas ou a indicação específica do conteúdo e fundamentação legal..."
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Prazo legal de resposta simplificada imediata ou completa em até 15 dias (Art. 19 da LGPD).
                  </span>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] disabled:opacity-50 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Enviando...' : 'Protocolar solicitação'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* My Requests */}
          {!currentUser.isAnonymous && (
            <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 space-y-2">
              <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#3366cc]" />
                <span>Minhas solicitações protocoladas ({myRequests.length})</span>
              </h3>
              {myRequests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma solicitação de privacidade registrada para esta conta até o momento.
                </p>
              ) : (
                <div className="space-y-2">
                  {myRequests.map(req => {
                    const badge = STATUS_BADGE[req.status] || STATUS_BADGE.recebida;
                    return (
                      <div
                        key={req.id}
                        className="p-3 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {PRIVACY_REQUEST_LABELS[req.type] || req.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        {req.targetUrlOrPage && (
                          <div className="text-[11px] font-mono text-gray-600 dark:text-gray-400">
                            Referência: {req.targetUrlOrPage}
                          </div>
                        )}
                        <p className="text-gray-700 dark:text-gray-300">{req.details}</p>
                        {req.responseNote && (
                          <div className="mt-1 p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                            <strong>Resposta do Encarregado (DPO):</strong> {req.responseNote}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-500 font-mono">
                          Protocolo #{req.id.slice(0, 8)} · Registrado em {new Date(req.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Admin / DPO Queue */}
          {isPrivileged && (
            <div className="p-4 rounded border border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
              <h3 className="font-serif font-bold text-sm text-purple-900 dark:text-purple-200">
                Painel do Encarregado (DPO) / Administração — Solicitações LGPD & Marco Civil ({adminRequests.length})
              </h3>
              {adminRequests.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">Nenhuma solicitação pendente na fila.</p>
              ) : (
                <div className="space-y-2.5">
                  {adminRequests.map(req => {
                    const badge = STATUS_BADGE[req.status] || STATUS_BADGE.recebida;
                    return (
                      <div
                        key={req.id}
                        className="p-3 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{req.requesterName}</span>{' '}
                            <span className="font-mono text-[10px] text-gray-500">({req.requesterUid})</span> —{' '}
                            <span className="font-medium text-[#0645ad] dark:text-[#6ba4ff]">
                              {PRIVACY_REQUEST_LABELS[req.type] || req.type}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        {req.targetUrlOrPage && (
                          <div className="text-[11px] font-mono text-gray-600 dark:text-gray-400">
                            URL/Página: {req.targetUrlOrPage}
                          </div>
                        )}
                        <p className="text-gray-700 dark:text-gray-300">{req.details}</p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Nota de resposta / fundamentação..."
                            value={adminNoteMap[req.id] ?? req.responseNote ?? ''}
                            onChange={e =>
                              setAdminNoteMap(prev => ({ ...prev, [req.id]: e.target.value }))
                            }
                            className="flex-1 min-w-[200px] px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleAdminStatusUpdate(req.id, 'em_analise')}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] cursor-pointer"
                          >
                            Em análise
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdminStatusUpdate(req.id, 'atendida')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] cursor-pointer"
                          >
                            Atender
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdminStatusUpdate(req.id, 'indeferida')}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] cursor-pointer"
                          >
                            Indeferir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Transparency, Marco Civil & DPO */}
      {activeTab === 'transparency' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 space-y-2">
              <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3366cc]" />
                <span>Encarregado pelo Tratamento de Dados (DPO — Art. 41 LGPD)</span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                O canal oficial de comunicação entre titulares de dados, a comunidade e a Autoridade Nacional de
                Proteção de Dados (ANPD) está disponível em:
              </p>
              <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 font-mono text-[#0645ad] dark:text-[#6ba4ff]">
                {dpoContact}
              </div>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
                <li>
                  <strong>Privacidade por padrão (Art. 6º, III e Art. 46):</strong> e-mails pessoais não são expostos
                  publicamente em páginas <code>Usuário:</code> por padrão.
                </li>
                <li>
                  <strong>Segurança técnica:</strong> tráfego HTTPS, regras de isolamento de PII no Firestore e cabeçalhos
                  HTTP de proteção (<code>Referrer-Policy</code>, <code>Permissions-Policy</code>,{' '}
                  <code>X-Content-Type-Options</code>).
                </li>
              </ul>
            </div>

            <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 space-y-2">
              <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#3366cc]" />
                <span>Marco Civil da Internet (Lei nº 12.965/2014)</span>
              </h2>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1.5 leading-relaxed">
                <li>
                  <strong>Guarda de registros de acesso a aplicações (Art. 15):</strong> mantidos sob sigilo e ambiente
                  controlado pelo prazo mínimo legal de <strong>{retentionMonths} meses</strong>, disponibilizados
                  exclusivamente mediante ordem judicial (Art. 22).
                </li>
                <li>
                  <strong>Liberdade de expressão e responsabilidade (Art. 19):</strong> a remoção compulsória de
                  conteúdo editorial de terceiros exige indicação clara e específica da URL/página e ordem judicial,
                  ressalvadas as hipóteses do Art. 21 (remoção urgente mediante notificação de conteúdo íntimo sem
                  consentimento) e violações ao Código Universal de Conduta.
                </li>
                <li>
                  <strong>Transparência e não rastreamento abusivo (Art. 7º, VII–IX):</strong> não compartilhamos dados
                  pessoais com terceiros para publicidade comportamental.
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Basis Table */}
          <div className="overflow-x-auto border border-[#a2a9b1] dark:border-gray-700 rounded bg-[#f8f9fa] dark:bg-gray-900">
            <table className="wikitable w-full text-left">
              <thead>
                <tr className="bg-[#eaecf0] dark:bg-gray-800 border-b border-[#a2a9b1] dark:border-gray-700">
                  <th className="p-2 font-semibold">Atividade de Tratamento</th>
                  <th className="p-2 font-semibold">Dados Envolvidos</th>
                  <th className="p-2 font-semibold">Base Legal (LGPD)</th>
                  <th className="p-2 font-semibold">Retenção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <tr>
                  <td className="p-2 font-medium">Autenticação de colaboradores</td>
                  <td className="p-2">UID, nome de exibição, e-mail (privado), foto</td>
                  <td className="p-2">Art. 7º, V (Execução de contrato / Termos)</td>
                  <td className="p-2">Enquanto a conta permanecer ativa</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Histórico de revisões enciclopédicas</td>
                  <td className="p-2">Nome público de autor, data/hora, diff da edição</td>
                  <td className="p-2">Art. 7º, V e IX (Atribuição CC BY-SA 4.0 e integridade)</td>
                  <td className="p-2">Permanente (licença livre CC BY-SA 4.0)</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Registros de acesso a aplicações</td>
                  <td className="p-2">Data, hora e identificador técnico de acesso</td>
                  <td className="p-2">Art. 7º, II (Obrigação legal — Art. 15 Marco Civil)</td>
                  <td className="p-2">{retentionMonths} meses (mínimo legal)</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Preferências de tema e serviços externos</td>
                  <td className="p-2">Skin escolhida, consentimento local</td>
                  <td className="p-2">Art. 7º, I (Consentimento revogável)</td>
                  <td className="p-2">Até revogação ou limpeza do navegador</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigateToPage('Wiki:Política_de_Privacidade')}
              className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-[#0645ad] dark:text-[#6ba4ff] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ler texto completo: Wiki:Política de Privacidade</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('Wiki:Termos_de_Uso')}
              className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-[#0645ad] dark:text-[#6ba4ff] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ler texto completo: Wiki:Termos de Uso</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
