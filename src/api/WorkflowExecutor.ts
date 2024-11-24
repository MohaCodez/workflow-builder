interface WorkflowStep {
  id: string;
  type: 'http' | 'function' | 'condition';
  config: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    condition?: string;
    function?: string;
  };
}

interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

export default class WorkflowExecutor {
  private workflows: Map<string, Workflow> = new Map([
    ['workflow1', {
      id: 'workflow1',
      name: 'Sample Workflow',
      steps: [
        {
          id: 'step1',
          type: 'http',
          config: {
            url: 'https://api.example.com/data',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        },
        {
          id: 'step2',
          type: 'condition',
          config: {
            condition: 'result.status === 200'
          }
        },
        {
          id: 'step3',
          type: 'function',
          config: {
            function: 'return { processed: true, data: result.data };'
          }
        }
      ]
    }]
  ]);

  async execute(id: string, trigger: any) {
    try {
      if (!id) {
        throw new Error('Workflow ID is required');
      }

      const workflow = await this.getWorkflow(id);
      if (!workflow) {
        throw new Error(`Workflow ${id} not found`);
      }

      const result = await this.executeSteps(workflow, trigger);

      return {
        success: true,
        workflowId: id,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async getWorkflow(id: string): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  private async executeSteps(workflow: Workflow, trigger: any) {
    let context = { trigger, result: null };

    for (const step of workflow.steps) {
      try {
        context.result = await this.executeStep(step, context);
      } catch (error) {
        throw new Error(`Error executing step ${step.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return context.result;
  }

  private async executeStep(step: WorkflowStep, context: { trigger: any; result: any }): Promise<any> {
    switch (step.type) {
      case 'http':
        return this.executeHttpStep(step.config, context);
      case 'condition':
        return this.executeConditionStep(step.config, context);
      case 'function':
        return this.executeFunctionStep(step.config, context);
      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }
  }

  private async executeHttpStep(config: WorkflowStep['config'], context: any) {
    if (!config.url) throw new Error('URL is required for HTTP step');
    
    const response = await fetch(config.url, {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined
    });

    return await response.json();
  }

  private executeConditionStep(config: WorkflowStep['config'], context: any) {
    if (!config.condition) throw new Error('Condition is required for condition step');
    
    // Using Function constructor to evaluate condition in context
    const conditionFn = new Function('result', 'trigger', `return ${config.condition}`);
    const passes = conditionFn(context.result, context.trigger);
    
    if (!passes) {
      throw new Error('Condition failed, stopping workflow execution');
    }
    
    return context.result;
  }

  private executeFunctionStep(config: WorkflowStep['config'], context: any) {
    if (!config.function) throw new Error('Function body is required for function step');
    
    // Using Function constructor to execute custom function in context
    const fn = new Function('result', 'trigger', config.function);
    return fn(context.result, context.trigger);
  }
} 