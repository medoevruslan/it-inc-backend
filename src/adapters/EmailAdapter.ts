import nodemailer from 'nodemailer';
import { SETTINGS } from '../settings';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class EmailAdapter {
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'rus.terra.86@gmail.com',
        clientId: SETTINGS.GOOGLE.CLIENT_ID,
        clientSecret: SETTINGS.GOOGLE.CLIENT_SECRET,
        refreshToken: SETTINGS.GOOGLE.REFRESH_TOKEN,
      },
    });
  }

  public getTransporter() {
    return this.transporter;
  }

}