import { WithId } from 'mongodb';

export type UserDbType = UserType;

type UserAccount = {
  login: string;
  password: string;
  email: string;
}

type EmailConfirmation = {
  isConfirmed: boolean;
  confirmationCode: string;
  expirationDate: Date;
  // sentMail: SentEmail[]
}

type SentEmail = {
  sentDate: Date;
}

export type UserType = {
  accountData: UserAccount
  emailConfirmation: EmailConfirmation
  createdAt: Date;
}

type RegistrationData = {
  id: string;
}