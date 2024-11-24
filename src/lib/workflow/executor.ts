import { Node } from 'reactflow';
import { EmailService } from '../integrations/email';
import { NotificationService } from '../integrations/notification';
import { VariableResolver } from './variables';

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

interface ExecutionResult {
  success: boolean;
  output: any;
  nextNodes?: string[];
}

export class WorkflowExecutor {
  private emailService: EmailService;
  private notificationService: NotificationService;
  private variableResolver: VariableResolver;

  constructor() {
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
    this.variableResolver = new VariableResolver();
  }

  async executeWorkflow(nodes: Node[], startNodeId: string, context: WorkflowContext): Promise<WorkflowContext> {
    let currentNodeId = startNodeId;
    
    while (currentNodeId) {
      const currentNode = nodes.find(node => node.id === currentNodeId);
      if (!currentNode) break;

      try {
        const result = await this.executeNode(currentNode, context);
        
        // Add to execution history
        context.history.push({
          nodeId: currentNodeId,
          status: result.success ? 'success' : 'failure',
          timestamp: Date.now(),
          output: result.output
        });

        // Update context variables with output
        context.variables = {
          ...context.variables,
          [currentNodeId]: result.output
        };
        // Determine next node
        currentNodeId = result.nextNodes?.[0] || '';
        
      } catch (error) {
        context.history.push({
          nodeId: currentNodeId,
          status: 'failure',
          timestamp: Date.now(),
          output: (error as Error).message
        });
        throw error;
      }
    }

    return context;
  }

  async executeNode(node: Node, context: WorkflowContext): Promise<ExecutionResult> {
    switch (node.type) {
      case 'form':
        return this.executeFormNode(node, context);
      case 'email':
        return this.executeEmailNode(node, context);
      case 'approval':
        return this.executeApprovalNode(node, context);
      case 'condition':
        return this.executeConditionNode(node, context);
      case 'notification':
        return this.executeNotificationNode(node, context);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private async executeFormNode(node: Node, context: WorkflowContext): Promise<ExecutionResult> {
    // Form nodes don't need execution as they're input nodes
    // Their data should already be in context.formData
    const formData = context.formData[node.id] || {};
    
    return {
      success: true,
      output: formData
    };
  }

  private async executeEmailNode(node: Node, context: WorkflowContext): Promise<ExecutionResult> {
    const { to, subject, body } = node.data;
    
    // Resolve variables in the email content
    const resolvedTo = this.variableResolver.resolve(to, context);
    const resolvedSubject = this.variableResolver.resolve(subject, context);
    const resolvedBody = this.variableResolver.resolve(body, context);

    await this.emailService.send(resolvedTo, resolvedSubject, resolvedBody);

    return {
      success: true,
      output: {
        to: resolvedTo,
        subject: resolvedSubject,
        sentAt: new Date().toISOString()
      }
    };
  }

  private async executeApprovalNode(node: Node, context: WorkflowContext): Promise<ExecutionResult> {
    const { approver, message } = node.data;
    
    // In a real implementation, this would create an approval task
    // and wait for the response. For now, we'll auto-approve
    const approvalResult = {
      approved: true,
      approvedBy: approver,
      approvedAt: new Date().toISOString(),
      comments: "Auto-approved for demo"
    };

    return {
      success: true,
      output: approvalResult
    };
  }

  private async executeConditionNode(node: Node, context: WorkflowContext): Promise<ExecutionResult> {
    const { field, operator, value } = node.data;
    
    // Resolve the field value from context
    const actualValue = this.variableResolver.resolve(`{{${field}}}`, context);
    
    let result = false;
    switch (operator) {
      case '==':
        result = actualValue == value;
        break;
      case '!=':
        result = actualValue != value;
        break;
      case '>':
        result = actualValue > value;
        break;
      case '<':
        result = actualValue < value;
        break;
      case '>=':
        result = actualValue >= value;
        break;
      case '<=':
        result = actualValue <= value;
        break;
    }

    return {
      success: true,
      output: { result },
      nextNodes: result ? ['true'] : ['false']
    };
  }

  private async executeNotificationNode(node: Node, context: WorkflowContext): Promise<ExecutionResult> {
    const { channel, recipient, message } = node.data;
    
    const resolvedRecipient = this.variableResolver.resolve(recipient, context);
    const resolvedMessage = this.variableResolver.resolve(message, context);

    await this.notificationService.send(channel, resolvedRecipient, resolvedMessage);

    return {
      success: true,
      output: {
        channel,
        recipient: resolvedRecipient,
        sentAt: new Date().toISOString()
      }
    };
  }
} 