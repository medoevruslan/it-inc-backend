import { JwtService } from './service/jwtService';
import { EmailAdapter } from './adapters/emailAdapter';
import { UserRepository } from './repository/userRepository';
import { UserService } from './service/userService';
import { AuthService } from './service/authService';
import { EmailManager } from './managers/emailManager';

const userRepository = new UserRepository();
const emailAdapter = new EmailAdapter();
const emailManager = new EmailManager(emailAdapter)

export const userService = new UserService(userRepository)
export const jwtService = new JwtService();


export const authService = new AuthService(emailManager, userService, userRepository, jwtService)