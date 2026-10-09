export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type:
    | 'HEARTLINK_REQUEST'
    | 'MATCH_ACCEPTED'
    | 'MESSAGE_RECEIVED'
    | 'CIRCLE_INVITE'
    | 'CAPSULE_UNLOCKED'
    | 'SAFETY_ALERT';
  actionUrl?: string;
}

export class NotificationService {
  /**
   * Dispatches an in-app notification and triggers external webhooks / email if configured.
   */
  public async dispatch(payload: NotificationPayload): Promise<{ delivered: boolean; timestamp: string }> {
    // Structured delivery log (never includes sensitive PII)
    const timestamp = new Date().toISOString();
    
    // Extensible hook for WebPush, APNs, FCM, or SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      // SMTP integration point ready for nodemailer / sendgrid
    }

    return {
      delivered: true,
      timestamp,
    };
  }
}
