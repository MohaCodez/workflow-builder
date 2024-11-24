import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export class WorkflowAuthorization {
  async canExecute(userId: string, workflowId: string): Promise<boolean> {
    if (!userId) return false;
    
    const workflowRef = doc(db, 'workflows', workflowId);
    const workflowDoc = await getDoc(workflowRef);
    
    if (!workflowDoc.exists()) return false;
    
    const workflow = workflowDoc.data();
    return workflow.createdBy === userId || workflow.collaborators?.includes(userId);
  }

  async canEdit(userId: string, workflowId: string): Promise<boolean> {
    // For now, using same logic as canExecute
    return this.canExecute(userId, workflowId);
  }
} 