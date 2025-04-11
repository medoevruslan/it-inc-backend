import { Router } from 'express';
import { getUsersController } from './getUsersController';
import { createUserController } from './createUserController';
import { deleteUserController } from './deleteUserController';
import { authMiddleware } from '../middlewares';

export const usersRouter = Router();

usersRouter.get('/', getUsersController);
usersRouter.post('/', authMiddleware, createUserController);
usersRouter.delete('/:id', authMiddleware, deleteUserController);
