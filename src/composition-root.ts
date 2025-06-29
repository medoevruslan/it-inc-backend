import { JwtService } from './service/jwtService';
import { EmailAdapter } from './adapters/emailAdapter';
import { UserRepository } from './repository/userRepository';
import { UserService } from './service/userService';
import { AuthService } from './service/authService';
import { EmailManager } from './managers/emailManager';
import { RefreshTokenBlockedRepository } from './repository/refreshTokenBlockedRepository';
import { DeviceAuthSessionsRepository } from './repository/deviceAuthSessionsRepository';

const userRepository = new UserRepository();
const emailAdapter = new EmailAdapter();
const emailManager = new EmailManager(emailAdapter)

export const userService = new UserService(userRepository)
export const jwtService = new JwtService();

const refreshTokensBlockedRepository = new RefreshTokenBlockedRepository()
const deviceAuthSessionsRepository = new DeviceAuthSessionsRepository()


export const authService = new AuthService(emailManager, userService, userRepository, jwtService, refreshTokensBlockedRepository, deviceAuthSessionsRepository)