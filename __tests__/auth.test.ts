import { AuthService } from '../src/service/authService';
import { UserRepository } from '../src/repository/userRepository';
import { UserService } from '../src/service/userService';
import { EmailAdapter } from '../src/adapters/emailAdapter';
import { EmailManager } from '../src/managers/emailManager';
import { JwtService } from '../src/service/jwtService';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { db } from '../src/db/mongoDb';
import { user1 } from './datasets';
import { add } from 'date-fns';

jest.mock('../src/managers/emailManager')

jest.setTimeout(100000000)

describe('integration tests for auth', () => {

  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await db.run(uri)
  })

  afterAll(async () => {
    await db.close()
    await mongoServer.stop()
  })

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const userRepository = new UserRepository();
  const emailAdapter = new EmailAdapter();
  const userService = new UserService(userRepository);
  const emailManager = new EmailManager(emailAdapter);
  const jwtService = new JwtService();

  const authService = new AuthService(emailManager, userService, userRepository, jwtService);


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

      expect(result.data?.accountData.email).toBe(email)
      expect(result.data?.accountData.login).toBe(login)
      expect(result.data?.emailConfirmation.isConfirmed).toBe(false)
      expect(new Date(result.data?.emailConfirmation.expirationDate ?? 0).getTime()).toBeGreaterThan(Date.now());

      expect(emailManager.sendEmailConfirmation).toHaveBeenCalledTimes(1)
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

      expect(result.data).toBeNull()
      expect(result.extensions[0]).toEqual({ field: 'login', message: 'Login should be unique' })
      expect(emailManager.sendEmailConfirmation).toHaveBeenCalledTimes(0)
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

      expect(result.data).toBeNull()
      expect(result.extensions[0]).toEqual({ field: 'email', message: 'Email should be unique' })
      expect(emailManager.sendEmailConfirmation).toHaveBeenCalledTimes(0)
    });
  });
  describe('email confirmation', () => {
    it('should reject user because code expired', async () => {
      await db.seed({ users: [user1] })

      const result = await authService.registrationConfirm(user1.emailConfirmation.confirmationCode)

      expect(result.data).toBeFalsy();
      expect(result.errorMessage).toBe('Confirmation code has been expired')
    })
    it('should reject user because wrong code', async () => {
      const result = await authService.registrationConfirm('wrong code')

      expect(result.data).toBeFalsy();
      expect(result.errorMessage).toBe('User is not found')
    })
    it('should accept user code', async () => {
      await db.dropCollections()

      const userWithGoodCode = user1;
      userWithGoodCode.emailConfirmation.expirationDate = add(new Date(), { minutes: 10 })

      await db.seed({ users: [userWithGoodCode] })

      const result = await authService.registrationConfirm(user1.emailConfirmation.confirmationCode)
      const user = await db.getCollections().usersCollection.findOne({ _id: userWithGoodCode._id })

      expect(result.data).toBeTruthy();
      expect(user?.emailConfirmation.isConfirmed).toBeTruthy();
    })
  })
});