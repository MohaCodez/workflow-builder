import axios from 'axios';
import { WebClient } from '@slack/web-api';
import nodemailer from 'nodemailer';

/**
 * Service for handling notification delivery across different channels
 */
export class NotificationService {
  private slackClient: WebClient;
  private emailTransporter: nodemailer.Transporter;
  private teamsWebhookUrl: string;

  constructor() {
    // Initialize Slack client
    this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Initialize Teams webhook URL
    this.teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL || '';
  }

  /**
   * Sends a notification through the specified channel
   * @param channel - The notification channel ('slack', 'teams', 'email', 'sms')
   * @param recipient - The recipient identifier (email, phone number, channel ID)
   * @param message - The message content to be sent
   * @throws Error if the channel is not supported or if sending fails
   */
  async send(channel: string, recipient: string, message: string): Promise<void> {
    switch (channel.toLowerCase()) {
      case 'slack':
        await this.sendSlackMessage(recipient, message);
        break;
      case 'teams':
        await this.sendTeamsMessage(message);
        break;
      case 'email':
        await this.sendEmail(recipient, message);
        break;
      case 'sms':
        await this.sendSMS(recipient, message);
        break;
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }

  private async sendSlackMessage(channelId: string, message: string): Promise<void> {
    try {
      await this.slackClient.chat.postMessage({
        channel: channelId,
        text: message,
      });
    } catch (error: any) {
      throw new Error(`Failed to send Slack message: ${error.message}`);
    }
  }

  private async sendTeamsMessage(message: string): Promise<void> {
    try {
      await axios.post(this.teamsWebhookUrl, {
        text: message,
      });
    } catch (error: any) {
      throw new Error(`Failed to send Teams message: ${error.message}`);
    }
  }

  private async sendEmail(recipient: string, message: string): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM_ADDRESS,
        to: recipient,
        subject: 'Notification',
        text: message,
      });
    } catch (error: any) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  private async sendSMS(phoneNumber: string, message: string): Promise<void> {
    // This is a placeholder for SMS implementation
    // You would typically integrate with a service like Twilio here
    try {
      // Example with Twilio (you'd need to add twilio package and configuration)
      // const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await twilioClient.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber
      // });
      console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    } catch (error: any) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
} 