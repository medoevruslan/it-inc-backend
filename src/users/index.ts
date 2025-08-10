import { Router } from 'express';
import { validationErrorMiddleware } from '../middlewares';
import { userQueryValidator } from '../validation/userQueryValidator';
import { userBodyValidator } from '../validation/userBodyValidator';
import { baseAuthGuard } from '../middlewares/guard';
import { container } from '../composition-root';
import { UsersController } from './UsersController';

const usersController = container.get(UsersController)

export const usersRouter = Router();

usersRouter.get('/', userQueryValidator, baseAuthGuard, validationErrorMiddleware, usersController.getUsers.bind(usersController));
usersRouter.post('/', userBodyValidator, baseAuthGuard, validationErrorMiddleware, usersController.createUser.bind(usersController));
usersRouter.delete('/:id', baseAuthGuard, usersController.deleteUser.bind(usersController));
