import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Users,
  XCircle,
} from 'lucide-react';
import { useWiki } from '../../context/WikiContext';
import {
  ADMIN_DISCUSSION_CATEGORY_LABELS,
  createAdminDiscussionTopic,
  replyToAdminDiscussionTopic,
  subscribeToAdminDiscussions,
  updateAdminDiscussionStatus,
} from '../../services/adminDiscussionService';
import {
  AdminDiscussionCategory,
  AdminDiscussionStatus,
  AdminDiscussionTopic,
} from '../../types/wiki';

const STATUS_LABELS: Record<
  AdminDiscussionStatus,
  { label: string; cls: string }
> = {
  aberto: {
    label: 'Aberto',
    cls: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  },
  em_votacao: {
    label: 'Em votação',
    cls: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
  },
  resolvido: {
    label: 'Resolvido',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  },
  arquivado: {
    label: 'Arquivado',
    cls: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  },
};

export const AdminDiscussionPanel: React.FC = () => {
  const { currentUser, isBureaucrat, isAdmin, loginWithGoogle } = useWiki();
  const isStaff = isBureaucrat || isAdmin;
  const staffRoleLabel = isBureaucrat ? 'Burocrata' : 'Administrador (Sysop)';

  const [topics, setTopics] = useState<AdminDiscussionTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'todos' | AdminDiscussionCategory>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | AdminDiscussionStatus>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create topic modal/panel state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AdminDiscussionCategory>('geral');
  const [newContent, setNewContent] = useState('');
  const [submittingTopic, setSubmittingTopic] = useState(false);

  // Reply composer map per topic
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isStaff) {
      setTopics([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToAdminDiscussions(
      items => {
        setTopics(items);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsub();
  }, [isStaff]);

  const counts = useMemo(() => {
    return {
      total: topics.length,
      aberto: topics.filter(t => t.status === 'aberto').length,
      em_votacao: topics.filter(t => t.status === 'em_votacao').length,
      resolvido: topics.filter(t => t.status === 'resolvido').length,
    };
  }, [topics]);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return topics.filter(t => {
      if (filterCategory !== 'todos' && t.category !== filterCategory) return false;
      if (filterStatus !== 'todos' && t.status !== filterStatus) return false;
      if (q) {
        const hay = [
          t.title,
          t.content,
          t.author,
          ...(t.replies || []).map(r => `${r.author} ${r.content}`),
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [topics, searchQuery, filterCategory, filterStatus]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFeedback({
        kind: 'error',
        text: 'Informe o título e a pauta do tópico administrativo.',
      });
      return;
    }

    setSubmittingTopic(true);
    setFeedback(null);
    try {
      const id = await createAdminDiscussionTopic({
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim(),
        author: currentUser.username || 'Administrador',
        authorRole: staffRoleLabel,
      });
      setNewTitle('');
      setNewContent('');
      setShowNewForm(false);
      setExpandedId(id);
      setFeedback({
        kind: 'success',
        text: 'Tópico publicado na Área de Discussão de Administradores.',
      });
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Erro ao criar tópico administrativo.',
      });
    } finally {
      setSubmittingTopic(false);
    }
  };

  const handleSendReply = async (topicId: string) => {
    const text = (replyTextMap[topicId] || '').trim();
    if (!text) {
      setFeedback({
        kind: 'error',
        text: 'Escreva um comentário antes de enviar a resposta.',
      });
      return;
    }

    setReplyingId(topicId);
    setFeedback(null);
    try {
      await replyToAdminDiscussionTopic({
        topicId,
        author: currentUser.username || 'Administrador',
        authorRole: staffRoleLabel,
        content: text,
      });
      setReplyTextMap(prev => ({ ...prev, [topicId]: '' }));
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Erro ao publicar resposta.',
      });
    } finally {
      setReplyingId(null);
    }
  };

  const handleChangeStatus = async (topicId: string, status: AdminDiscussionStatus) => {
    setUpdatingStatusId(topicId);
    setFeedback(null);
    try {
      await updateAdminDiscussionStatus(topicId, status);
      setFeedback({
        kind: 'success',
        text: `Status do tópico atualizado para "${STATUS_LABELS[status].label}".`,
      });
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Erro ao atualizar status do tópico.',
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (!isStaff) {
    return (
      <div className="p-5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs space-y-3">
        <div className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-950 dark:text-amber-200">
              Área Exclusiva de Administradores e Burocratas
            </div>
            <p className="text-amber-900 dark:text-amber-300 leading-relaxed">
              Este fórum interno é protegido por regras de segurança no Firestore e reservado exclusivamente à coordenação
              entre administradores (sysops) e burocratas da enciclopédia.
            </p>
          </div>
        </div>
        {currentUser.isAnonymous && (
          <button
            type="button"
            onClick={loginWithGoogle}
            className="px-3 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-medium cursor-pointer"
          >
            Entrar com Conta Administrativa
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 text-xs">
      {/* Header & Summary */}
      <div className="p-4 rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-700 dark:text-purple-400" />
            <h2 className="text-base font-serif font-bold text-gray-900 dark:text-gray-100">
              Área de Discussão de Administradores (Esplanada Sysop)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowNewForm(prev => !prev)}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded flex items-center gap-1.5 cursor-pointer"
          >
            {showNewForm ? <XCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showNewForm ? 'Fechar Formulário' : 'Novo Tópico Administrativo'}</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
          Espaço reservado para deliberação interna entre burocratas e administradores sobre bloqueios complexos,
          segurança, prevenção a fantoches, políticas editoriais e coordenação técnica.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Total de Tópicos</div>
            <div className="text-base font-bold font-mono tabular-nums text-gray-900 dark:text-gray-100">
              {counts.total}
            </div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] uppercase tracking-wide text-blue-700 dark:text-blue-400">Abertos</div>
            <div className="text-base font-bold font-mono tabular-nums text-blue-800 dark:text-blue-300">
              {counts.aberto}
            </div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] uppercase tracking-wide text-purple-700 dark:text-purple-400">Em Votação</div>
            <div className="text-base font-bold font-mono tabular-nums text-purple-800 dark:text-purple-300">
              {counts.em_votacao}
            </div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Resolvidos</div>
            <div className="text-base font-bold font-mono tabular-nums text-emerald-800 dark:text-emerald-300">
              {counts.resolvido}
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

      {/* New Topic Inline Composer */}
      {showNewForm && (
        <form
          onSubmit={handleCreateTopic}
          className="p-4 rounded border border-purple-300 dark:border-purple-800 bg-white dark:bg-gray-900 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
            <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100">
              Abrir Nova Pauta Administrativa
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              Publicando como {currentUser.username} · {staffRoleLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Assunto / Título da Pauta *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ex: Coordenação sobre bloqueio em lote ou revisão de proteção..."
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Categoria *
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as AdminDiscussionCategory)}
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {(Object.keys(ADMIN_DISCUSSION_CATEGORY_LABELS) as AdminDiscussionCategory[]).map(key => (
                  <option key={key} value={key}>
                    {ADMIN_DISCUSSION_CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Exposição da Pauta e Proposta *
            </label>
            <textarea
              rows={4}
              required
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Detalhe o contexto, páginas envolvidas, registros relevantes e qual decisão a equipe precisa tomar..."
              className="w-full p-2.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submittingTopic}
              className="px-4 py-1.5 rounded bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              {submittingTopic ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Publicar Tópico</span>
            </button>
          </div>
        </form>
      )}

      {/* Search & Filters */}
      <div className="p-3 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar tópicos, autores ou respostas..."
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as 'todos' | AdminDiscussionCategory)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100"
          >
            <option value="todos">Todas as categorias</option>
            {(Object.keys(ADMIN_DISCUSSION_CATEGORY_LABELS) as AdminDiscussionCategory[]).map(key => (
              <option key={key} value={key}>
                {ADMIN_DISCUSSION_CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as 'todos' | AdminDiscussionStatus)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100"
          >
            <option value="todos">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="em_votacao">Em votação</option>
            <option value="resolvido">Resolvido</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </div>
      </div>

      {/* Topics Thread List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">
          <Clock className="w-5 h-5 mx-auto mb-2 animate-spin text-purple-600" />
          <span>Carregando discussões administrativas do Firestore...</span>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded text-gray-500">
          <MessageSquare className="w-7 h-7 mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
            Nenhum tópico administrativo encontrado
          </p>
          <p className="text-[11px] mt-1">
            Clique em &ldquo;Novo Tópico Administrativo&rdquo; para iniciar uma deliberação da equipe.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map(topic => {
            const isExpanded = expandedId === topic.id;
            const statusMeta = STATUS_LABELS[topic.status] || STATUS_LABELS.aberto;
            const replies = topic.replies || [];

            return (
              <div
                key={topic.id}
                className="bg-white dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                  className="p-3 bg-[#f8f9fa] dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${statusMeta.cls}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100 break-words">
                        {topic.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{ADMIN_DISCUSSION_CATEGORY_LABELS[topic.category] || topic.category}</span>
                      <span>·</span>
                      <span>
                        Aberto por <strong className="text-gray-700 dark:text-gray-300">{topic.author}</strong> ({topic.authorRole})
                      </span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">
                        {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono tabular-nums shrink-0">
                    <span>{new Date(topic.updatedAt).toLocaleDateString('pt-BR')}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {/* Original Topic Body */}
                    <div className="p-3.5 rounded bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-1.5">
                        <span>
                          <strong className="text-gray-800 dark:text-gray-200">{topic.author}</strong> · {topic.authorRole}
                        </span>
                        <span className="font-mono tabular-nums">
                          {new Date(topic.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                        {topic.content}
                      </p>
                    </div>

                    {/* Status Control */}
                    <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-y border-gray-100 dark:border-gray-800">
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                        Status da Deliberação:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(['aberto', 'em_votacao', 'resolvido', 'arquivado'] as AdminDiscussionStatus[]).map(st => (
                          <button
                            key={st}
                            type="button"
                            disabled={updatingStatusId === topic.id || topic.status === st}
                            onClick={() => handleChangeStatus(topic.id, st)}
                            className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer transition-colors ${
                              topic.status === st
                                ? 'bg-purple-700 text-white border-purple-700'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {STATUS_LABELS[st].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Replies Thread */}
                    <div className="space-y-2.5">
                      <div className="font-bold text-gray-700 dark:text-gray-300">
                        Respostas e Pareceres ({replies.length})
                      </div>

                      {replies.length === 0 ? (
                        <div className="p-3 rounded border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 text-[11px]">
                          Nenhuma resposta registrada ainda neste tópico.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {replies.map(reply => (
                            <div
                              key={reply.id}
                              className="p-3 rounded bg-[#f8f9fa] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                <span>
                                  <strong className="text-gray-900 dark:text-gray-100">{reply.author}</strong> ·{' '}
                                  {reply.authorRole}
                                </span>
                                <span className="font-mono tabular-nums">
                                  {new Date(reply.createdAt).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Reply Form */}
                    <div className="pt-2 space-y-2">
                      <textarea
                        rows={2}
                        value={replyTextMap[topic.id] || ''}
                        onChange={e => setReplyTextMap(prev => ({ ...prev, [topic.id]: e.target.value }))}
                        placeholder="Adicionar parecer, voto ou comentário administrativo..."
                        className="w-full p-2.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={replyingId === topic.id}
                          onClick={() => handleSendReply(topic.id)}
                          className="px-3.5 py-1.5 rounded bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-medium inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {replyingId === topic.id ? (
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Enviar Resposta</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
