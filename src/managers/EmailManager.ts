import { EmailAdapter } from '../adapters/EmailAdapter';
import { inject } from 'inversify';

export class EmailManager {

  constructor(@inject(EmailAdapter) protected emailAdapter: EmailAdapter) {
  }

  async sendEmailConfirmation(userData: { email: string, verificationCode: string }) {
    const transporter = this.emailAdapter.getTransporter();

    const sendMailInfo = await transporter.sendMail({
      from: 'Blog service <rus.terra.86@gmail.com>',
      to: userData.email,
      subject: 'Email verification',
      html: `<h1>Thank for your registration</h1>
              <p>To finish registration please follow the link below:
              <a href='https://somesite.com/confirm-email?code=${userData.verificationCode}'>complete registration</a>
              </p>`,
    });

    return sendMailInfo;
  }

  async sendPasswordRecovery(userData: { email: string, recoveryCode: string }) {
    const transporter = this.emailAdapter.getTransporter();

    const sendMailInfo = await transporter.sendMail({
      from: 'Blog service <rus.terra.86@gmail.com>',
      to: userData.email,
      subject: 'Password recovery',
      html: `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${userData.recoveryCode}'>recovery password</a>
      </p>`,
    });

    return sendMailInfo;
  }
}