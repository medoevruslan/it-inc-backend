import { Router } from 'express';
import { getUsersController } from './getUsersController';
import { createUserController } from './createUserController';
import { deleteUserController } from './deleteUserController';

export const usersRouter = Router();

usersRouter.get('/', getUsersController);
usersRouter.post('/', createUserController);
usersRouter.delete('/:id', deleteUserController);
