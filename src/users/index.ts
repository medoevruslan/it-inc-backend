import { Router } from 'express';
import { getUsersController } from './getUsersController';
import { createUserController } from './createUserController';
import { deleteUserController } from './deleteUserController';
import { authMiddleware } from '../middlewares';
import { userQueryValidator } from '../validation/userQueryValidator';
import { userBodyValidator } from '../validation/userBodyValidator';

export const usersRouter = Router();

usersRouter.get('/', userQueryValidator, authMiddleware, getUsersController);
usersRouter.post('/', userBodyValidator, authMiddleware, createUserController);
usersRouter.delete('/:id', authMiddleware, deleteUserController);
