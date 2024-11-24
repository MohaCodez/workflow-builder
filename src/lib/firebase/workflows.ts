import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Workflow } from '../../types/workflow';

const WORKFLOWS_COLLECTION = 'workflows';

export async function getWorkflows(): Promise<Workflow[]> {
  const q = query(collection(db, WORKFLOWS_COLLECTION), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
}

export async function saveWorkflow(workflow: Workflow): Promise<void> {
  const docRef = doc(db, WORKFLOWS_COLLECTION, workflow.id);
  await setDoc(docRef, workflow);
}

export async function deleteWorkflow(id: string): Promise<void> {
  const docRef = doc(db, WORKFLOWS_COLLECTION, id);
  await deleteDoc(docRef);
}