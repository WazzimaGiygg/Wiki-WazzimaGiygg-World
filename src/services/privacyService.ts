import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  PrivacyRequestRecord,
  PrivacyRequestStatus,
  PrivacyRequestType,
  WikiUser,
} from '../types/wiki';
import { getStoredConsent, LEGAL_COMPLIANCE_INFO } from '../core/compliance';
import { WIKI_SITE_VERSION } from '../core/version';

const PRIVACY_REQUESTS_COLLECTION = 'privacy_requests';

export const PRIVACY_REQUEST_LABELS: Record<PrivacyRequestType, string> = {
  lgpd_acesso: 'LGPD Art. 18, II — Acesso e confirmação de dados',
  lgpd_retificacao: 'LGPD Art. 18, III — Correção de dados incompletos/inexatos',
  lgpd_anonimizacao_eliminacao: 'LGPD Art. 18, IV/VI — Anonimização, bloqueio ou eliminação',
  lgpd_portabilidade: 'LGPD Art. 18, V — Portabilidade de dados',
  lgpd_revogacao_consentimento: 'LGPD Art. 18, IX — Revogação de consentimento',
  marco_civil_art19: 'Marco Civil Art. 19 — Indicação de conteúdo / Ordem judicial',
  marco_civil_art21: 'Marco Civil Art. 21 — Remoção urgente (conteúdo íntimo sem consentimento)',
};

export async function submitPrivacyRequest(params: {
  requester: WikiUser;
  type: PrivacyRequestType;
  targetUrlOrPage?: string;
  details: string;
}): Promise<string> {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error('Faça login com sua conta Google para protocolar uma solicitação vinculada ao seu cadastro.');
  }

  const now = new Date().toISOString();
  const payload = {
    requesterUid: auth.currentUser.uid,
    requesterName: (params.requester.username || 'Usuário').slice(0, 100),
    requesterEmail: (params.requester.email || '').slice(0, 200),
    type: params.type,
    targetUrlOrPage: (params.targetUrlOrPage || '').trim().slice(0, 300),
    details: params.details.trim().slice(0, 4000),
    status: 'recebida' as PrivacyRequestStatus,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const ref = await addDoc(collection(db, PRIVACY_REQUESTS_COLLECTION), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PRIVACY_REQUESTS_COLLECTION);
    throw error;
  }
}

export function subscribeToMyPrivacyRequests(
  uid: string,
  callback: (requests: PrivacyRequestRecord[]) => void
): Unsubscribe {
  if (!uid || uid.startsWith('anon_')) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, PRIVACY_REQUESTS_COLLECTION),
    where('requesterUid', '==', uid),
    limit(50)
  );

  return onSnapshot(
    q,
    snapshot => {
      const list = snapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as Omit<PrivacyRequestRecord, 'id'>) }))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(list);
    },
    error => {
      console.warn('Erro ao assinar solicitações LGPD do usuário:', error);
      callback([]);
    }
  );
}

export function subscribeToAllPrivacyRequests(
  callback: (requests: PrivacyRequestRecord[]) => void
): Unsubscribe {
  const q = query(
    collection(db, PRIVACY_REQUESTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    snapshot => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<PrivacyRequestRecord, 'id'>),
      }));
      callback(list);
    },
    error => {
      console.warn('Erro ao assinar fila de solicitações LGPD:', error);
      callback([]);
    }
  );
}

export async function updatePrivacyRequestStatus(
  requestId: string,
  status: PrivacyRequestStatus,
  responseNote: string,
  handledBy: string
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error('Autenticação administrativa necessária.');
  }

  const ref = doc(db, PRIVACY_REQUESTS_COLLECTION, requestId);
  try {
    await updateDoc(ref, {
      status,
      responseNote: responseNote.trim().slice(0, 2000),
      handledBy: handledBy.slice(0, 100),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRIVACY_REQUESTS_COLLECTION}/${requestId}`);
    throw error;
  }
}

export async function exportUserPersonalDataJson(user: WikiUser): Promise<void> {
  const exportedAt = new Date().toISOString();
  const consent = getStoredConsent();

  let authoredPages: Array<{ slug: string; title: string; updatedAt: string; revisionCount: number }> = [];
  let recentEdits: Array<{ pageId: string; pageTitle: string; summary: string; timestamp: string }> = [];
  let myPrivacyRequests: PrivacyRequestRecord[] = [];

  if (!user.isAnonymous && auth.currentUser) {
    try {
      const pagesSnap = await getDocs(
        query(collection(db, 'wiki_pages'), where('authorId', '==', user.uid), limit(200))
      );
      authoredPages = pagesSnap.docs.map(d => {
        const data = d.data();
        return {
          slug: String(data.slug || d.id),
          title: String(data.title || d.id),
          updatedAt: String(data.updatedAt || ''),
          revisionCount: Number(data.revisionCount || 1),
        };
      });
    } catch {
      // Fallback gracefully if query fails
    }

    try {
      const rcSnap = await getDocs(
        query(collection(db, 'recent_changes'), where('authorId', '==', user.uid), limit(200))
      );
      recentEdits = rcSnap.docs.map(d => {
        const data = d.data();
        return {
          pageId: String(data.pageId || ''),
          pageTitle: String(data.pageTitle || ''),
          summary: String(data.summary || ''),
          timestamp: String(data.timestamp || ''),
        };
      });
    } catch {
      // Fallback gracefully
    }

    try {
      const reqSnap = await getDocs(
        query(collection(db, PRIVACY_REQUESTS_COLLECTION), where('requesterUid', '==', user.uid), limit(100))
      );
      myPrivacyRequests = reqSnap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<PrivacyRequestRecord, 'id'>),
      }));
    } catch {
      // Fallback gracefully
    }
  }

  const bundle = {
    schema: 'WikiWazzimaGiygg-LGPD-Portabilidade-v1',
    wikiSiteVersion: WIKI_SITE_VERSION,
    legalBasis: [LEGAL_COMPLIANCE_INFO.lgpdLaw, LEGAL_COMPLIANCE_INFO.marcoCivilLaw],
    exportedAt,
    titular: {
      uid: user.uid,
      username: user.username,
      email: user.email || null,
      isAnonymous: user.isAnonymous,
      joinedAt: user.joinedAt,
      groups: user.groups || [],
      userPageSlug: user.userPageSlug || null,
      userTalkSlug: user.userTalkSlug || null,
    },
    consentPreferences: consent,
    authoredPages,
    recentEdits,
    privacyRequests: myPrivacyRequests,
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dados-titular-lgpd-${user.uid.slice(0, 12)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
