export interface WorkflowContext {
  workflowId: string;
  stepId: string;
  attempt: number;
  maxRetries: number;
}

export class WorkflowError extends Error {
  constructor(
    message: string,
    public nodeId: string,
    public retryCount: number = 0,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

export class RetryManager {
  private readonly baseDelay = 1000; // 1 second
  private readonly maxDelay = 30000; // 30 seconds

  async handleError(error: WorkflowError, context: WorkflowContext): Promise<boolean> {
    if (!error.retryable || context.attempt >= context.maxRetries) {
      return false;
    }

    // Calculate delay with exponential backoff: 2^attempt * baseDelay
    const delay = Math.min(
      this.baseDelay * Math.pow(2, context.attempt),
      this.maxDelay
    );

    // Add some jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    
    await new Promise(resolve => setTimeout(resolve, delay + jitter));
    
    error.retryCount++;
    return true;
  }
} 