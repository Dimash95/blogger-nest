import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly apiKey = process.env.BREVO_API_KEY!;
  private readonly fromEmail = process.env.BREVO_FROM_EMAIL!;

  private async send(to: string, subject: string, html: string): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: this.fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo error: ${error}`);
    }
  }

  async sendRegistrationEmail(email: string, code: string): Promise<void> {
    try {
      await this.send(
        email,
        'Registration',
        `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
          <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
        </p>`,
      );
      console.log(`✅ Email sent to ${email}`);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  async sendPasswordRecovery(email: string, code: string): Promise<void> {
    try {
      await this.send(
        email,
        'Recovery Password',
        `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`,
      );
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
}
