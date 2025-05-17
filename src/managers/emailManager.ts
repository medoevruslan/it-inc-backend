import nodemailer from 'nodemailer';
import { BASE_URL, SETTINGS } from '../settings';


export const emailManager = {
  async sendEmailConfirmation(userData: { email: string, verificationCode: string }) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'rus.terra.86@gmail.com',
        clientId: SETTINGS.GOOGLE.CLIENT_ID,
        clientSecret: SETTINGS.GOOGLE.CLIENT_SECRET,
        refreshToken: SETTINGS.GOOGLE.REFRESH_TOKEN,
      },
    });


    const sendMailInfo = await transporter.sendMail({
      from: 'Blog service <rus.terra.86@gmail.com>',
      to: userData.email,
      subject: 'Email verification',
      html: `<b>Please verify your email by clicking the <a href=http://localhost:3000${BASE_URL}?code=${userData.verificationCode}>link</a></b>`,
    });

    return sendMailInfo;
  }
}