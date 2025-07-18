import { Request, Response } from 'express';
import { handleApiError } from '../shared/utils';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { deviceSessionsService } from '../composition-root';


export const getActiveSessionsByUserIdController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!

    const result = await deviceSessionsService.findSessionsByUserId(userId);

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