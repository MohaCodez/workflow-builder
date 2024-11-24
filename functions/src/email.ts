import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

interface EmailRecord {
  to: string;
  subject: string;
  body: string;
  status?: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  error?: string;
  attempts?: number;
}

const SENDGRID_API_KEY = functions.config().sendgrid.key;
sgMail.setApiKey(SENDGRID_API_KEY);

export const processEmails = functions.firestore
  .onDocumentCreated('emails/{emailId}', async (event) => {
    const email = event.data?.data() as EmailRecord;
    const emailRef = event.data?.ref;

    if (!emailRef) {
      throw new Error('Email reference is undefined');
    }

    try {
      await sgMail.send({
        to: email.to,
        from: 'your-verified-sender@yourdomain.com',
        subject: email.subject,
        html: email.body,
      });

      await emailRef.update({
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending email:', error);
      
      await emailRef.update({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts: admin.firestore.FieldValue.increment(1),
      });

      throw error;
    }
  }); 