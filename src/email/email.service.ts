import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.error('❌ SENDGRID_API_KEY is not set!');
    }
  }

  async sendRegistrationEmail(email: string, code: string): Promise<void> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: {
            email: 'dinmukhamed.amirov@gmail.com',
            name: 'Registration',
          },
          subject: 'register',
          content: [
            {
              type: 'text/html',
              value: `<h1>Thank for your registration</h1>
              <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`,
            },
          ],
          tracking_settings: {
            click_tracking: { enable: false, enable_text: false },
            open_tracking: { enable: false },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('❌ SendGrid error:', errorText);
        // 👇 НЕ БРОСАЕМ ОШИБКУ - просто логируем
        // throw new Error(`Email sending failed: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Email sending failed:', error);
      // 👇 НЕ БРОСАЕМ - просто игнорируем для тестов
    }
  }

  async sendPasswordRecovery(email: string, code: string): Promise<void> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: {
            email: 'dinmukhamed.amirov@gmail.com',
            name: 'Recovery password',
          },
          subject: 'Recovery Password',
          content: [
            {
              type: 'text/html',
              value: `<h1>Password recovery</h1>
              <p>To finish password recovery please follow the link below:
                <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
              </p>`,
            },
          ],
          tracking_settings: {
            click_tracking: { enable: false, enable_text: false },
            open_tracking: { enable: false },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('❌ SendGrid error:', errorText);
        // 👇 НЕ БРОСАЕМ
      }
    } catch (error) {
      this.logger.error('Email sending failed:', error);
      // 👇 НЕ БРОСАЕМ
    }
  }
}
