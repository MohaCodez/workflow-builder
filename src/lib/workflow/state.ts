interface ExecutionHistory {
  nodeId: string;
  timestamp: Date;
  status: 'success' | 'failure';
  output?: any;
  error?: string;
}

interface WorkflowState {
  status: 'running' | 'paused' | 'completed' | 'failed';
  currentNode: string | null;
  variables: Record<string, any>;
  history: ExecutionHistory[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export class WorkflowStateManager {
  constructor(private db: any) {} // Inject your database connection

  async saveState(workflowId: string, state: WorkflowState): Promise<void> {
    try {
      await this.db.collection('workflowStates').updateOne(
        { workflowId },
        { $set: { ...state, updatedAt: new Date() } },
        { upsert: true }
      );
    } catch (error: any) {
      throw new Error(`Failed to save workflow state: ${error.message}`);
    }
  }

  async getState(workflowId: string): Promise<WorkflowState | null> {
    try {
      const state = await this.db.collection('workflowStates')
        .findOne({ workflowId });
      return state ? state as WorkflowState : null;
    } catch (error: any ) {
      throw new Error(`Failed to get workflow state: ${error.message}`);
    }
  }

  async updateStatus(
    workflowId: string, 
    status: WorkflowState['status'], 
    error?: string
  ): Promise<void> {
    const updates: Partial<WorkflowState> = { status };
    
    if (status === 'completed' || status === 'failed') {
      updates.completedAt = new Date();
    }
    if (error) {
      updates.error = error;
    }

    try {
      await this.db.collection('workflowStates').updateOne(
        { workflowId },
        { $set: updates }
      );
    } catch (error: any ) {
      throw new Error(`Failed to update workflow status: ${error.message}`);
    }
  }

  async addToHistory(
    workflowId: string, 
    historyEntry: ExecutionHistory
  ): Promise<void> {
    try {
      await this.db.collection('workflowStates').updateOne(
        { workflowId },
        { 
          $push: { history: historyEntry },
          $set: { currentNode: historyEntry.nodeId }
        }
      );
    } catch (error: any ) {
      throw new Error(`Failed to add history entry: ${error.message}`);
    }
  }

  async updateVariables(
    workflowId: string, 
    variables: Record<string, any>
  ): Promise<void> {
    try {
      await this.db.collection('workflowStates').updateOne(
        { workflowId },
        { $set: { variables } }
      );
    } catch (error: any ) {
      throw new Error(`Failed to update variables: ${error.message}`);
    }
  }

  async initializeState(workflowId: string): Promise<WorkflowState> {
    const initialState: WorkflowState = {
      status: 'running',
      currentNode: null,
      variables: {},
      history: [],
      startedAt: new Date()
    };

    await this.saveState(workflowId, initialState);
    return initialState;
  }

  async deleteState(workflowId: string): Promise<void> {
    try {
      await this.db.collection('workflowStates').deleteOne({ workflowId });
    } catch (error: any ) {
      throw new Error(`Failed to delete workflow state: ${error.message}`);
    }
  }
} 