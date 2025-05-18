import { AuthService } from '../src/service/authService';
import { UserRepository } from '../src/repository/userRepository';
import { UserService } from '../src/service/userService';
import { EmailAdapter } from '../src/adapters/emailAdapter';
import { EmailManager } from '../src/managers/emailManager';

describe('integration tests for auth', () => {


  const userRepository = new UserRepository();
  const emailAdapter = new EmailAdapter();
  const userService = new UserService(userRepository);
  const emailManager = new EmailManager(emailAdapter);

  const authService = new AuthService(emailManager, userService, userRepository);


  describe('should create and return user', () => {
    it('should return user created user', async () => {
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
      expect(result.data?.accountData.password).toBe(password)
    });
  });
});