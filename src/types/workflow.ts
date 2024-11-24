export interface Trigger {
  id: string;
  type: 'time' | 'event' | 'webhook';
  name: string;
  enabled: boolean;
  config: {
    schedule?: string;
    eventType?: string;
    webhookUrl?: string;
    conditions?: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: Trigger;
  nodes: any[];
  edges: any[];
  createdAt: number;
  updatedAt: number;
  version: number;
  status: 'active' | 'draft' | 'archived';
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  data: Workflow;
  createdAt: number;
  createdBy: string;
}