export type UserAccountDbType = {
  accountData: UserAccount
  emailConfirmation: EmailConfirmation
};

type UserAccount = {
  login: string;
  password: string;
  email: string;
  createdAt: Date;
}

type EmailConfirmation = {
  isConfirmed: boolean;
  confirmationCode: string;
  expirationDate: Date;
  sentMail: SentEmail
}

type SentEmail = {
  sentDate: Date;
}

type RegistrationData = {
  id: string;
}