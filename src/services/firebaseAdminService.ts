import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  getCountFromServer,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { AdminAuditAction, AdminAuditLogEntry, WikiPage } from '../types/wiki';
import { seedInitialPagesIfNeeded } from './wikiService';
import { syncCodebaseExtensionsToFirestore } from './extensionService';
import { WIKI_SITE_VERSION } from '../core/version';
import firebaseConfig from '../../firebase-applet-config.json';

const ADMIN_AUDIT_LOGS_COLLECTION = 'admin_audit_logs';

export interface FirestoreCollectionStat {
  id: string;
  label: string;
  description: string;
  count: number;
}

const MONITORED_COLLECTIONS: Array<{ id: string; label: string; description: string }> = [
  { id: 'wiki_pages', label: 'Páginas (wiki_pages)', description: 'Artigos, políticas e páginas de usuário' },
  { id: 'recent_changes', label: 'Mudanças Recentes', description: 'Histórico cronológico de edições' },
  { id: 'user_roles', label: 'Grupos e Permissões', description: 'Cargos de usuários e burocratas' },
  { id: 'wiki_extensions', label: 'Extensões', description: 'Módulos registrados no Firestore' },
  { id: 'wiki_files', label: 'Arquivos / Mídia', description: 'Imagens e ficheiros carregados' },
  { id: 'privacy_requests', label: 'Solicitações LGPD/MCI', description: 'Requerimentos de titulares e DPO' },
  { id: 'bureaucrat_logs', label: 'Logs de Burocrata', description: 'Alterações de privilégios' },
  { id: 'page_protection_logs', label: 'Logs de Proteção', description: 'Histórico de bloqueio de páginas' },
  { id: 'checkuser_cases', label: 'Casos CheckUser', description: 'Investigações de fantoches' },
  { id: 'unblock_requests', label: 'Pedidos de Desbloqueio', description: 'Recursos comunitários' },
  { id: 'arbcom_cases', label: 'Casos ArbCom', description: 'Conselho de Arbitragem' },
  { id: 'ucoc_reports', label: 'Denúncias UCoC', description: 'Código Universal de Conduta' },
  { id: 'admin_audit_logs', label: 'Auditoria Admin', description: 'Registro central de ações do banco' },
];

export function getFirebaseProjectMeta() {
  return {
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId,
    authDomain: firebaseConfig.authDomain,
  };
}

export async function getFirestoreCollectionStats(): Promise<FirestoreCollectionStat[]> {
  const results = await Promise.all(
    MONITORED_COLLECTIONS.map(async col => {
      try {
        const snap = await getCountFromServer(collection(db, col.id));
        return {
          ...col,
          count: snap.data().count,
        };
      } catch {
        return {
          ...col,
          count: -1,
        };
      }
    })
  );
  return results;
}

export async function recordAdminAuditLog(params: {
  action: AdminAuditAction;
  target: string;
  details: string;
  performedBy: string;
  performedByUid: string;
}): Promise<string> {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error('Autenticação administrativa obrigatória.');
  }

  const payload: Omit<AdminAuditLogEntry, 'id'> = {
    action: params.action,
    target: params.target.trim().slice(0, 200),
    details: params.details.trim().slice(0, 2000),
    performedBy: params.performedBy.trim().slice(0, 100),
    performedByUid: auth.currentUser.uid,
    timestamp: new Date().toISOString(),
  };

  try {
    const ref = await addDoc(collection(db, ADMIN_AUDIT_LOGS_COLLECTION), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ADMIN_AUDIT_LOGS_COLLECTION);
    throw error;
  }
}

export function subscribeToAdminAuditLogs(
  callback: (logs: AdminAuditLogEntry[]) => void,
  maxCount = 60
): Unsubscribe {
  const q = query(
    collection(db, ADMIN_AUDIT_LOGS_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(maxCount)
  );

  return onSnapshot(
    q,
    snapshot => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<AdminAuditLogEntry, 'id'>),
      }));
      callback(list);
    },
    error => {
      console.warn('Erro ao assinar admin_audit_logs:', error);
      callback([]);
    }
  );
}

export async function deleteWikiPageWithAudit(params: {
  page: WikiPage;
  reason: string;
  performedBy: string;
  performedByUid: string;
}): Promise<void> {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error('Autenticação administrativa obrigatória para eliminar páginas.');
  }

  const pagePath = `wiki_pages/${params.page.slug}`;
  try {
    await deleteDoc(doc(db, 'wiki_pages', params.page.slug));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, pagePath);
    throw error;
  }

  await recordAdminAuditLog({
    action: 'page_delete',
    target: params.page.title || params.page.slug,
    details: `Página "${params.page.slug}" eliminada do Firestore. Motivo: ${params.reason.trim()}`,
    performedBy: params.performedBy,
    performedByUid: params.performedByUid,
  });
}

export async function resyncCoreSystemData(params: {
  performedBy: string;
  performedByUid: string;
}): Promise<void> {
  await seedInitialPagesIfNeeded();
  await syncCodebaseExtensionsToFirestore();
  await recordAdminAuditLog({
    action: 'system_resync',
    target: 'wiki_pages + wiki_extensions',
    details: 'Verificação e ressincronização de páginas institucionais padrão e extensões no Firestore.',
    performedBy: params.performedBy,
    performedByUid: params.performedByUid,
  });
}

export async function exportFirestoreBackupJson(params: {
  performedBy: string;
  performedByUid: string;
}): Promise<{ pagesCount: number; rolesCount: number; extensionsCount: number }> {
  const [pagesSnap, settingsSnap, rolesSnap, extSnap, protSnap] = await Promise.all([
    getDocs(collection(db, 'wiki_pages')),
    getDocs(collection(db, 'wiki_settings')),
    getDocs(collection(db, 'user_roles')),
    getDocs(collection(db, 'wiki_extensions')),
    getDocs(query(collection(db, 'page_protection_logs'), orderBy('timestamp', 'desc'), limit(200))),
  ]);

  const backup = {
    schema: 'WikiWazzimaGiygg-Firestore-Backup-v1',
    wikiSiteVersion: WIKI_SITE_VERSION,
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId,
    exportedAt: new Date().toISOString(),
    exportedBy: params.performedBy,
    collections: {
      wiki_pages: pagesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      wiki_settings: settingsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      user_roles: rolesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      wiki_extensions: extSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      page_protection_logs: protSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    },
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.download = `backup-firestore-wiki-${dateStamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  await recordAdminAuditLog({
    action: 'backup_export',
    target: firebaseConfig.firestoreDatabaseId,
    details: `Backup JSON exportado (${pagesSnap.size} páginas, ${rolesSnap.size} perfis de direitos, ${extSnap.size} extensões).`,
    performedBy: params.performedBy,
    performedByUid: params.performedByUid,
  });

  return {
    pagesCount: pagesSnap.size,
    rolesCount: rolesSnap.size,
    extensionsCount: extSnap.size,
  };
}
