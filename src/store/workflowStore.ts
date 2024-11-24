import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Workflow } from '../types/workflow';
import { saveWorkflow, getWorkflows } from '../lib/firebase/workflows';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  loading: boolean;
  setWorkflows: (workflows: Workflow[]) => void;
  addWorkflow: (workflow: Partial<Workflow>) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  loadWorkflows: () => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  loading: false,

  setWorkflows: (workflows) => set({ workflows }),
  
  addWorkflow: async (workflow) => {
    const newWorkflow: Workflow = {
      id: nanoid(),
      name: workflow.name || 'New Workflow',
      description: workflow.description || '',
      trigger: workflow.trigger || {
        id: nanoid(),
        type: 'event',
        name: 'Default Trigger',
        enabled: false,
        config: {},
      },
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      status: 'draft',
    };

    await saveWorkflow(newWorkflow);
    set((state) => ({ workflows: [...state.workflows, newWorkflow] }));
  },

  updateWorkflow: async (id, updates) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (!workflow) return;

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updatedAt: Date.now(),
      version: workflow.version + 1,
    };

    await saveWorkflow(updatedWorkflow);
    set((state) => ({
      workflows: state.workflows.map((w) => (w.id === id ? updatedWorkflow : w)),
    }));
  },

  deleteWorkflow: (id) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    }));
  },

  duplicateWorkflow: (id) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (!workflow) return;

    const duplicate: Workflow = {
      ...workflow,
      id: nanoid(),
      name: `${workflow.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      status: 'draft',
    };

    set((state) => ({ workflows: [...state.workflows, duplicate] }));
  },

  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

  loadWorkflows: async () => {
    set({ loading: true });
    try {
      const workflows = await getWorkflows();
      set({ workflows, loading: false });
    } catch (error) {
      console.error('Failed to load workflows:', error);
      set({ loading: false });
    }
  },
}));