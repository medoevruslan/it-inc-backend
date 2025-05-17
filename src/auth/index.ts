import { Router } from 'express';
import { authController } from './authController';
import { accessTokenGuard } from '../middlewares/guard';
import { userBodyValidator } from '../validation/userBodyValidator';
import { validationErrorMiddleware } from '../middlewares';

export const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.get('/me', accessTokenGuard, authController.me);
authRouter.post('/registration', userBodyValidator, validationErrorMiddleware, authController.registration);
authRouter.post('/registration-confirmation', authController.registration);
