import { Router } from 'express';
import { getUsersController } from './getUsersController';
import { createUserController } from './createUserController';
import { deleteUserController } from './deleteUserController';
import { authMiddleware } from '../middlewares';
import { userQueryValidator } from '../validation/userQueryValidator';

export const usersRouter = Router();

usersRouter.get('/', userQueryValidator, getUsersController);
usersRouter.post('/', authMiddleware, createUserController);
usersRouter.delete('/:id', authMiddleware, deleteUserController);
