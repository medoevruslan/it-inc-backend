import { Request, Response } from 'express';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { deviceSessionsService } from '../composition-root';
import { handleApiError } from '../shared/utils';

export const deleteActiveSessionsExceptForActiveController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!
    const deviceId = req.deviceId!

    const result = await deviceSessionsService.deleteSessionsExceptForCurrent(userId, deviceId);

    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.Unauthorized);
      console.log('error on deleteSessionsExceptForCurrent');
      return;
    }

    res.sendStatus(HttpStatuses.NoContent)
  } catch(err) {
    handleApiError(err, res)
  }

}