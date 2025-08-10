import { Request, Response } from 'express';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { DeviceSessionsService } from '../service/DeviceSessionsService';
import { inject } from 'inversify';


export class DeviceSessionsController {

  constructor(@inject(DeviceSessionsService) protected deviceSessionsService: DeviceSessionsService) {
  }

  async deleteActiveSessionsExceptForActive(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const deviceId = req.deviceId!;

      const result = await this.deviceSessionsService.deleteSessionsExceptForCurrent(userId, deviceId);

      if (result.status !== ResultStatus.Success) {
        res.sendStatus(HttpStatuses.Unauthorized);
        console.log('error on deleteSessionsExceptForCurrent');
        return;
      }

      res.sendStatus(HttpStatuses.NoContent);
    } catch (err) {
      handleApiError(err, res);
    }

  }

  async deleteUserSessionByDeviceId(req: Request<{ deviceId: string }>, res: Response) {
    try {
      const currentUserId = req.userId!;

      const targetDeviceId = req.params.deviceId;

      const sessions = await this.deviceSessionsService.findAll();

      const foundSession = sessions.find(data => data.deviceId === targetDeviceId);

      if (!foundSession) {
        console.log('Session not found: ', targetDeviceId);
        res.sendStatus(HttpStatuses.NotFound);
        return;
      }

      if (foundSession && foundSession.userId !== currentUserId) {
        console.log('Forbidden to delete session for other users: ', targetDeviceId);
        res.sendStatus(HttpStatuses.Forbidden);
        return;
      }

      const isSessionDeleted = await this.deviceSessionsService.deleteSessionByDeviceId(targetDeviceId);

      if (!isSessionDeleted) {
        console.log('Could not delete session for device: ', targetDeviceId);
        res.sendStatus(HttpStatuses.BadRequest);
        return;
      }

      res.sendStatus(HttpStatuses.NoContent);
    } catch (err) {
      handleApiError(err, res);
    }
  };

  async getActiveSessionsByUserId(req: Request, res: Response) {
    try {
      const userId = req.userId!;

      const result = await this.deviceSessionsService.findSessionsByUserId(userId);

      if (result.status !== ResultStatus.Success) {
        res.sendStatus(HttpStatuses.Unauthorized);
        console.log(result.errorMessage);
        return;
      }

      res.status(HttpStatuses.Success).send(result.data);
    } catch (e) {
      handleApiError(e, res);
    }

  };
}