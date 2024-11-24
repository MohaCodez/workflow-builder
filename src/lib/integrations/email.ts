import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { EmailTemplate } from '../../types/email';

export class EmailService {
  private readonly emailsCollection = 'emails';

  async send(to: string, subject: string, body: string): Promise<void> {
    try {
      // Store the email in Firestore for processing by Cloud Function
      await addDoc(collection(db, this.emailsCollection), {
        to,
        subject,
        body,
        status: 'pending',
        createdAt: new Date().toISOString(),
        attempts: 0
      });
    } catch (error) {
      console.error('Failed to queue email:', error);
      throw new Error('Failed to send email');
    }
  }

  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    // Add template fetching logic if needed
    return null;
  }
} 