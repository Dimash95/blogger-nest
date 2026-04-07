import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendRegistrationEmail(email: string, code: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Registration',
        html: `<h1>Thank for your registration</h1>
          <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
          </p>`,
      });
      console.log(`✅ Email sent to ${email}`);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  async sendPasswordRecovery(email: string, code: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Recovery Password',
        html: `<h1>Password recovery</h1>
          <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
          </p>`,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
}
