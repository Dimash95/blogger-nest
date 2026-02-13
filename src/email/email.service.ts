import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendRegistrationEmail(email: string, code: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Registration',
        html: `<h1>Thank for your registration</h1>
          <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
          </p>`,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  async sendPasswordRecovery(email: string, code: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
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
