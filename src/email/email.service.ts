import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport(
    new SMTPTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }),
  );

  async sendRegistrationEmail(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `No Reply <${process.env.EMAIL_USER}>`,
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
      await this.transporter.sendMail({
        from: `No Reply <${process.env.EMAIL_USER}>`,
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
