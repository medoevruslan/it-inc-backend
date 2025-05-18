import { BASE_URL } from '../settings';
import { EmailAdapter } from '../adapters/emailAdapter';


export class EmailManager {

  constructor(protected emailAdapter: EmailAdapter) {}

  async sendEmailConfirmation(userData: { email: string, verificationCode: string }) {
    const transporter = this.emailAdapter.getTransporter()

    const sendMailInfo = await transporter.sendMail({
      from: 'Blog service <rus.terra.86@gmail.com>',
      to: userData.email,
      subject: 'Email verification',
      html: `<b>Please verify your email by clicking the <a href=http://localhost:3000${BASE_URL}?code=${userData.verificationCode}>link</a></b>`,
    });

    return sendMailInfo;
  }
}