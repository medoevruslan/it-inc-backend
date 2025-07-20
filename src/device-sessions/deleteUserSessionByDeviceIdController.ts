import { Request, Response } from 'express';
import { handleApiError } from '../shared/utils';
import { HttpStatuses } from '../shared/enums';
import { deviceSessionsService } from '../composition-root';

export const deleteUserSessionByDeviceIdController = async (req: Request<{ deviceId: string }>, res: Response) => {
  try {
    const currentUserId = req.userId!

    const targetDeviceId = req.params.deviceId;

    const sessions = await deviceSessionsService.findAll();

    const foundSession = sessions.find(data => data.deviceId === targetDeviceId)

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

    const isSessionDeleted = await deviceSessionsService.deleteSessionByDeviceId(targetDeviceId);

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