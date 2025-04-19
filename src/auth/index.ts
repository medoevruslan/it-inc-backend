import { Router } from 'express';
import { authController } from './authController';
import { accessTokenGuard } from '../middlewares/guard';

export const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.get('/me', accessTokenGuard, authController.me);
