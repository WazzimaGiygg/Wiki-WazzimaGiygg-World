import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  AdminDiscussionCategory,
  AdminDiscussionReply,
  AdminDiscussionStatus,
  AdminDiscussionTopic,
} from '../types/wiki';

const ADMIN_DISCUSSIONS_COLLECTION = 'admin_discussions';

export const ADMIN_DISCUSSION_CATEGORY_LABELS: Record<AdminDiscussionCategory, string> = {
  geral: 'Coordenação Geral',
  bloqueios: 'Bloqueios & Sanções',
  seguranca: 'Segurança & Fantoches',
  politicas: 'Políticas & Consenso',
  tecnico: 'Técnico & Infraestrutura',
};

export function subscribeToAdminDiscussions(
  callback: (topics: AdminDiscussionTopic[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, ADMIN_DISCUSSIONS_COLLECTION),
    orderBy('updatedAt', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    snapshot => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<AdminDiscussionTopic, 'id'>),
      }));
      callback(list);
    },
    error => {
      console.warn('Erro ao assinar discussões de administradores:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
}

export async function createAdminDiscussionTopic(params: {
  title: string;
  category: AdminDiscussionCategory;
  content: string;
  author: string;
  authorRole: string;
}): Promise<string> {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error('Autenticação de administrador ou burocrata necessária.');
  }

  const now = new Date().toISOString();
  const payload = {
    title: params.title.trim().slice(0, 250),
    category: params.category,
    content: params.content.trim().slice(0, 10000),
    author: (params.author || 'Administrador').trim().slice(0, 100),
    authorUid: auth.currentUser.uid,
    authorRole: (params.authorRole || 'Administrador').trim().slice(0, 50),
    status: 'aberto' as AdminDiscussionStatus,
    replies: [] as AdminDiscussionReply[],
    createdAt: now,
    updatedAt: now,
  };

  try {
    const ref = await addDoc(collection(db, ADMIN_DISCUSSIONS_COLLECTION), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ADMIN_DISCUSSIONS_COLLECTION);
    throw error;
  }
}

export async function replyToAdminDiscussionTopic(params: {
  topicId: string;
  author: string;
  authorRole: string;
  content: string;
}): Promise<void> {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error('Autenticação de administrador ou burocrata necessária.');
  }

  const now = new Date().toISOString();
  const reply: AdminDiscussionReply = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    author: (params.author || 'Administrador').trim().slice(0, 100),
    authorUid: auth.currentUser.uid,
    authorRole: (params.authorRole || 'Administrador').trim().slice(0, 50),
    content: params.content.trim().slice(0, 4000),
    createdAt: now,
  };

  const ref = doc(db, ADMIN_DISCUSSIONS_COLLECTION, params.topicId);
  try {
    await updateDoc(ref, {
      replies: arrayUnion(reply),
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `${ADMIN_DISCUSSIONS_COLLECTION}/${params.topicId}`
    );
    throw error;
  }
}

export async function updateAdminDiscussionStatus(
  topicId: string,
  status: AdminDiscussionStatus
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error('Autenticação de administrador ou burocrata necessária.');
  }

  const ref = doc(db, ADMIN_DISCUSSIONS_COLLECTION, topicId);
  try {
    await updateDoc(ref, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `${ADMIN_DISCUSSIONS_COLLECTION}/${topicId}`
    );
    throw error;
  }
}
