import { Router } from 'express';
import { loginController } from './loginController';

export const authRouter = Router();

authRouter.post('/login', loginController);
