import { Router } from 'express';
import { authController } from './authController';
import { accessTokenGuard } from '../middlewares/guard';
import { userBodyValidator } from '../validation/userBodyValidator';
import { validationErrorMiddleware } from '../middlewares';
import { loginBodyValidator } from '../validation/loginBodyValidator';

export const authRouter = Router();

authRouter.post('/login', loginBodyValidator, validationErrorMiddleware, authController.login);
authRouter.get('/me', accessTokenGuard, authController.me);
authRouter.post('/registration', userBodyValidator, validationErrorMiddleware, authController.registration);
authRouter.post('/registration-confirmation', authController.registrationConfirmation);
authRouter.post('/registration-email-resending', authController.registrationEmailResend);
