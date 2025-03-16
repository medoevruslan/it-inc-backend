import { Router } from 'express';
import { getUsersController } from './getUsersController';

export const usersRouter = Router();

usersRouter.get('/', getUsersController);
usersRouter.post('/');
usersRouter.delete('/');
