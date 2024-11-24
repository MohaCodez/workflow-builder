interface WorkflowContext {
  trigger: any;
  formData: Record<string, any>;
  variables: Record<string, any>;
  history: Array<{
    nodeId: string;
    status: 'success' | 'failure';
    timestamp: number;
    output: any;
  }>;
}

export class VariableResolver {
  resolve(template: string, context: WorkflowContext): string {
    if (!template) return '';
    
    return template.replace(/\{\{(.*?)\}\}/g, (match, path) => {
      const value = this.getValueByPath(context, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      if (acc === undefined) return undefined;
      return acc[part];
    }, obj);
  }
} 