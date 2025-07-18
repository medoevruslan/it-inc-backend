import { Router } from 'express';
import { getActiveSessionsByUserIdController } from './getActiveSessionsByUserIdController';
import { deleteActiveSessionsExceptForActiveController } from './deleteActiveSessionsExceptForActiveController';
import { deleteUserSessionByDeviceId } from './deleteUserSessionByDeviceId';
import { refreshTokenGuard } from '../middlewares/guard/refreshTokenGuard';


export const securityRouter = Router()

// TODO: add middleware for refresh token verification and add userId & deviceId to req.

securityRouter.get('/devices/', refreshTokenGuard, getActiveSessionsByUserIdController)
securityRouter.delete('/devices/', refreshTokenGuard, deleteActiveSessionsExceptForActiveController)
securityRouter.delete('/devices/:deviceId',refreshTokenGuard, deleteUserSessionByDeviceId)


