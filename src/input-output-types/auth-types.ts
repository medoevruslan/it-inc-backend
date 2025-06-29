export type InputLoginType = { loginOrEmail: string; password: string };

export type LoginServiceInput = {
ip?: string,
userAgent?: string
} & InputLoginType

export type InputRegistrationType = { login: string, email: string, password: string }
