import { Router } from 'express';
import { getActiveSessionsByUserIdController } from './getActiveSessionsByUserIdController';
import { deleteActiveSessionsExceptForActiveController } from './deleteActiveSessionsExceptForActiveController';
import { deleteUserSessionByDeviceIdController } from './deleteUserSessionByDeviceIdController';
import { refreshTokenGuard } from '../middlewares/guard/refreshTokenGuard';


export const securityRouter = Router()

securityRouter.get('/devices/', refreshTokenGuard, getActiveSessionsByUserIdController)
securityRouter.delete('/devices/', refreshTokenGuard, deleteActiveSessionsExceptForActiveController)
securityRouter.delete('/devices/:deviceId',refreshTokenGuard, deleteUserSessionByDeviceIdController)


