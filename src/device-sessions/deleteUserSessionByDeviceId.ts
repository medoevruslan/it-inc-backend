import { Request, Response } from 'express';
import { handleApiError } from '../shared/utils';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { deviceSessionsService, jwtService } from '../composition-root';

export const deleteUserSessionByDeviceId = async (req: Request<{ deviceId: string }>, res: Response) => {
  try {
    const userId = req.userId!
    const deviceId = req.deviceId!

    const targetDeviceId = req.params.deviceId;

    const sessions = await deviceSessionsService.findSessionsByUserId(userId);

    if (sessions.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.Unauthorized);
      console.log(sessions.errorMessage);
      return;
    }

    if (!sessions.data?.some(data => data.deviceId === targetDeviceId)) {
      console.log('Could not delete session for device: ', deviceId);
      res.sendStatus(HttpStatuses.Forbidden);
      return;
    }

    const isSessionDeleted = await deviceSessionsService.deleteSessionByDeviceId(targetDeviceId);

    if (!isSessionDeleted) {
      console.log('Could not delete session for device: ', targetDeviceId);
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  } catch (err) {
    handleApiError(err, res);
  }
};