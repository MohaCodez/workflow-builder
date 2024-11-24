import { Workflow } from '../../types/workflow';
import * as cron from 'node-cron';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { EmailService } from './email';

// Add this interface before the other service interfaces
interface IntegrationService {
  email: EmailService;
  slack: SlackService;
  teams: TeamsService;
  sms: SMSService;
  webhook: WebhookService;
}

// Service interfaces
interface SlackService {
  send(channel: string, message: string): Promise<void>;
}

interface TeamsService {
  send(channel: string, message: string): Promise<void>;
}

interface SMSService {
  send(to: string, message: string): Promise<void>;
}

interface WebhookService {
  send(url: string, payload: any): Promise<void>;
}

// Service implementations
class SlackServiceImpl implements SlackService {
  async send(channel: string, message: string): Promise<void> {
    try {
      // Implementation would use Slack's Web API
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SLACK_TOKEN}`,
        },
        body: JSON.stringify({
          channel,
          text: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send Slack message');
      }
    } catch (error) {
      console.error('Slack integration error:', error);
      throw error;
    }
  }
}

class TeamsServiceImpl implements TeamsService {
  async send(channel: string, message: string): Promise<void> {
    try {
      // Implementation would use Microsoft Teams webhook
      const response = await fetch(process.env.TEAMS_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send Teams message');
      }
    } catch (error) {
      console.error('Teams integration error:', error);
      throw error;
    }
  }
}

class SMSServiceImpl implements SMSService {
  async send(to: string, message: string): Promise<void> {
    try {
      // Implementation would use a service like Twilio
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber || '',
          Body: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS integration error:', error);
      throw error;
    }
  }
}

class WebhookServiceImpl implements WebhookService {
  async send(url: string, payload: any): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send webhook');
      }
    } catch (error) {
      console.error('Webhook integration error:', error);
      throw error;
    }
  }
}

// Integration service factory
export class IntegrationServiceFactory {
  static create(): IntegrationService {
    return {
      email: new EmailService(),
      slack: new SlackServiceImpl(),
      teams: new TeamsServiceImpl(),
      sms: new SMSServiceImpl(),
      webhook: new WebhookServiceImpl(),
    };
  }
}

export class TriggerManager {
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private integrationService: IntegrationService;

  constructor() {
    this.integrationService = IntegrationServiceFactory.create();
  }

  setupTrigger(workflow: Workflow) {
    // Clean up existing trigger if any
    this.cleanupTrigger(workflow.id);

    if (!workflow.trigger.enabled) {
      return;
    }

    switch (workflow.trigger.type) {
      case 'time':
        this.setupCronTrigger(workflow);
        break;
      case 'event':
        this.setupEventTrigger(workflow);
        break;
      case 'webhook':
        this.setupWebhookTrigger(workflow);
        break;
    }
  }

  private cleanupTrigger(workflowId: string) {
    const existingJob = this.cronJobs.get(workflowId);
    if (existingJob) {
      existingJob.stop();
      this.cronJobs.delete(workflowId);
    }
  }

  private setupCronTrigger(workflow: Workflow) {
    const schedule = workflow.trigger.config.schedule;
    if (!schedule) return;

    try {
      const job = cron.schedule(schedule, async () => {
        await this.executeTrigger(workflow, { type: 'cron', timestamp: new Date() });
      });

      this.cronJobs.set(workflow.id, job);
    } catch (error) {
      console.error(`Failed to setup cron trigger for workflow ${workflow.id}:`, error);
    }
  }

  private async setupEventTrigger(workflow: Workflow) {
    const eventType = workflow.trigger.config.eventType;
    if (!eventType) return;

    // Store event subscription in Firestore
    try {
      const eventSubscriptionsRef = collection(db, 'eventSubscriptions');
      await setDoc(doc(eventSubscriptionsRef, workflow.id), {
        workflowId: workflow.id,
        eventType,
        conditions: workflow.trigger.config.conditions || [],
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Failed to setup event trigger for workflow ${workflow.id}:`, error);
    }
  }

  private async setupWebhookTrigger(workflow: Workflow) {
    const webhookUrl = workflow.trigger.config.webhookUrl;
    if (!webhookUrl) return;

    // Store webhook configuration in Firestore
    try {
      const webhooksRef = collection(db, 'webhooks');
      await setDoc(doc(webhooksRef, workflow.id), {
        workflowId: workflow.id,
        url: webhookUrl,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Failed to setup webhook trigger for workflow ${workflow.id}:`, error);
    }
  }

  private async executeTrigger(workflow: Workflow, triggerData: any) {
    try {
      // Store trigger execution in Firestore
      const executionsRef = collection(db, 'workflowExecutions');
      await addDoc(executionsRef, {
        workflowId: workflow.id,
        triggerType: workflow.trigger.type,
        triggerData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Failed to execute trigger for workflow ${workflow.id}:`, error);
    }
  }

  // Cleanup method for when workflows are deleted or disabled
  cleanup(workflowId: string) {
    this.cleanupTrigger(workflowId);
  }
}

export type { IntegrationService, SlackService, TeamsService, SMSService, WebhookService }; 