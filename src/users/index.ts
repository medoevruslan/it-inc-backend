import { Router } from 'express';
import { getUsersController } from './getUsersController';
import { createUserController } from './createUserController';
import { deleteUserController } from './deleteUserController';
import { validationErrorMiddleware } from '../middlewares';
import { userQueryValidator } from '../validation/userQueryValidator';
import { userBodyValidator } from '../validation/userBodyValidator';
import { baseAuthGuard } from '../middlewares/guard';

export const usersRouter = Router();

usersRouter.get('/', userQueryValidator, baseAuthGuard, getUsersController);
usersRouter.post('/', userBodyValidator, baseAuthGuard, validationErrorMiddleware, createUserController);
usersRouter.delete('/:id', baseAuthGuard, deleteUserController);
