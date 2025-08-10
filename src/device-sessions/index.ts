import { Router } from 'express';
import { refreshTokenGuard } from '../middlewares/guard/refreshTokenGuard';
import { container } from '../composition-root';
import { DeviceSessionsController } from './DeviceSessionsController';

const deviceSessionsController = container.get(DeviceSessionsController)

export const securityRouter = Router()

securityRouter.get('/devices/', refreshTokenGuard, deviceSessionsController.getActiveSessionsByUserId.bind(deviceSessionsController))
securityRouter.delete('/devices/', refreshTokenGuard, deviceSessionsController.deleteActiveSessionsExceptForActive.bind(deviceSessionsController))
securityRouter.delete('/devices/:deviceId',refreshTokenGuard, deviceSessionsController.deleteUserSessionByDeviceId.bind(deviceSessionsController))


