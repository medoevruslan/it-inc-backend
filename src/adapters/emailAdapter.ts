import nodemailer from 'nodemailer';
import { SETTINGS } from '../settings';

export const emailAdapter = {
  sendEmail: async (data: any) => {
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
      from: 'Rus terra <rus.terra.86@gmail.com>',
      to: 'medoev1986@gmail.com',
      subject: 'Hello ✔',
      html: '<b>Hello world?</b>', // HTML body})
    });

    // console.log('sendMailInfo::: ', sendMailInfo)

    return sendMailInfo;
  },
};