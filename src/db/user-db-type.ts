export type UserDbType = UserType;

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
  // sentMail: SentEmail[]
}

type PasswordRecovery = {
  recoveryCode: string
  expirationDate: Date;
}


export type UserType = {
  accountData: UserAccount
  emailConfirmation: EmailConfirmation
  passwordRecovery?: PasswordRecovery
}

type SentEmail = {
  sentDate: Date;
}

type RegistrationData = {
  id: string;
}



