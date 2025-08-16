import { AuthService } from '../src/service/AuthService';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { db } from '../src/db/mongoDb';
import { user1 } from './datasets';
import { add } from 'date-fns';
import { addUser, req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { HttpStatuses } from '../src/shared/enums';
import { EmailManager } from '../src/managers/EmailManager';
import { UserRepository } from '../src/repository/UserRepository';
import { EmailAdapter } from '../src/adapters/EmailAdapter';
import { JwtService } from '../src/service/JwtService';
import { UserService } from '../src/service/UserService';
import { RefreshTokenBlockedRepository } from '../src/repository/RefreshTokenBlockedRepository';
import { DeviceAuthSessionsRepository } from '../src/repository/DeviceAuthSessionsRepository';
import { DeviceSessionsService } from '../src/service/DeviceSessionsService';

jest.mock('../src/managers/EmailManager', () => {
  const mock = {
    sendEmailConfirmation: jest.fn().mockResolvedValue({}),
    sendPasswordRecovery: jest.fn().mockResolvedValue({}),
  };
  return { EmailManager: jest.fn(() => mock) };
});

jest.setTimeout(100000000);

describe('integration tests for auth', () => {

  let mongoServer: MongoMemoryServer;
  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  let authService: AuthService;
  let emailManager: EmailManager;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await db.run(uri);
  });

  afterAll(async () => {
    await db.close();
    await mongoServer.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const userRepository = new UserRepository();
    const emailAdapter = new EmailAdapter();
    const userService = new UserService(userRepository);
    emailManager = new EmailManager(emailAdapter);
    const jwtService = new JwtService();
    const refreshTokenBlockedRepository = new RefreshTokenBlockedRepository();
    const deviceAuthSessionsRepository = new DeviceAuthSessionsRepository();
    const deviceSessionsService = new DeviceSessionsService(deviceAuthSessionsRepository);

    authService = new AuthService(emailManager, userService, userRepository, jwtService, refreshTokenBlockedRepository, deviceSessionsService);

  });

  describe('should create and return user', () => {
    it('should return created user', async () => {
      const login = 'some user';
      const email = 'medoev1986@gmail.com';
      const password = '12345';

      const result = await authService.register({
        login: login,
        email: email,
        password: password,
      });

      expect(result.data?.accountData.email).toBe(email);
      expect(result.data?.accountData.login).toBe(login);
      expect(result.data?.emailConfirmation.isConfirmed).toBe(false);
      expect(new Date(result.data?.emailConfirmation.expirationDate ?? 0).getTime()).toBeGreaterThan(Date.now());

      expect(emailManager.sendEmailConfirmation).toHaveBeenCalledTimes(1);
    });
    it('should return null because user with same name is registered', async () => {
      const login = 'some user';
      const email = 'medoev@gmail.com';
      const password = '12345';

      const result = await authService.register({
        login: login,
        email: email,
        password: password,
      });

      expect(result.data).toBeNull();
      expect(result.extensions[0]).toEqual({ field: 'login', message: 'Login should be unique' });
      expect(emailManager.sendEmailConfirmation).toHaveBeenCalledTimes(0);
    });
    it('should return null because user with same email is registered', async () => {
      const login = 'some';
      const email = 'medoev1986@gmail.com';
      const password = '12345';

      const result = await authService.register({
        login: login,
        email: email,
        password: password,
      });

      expect(result.data).toBeNull();
      expect(result.extensions[0]).toEqual({ field: 'email', message: 'Email should be unique' });
      expect(emailManager.sendEmailConfirmation).toHaveBeenCalledTimes(0);
    });
  });
  describe('email confirmation', () => {
    it('should reject user because code expired', async () => {
      await db.seed({ users: [user1] });

      const result = await authService.registrationConfirm(user1.emailConfirmation.confirmationCode);

      expect(result.data).toBeFalsy();
      expect(result.errorMessage).toBe('Confirmation code has been expired');
    });
    it('should reject user because wrong code', async () => {
      const result = await authService.registrationConfirm('wrong code');

      expect(result.data).toBeFalsy();
      expect(result.errorMessage).toBe('User is not found');
    });
    it('should accept user code', async () => {
      await db.dropCollections();

      const userWithGoodCode = user1;
      userWithGoodCode.emailConfirmation.expirationDate = add(new Date(), { minutes: 10 });

      await db.seed({ users: [userWithGoodCode] });

      const result = await authService.registrationConfirm(user1.emailConfirmation.confirmationCode);
      const user = await db.getCollections().usersCollection.findOne({ _id: userWithGoodCode._id });

      expect(result.data).toBeTruthy();
      expect(user?.emailConfirmation.isConfirmed).toBeTruthy();
    });
  });
  describe('resend email confirmation', () => {
    it('should reject user because email already is confirmed', async () => {
      await db.dropCollections();
      const userWithConfirmedEmail = user1;
      userWithConfirmedEmail.emailConfirmation.isConfirmed = true;
      await db.seed({ users: [userWithConfirmedEmail] });

      const result = await authService.resendRegistrationCode(userWithConfirmedEmail.accountData.email);

      expect(result.data).toBeNull();
      expect(result.errorMessage).toBe('Email is already confirmed');
    });
    it('should reject user because email is not correct format', async () => {
      const result = await authService.resendRegistrationCode('corrupted.email.com');

      expect(result.data).toBeNull();
      expect(result.errorMessage).toBe('Bad email format');
    });
    it('should resend email', async () => {
      await db.dropCollections();
      await db.seed({ users: [user1] });

      const result = await authService.resendRegistrationCode(user1.accountData.email);

      expect(emailManager.sendEmailConfirmation).toHaveBeenCalledTimes(1);
      expect(emailManager.sendEmailConfirmation).toHaveBeenCalledWith({
        email: user1.accountData.email,
        verificationCode: expect.any(String),
      });
      expect(result.data).toBeTruthy();
    });

  });
  describe('recovery password', () => {
    it('should send code to users email with recovery code', async () => {
      await db.dropCollections();
      await db.seed({ users: [user1] });

      const resultRecovery = await authService.recoverPassword(user1.accountData.email);

      expect(resultRecovery.data).toBe(true);
      expect(emailManager.sendPasswordRecovery).toHaveBeenCalledTimes(1);
      expect(emailManager.sendPasswordRecovery).toHaveBeenCalledWith({
        email: user1.accountData.email,
        recoveryCode: expect.any(String),
      });
    });
  });
  describe('set new password', () => {
    it('should set new password', async () => {
      await db.dropCollections();
      await db.seed({ users: [user1] });

      const resultRecovery = await authService.recoverPassword(user1.accountData.email);

      expect(resultRecovery.data).toBe(true);
      expect(emailManager.sendPasswordRecovery).toHaveBeenCalledTimes(1);
      expect(emailManager.sendPasswordRecovery).toHaveBeenCalledWith({
        email: user1.accountData.email,
        recoveryCode: expect.any(String),
      });

      const users1 = await db.getCollections().usersCollection.find({}).toArray();

      const recoveryCode = users1[0].passwordRecovery?.recoveryCode;

      expect(recoveryCode).toBeTruthy();

      const resultNewPassword = await authService.newPassword('new_password', recoveryCode!);

      expect(resultNewPassword.data).toBe(true);

      const users2 = await db.getCollections().usersCollection.find({}).toArray();
      expect(users2[0].passwordRecovery).toBeFalsy();
    });

    it('should not set new password because wrong recovery code', async () => {
      await db.dropCollections();
      await db.seed({ users: [user1] });

      const resultRecovery = await authService.recoverPassword(user1.accountData.email);

      expect(resultRecovery.data).toBe(true);
      expect(emailManager.sendPasswordRecovery).toHaveBeenCalledTimes(1);
      expect(emailManager.sendPasswordRecovery).toHaveBeenCalledWith({
        email: user1.accountData.email,
        recoveryCode: expect.any(String),
      });

      const users1 = await db.getCollections().usersCollection.find({}).toArray();

      const recoveryCode = users1[0].passwordRecovery?.recoveryCode;

      expect(recoveryCode).toBeTruthy();

      const resultNewPassword = await authService.newPassword('new_password', 'wrong code');

      expect(resultNewPassword.data).toBe(false);
      expect(resultNewPassword.extensions[0]).toEqual({ field: 'code', message: 'Code is incorrect' });

    });

    it('should not set new password because expired code', async () => {
      await db.dropCollections();
      const user ={
        ...user1,
        passwordRecovery: { recoveryCode: 'some_code', expirationDate: add(new Date(), { minutes: -1 }) },
      }
      await db.seed({
        users: [user],
      });

      const resultNewPassword = await authService.newPassword('new_password', user.passwordRecovery.recoveryCode);

      expect(resultNewPassword.data).toBe(false);
      expect(resultNewPassword.extensions[0]).toEqual({ field: 'code', message: 'Recovery code has expired' });
    });

  });
  describe('logout', () => {
    it('add refresh token to black list on logout', async () => {
      const tokens1 = await db.getCollections().refreshTokensBlockedCollection.find().toArray();

      expect(tokens1.length).toBe(0);

      const user = await addUser(codedAuth);

      const loginResponse = await req.post(`${SETTINGS.PATH.AUTH}/login`).send({
        loginOrEmail: user.login,
        password: user.password,
      }).expect(HttpStatuses.Success);

      const cookies = loginResponse.header['set-cookie'][0].split(';')[0];

      await req.post(`${SETTINGS.PATH.AUTH}/logout`).set('Cookie', cookies).expect(204);

      const tokens2 = await db.getCollections().refreshTokensBlockedCollection.find().toArray();

      expect(tokens2.length).toBe(1);
    });
  });
  describe('refresh token', () => {
    it('should refresh token', async () => {
      const user = await addUser(codedAuth);

      const loginResponse = await req.post(`${SETTINGS.PATH.AUTH}/login`).send({
        loginOrEmail: user.login,
        password: user.password,
      }).expect(HttpStatuses.Success);


      await new Promise(res => setTimeout(res, 1000)); // make some delay to issue diff access token on refresh-token endpoint
      const cookies = loginResponse.header['set-cookie'][0].split(';')[0];
      const refreshResponse = await req.post(`${SETTINGS.PATH.AUTH}/refresh-token`).set('Cookie', cookies).expect(200);


      expect(refreshResponse.body.accessToken).toBeDefined();
      expect(refreshResponse.body.accessToken).not.toEqual(loginResponse.body.accessToken);

    });
    it('should not refresh token because it is in black list', async () => {
      const user = await addUser(codedAuth);

      const loginResponse = await req.post(`${SETTINGS.PATH.AUTH}/login`).send({
        loginOrEmail: user.login,
        password: user.password,
      }).expect(HttpStatuses.Success);

      const cookies = loginResponse.header['set-cookie'][0].split(';')[0];

      await new Promise(res => setTimeout(res, 1000)); // make some delay to issue diff access token on refresh-token endpoint

      await req.post(`${SETTINGS.PATH.AUTH}/logout`).set('Authorization', `Bearer ${loginResponse.body.accessToken}`).set('Cookie', cookies).expect(HttpStatuses.NoContent);

      const refreshResponse = await req.post(`${SETTINGS.PATH.AUTH}/refresh-token`).set('Cookie', cookies).expect(HttpStatuses.Unauthorized);

      expect(refreshResponse.body.accessToken,
      ).not.toBeDefined();
    });
  });
});