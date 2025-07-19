import { Router } from 'express';
import { authController } from './authController';
import { accessTokenGuard } from '../middlewares/guard';
import { userBodyValidator } from '../validation/userBodyValidator';
import { validationErrorMiddleware } from '../middlewares';
import { loginBodyValidator } from '../validation/loginBodyValidator';
import { refreshTokenGuard } from '../middlewares/guard/refreshTokenGuard';
import { rateLimitApiGuard } from '../middlewares/guard/rateLimitApiGuard';

export const authRouter = Router();

authRouter.post('/login', rateLimitApiGuard, loginBodyValidator, validationErrorMiddleware, authController.login);
authRouter.get('/me', accessTokenGuard, authController.me);
authRouter.post('/registration', rateLimitApiGuard, userBodyValidator, validationErrorMiddleware, authController.registration);
authRouter.post('/registration-confirmation', rateLimitApiGuard, authController.registrationConfirmation);
authRouter.post('/registration-email-resending', rateLimitApiGuard, authController.registrationEmailResend);
authRouter.post('/logout', rateLimitApiGuard, refreshTokenGuard, authController.logout);
authRouter.post('/refresh-token', refreshTokenGuard, authController.refreshToken);
