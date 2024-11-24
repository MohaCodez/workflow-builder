export interface EmailTemplate {
  id: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface EmailRecord {
  to: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  attempts: number;
  error?: string;
  sentAt?: string;
} 