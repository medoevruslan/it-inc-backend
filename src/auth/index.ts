import { Router } from 'express';
import { accessTokenGuard } from '../middlewares/guard';
import { userBodyValidator } from '../validation/userBodyValidator';
import { validationErrorMiddleware } from '../middlewares';
import { loginBodyValidator } from '../validation/loginBodyValidator';
import { refreshTokenGuard } from '../middlewares/guard/refreshTokenGuard';
import { rateLimitApiGuard } from '../middlewares/guard/rateLimitApiGuard';
import { authController } from '../composition-root';

export const authRouter = Router();

authRouter.post('/login', rateLimitApiGuard, loginBodyValidator, validationErrorMiddleware, authController.login.bind(authController));
authRouter.get('/me', accessTokenGuard, authController.me.bind(authController));
authRouter.post('/registration', rateLimitApiGuard, userBodyValidator, validationErrorMiddleware, authController.registration.bind(authController));
authRouter.post('/registration-confirmation', rateLimitApiGuard, authController.registrationConfirmation.bind(authController));
authRouter.post('/registration-email-resending', rateLimitApiGuard, authController.registrationEmailResend.bind(authController));
authRouter.post('/logout', rateLimitApiGuard, refreshTokenGuard, authController.logout.bind(authController));
authRouter.post('/refresh-token', refreshTokenGuard, authController.refreshToken.bind(authController));
