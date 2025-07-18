import { Request, Response } from 'express';
import { handleApiError } from '../shared/utils';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { deviceSessionsService } from '../composition-root';


export const getActiveSessionsByUserId = async (req: Request, res: Response) => {
  try {
    const currentToken = req.cookies.refreshToken as string | undefined;

    console.log('getActiveSessionsByUserId controller: found currentToken >> ', currentToken);

    if (!currentToken) {
      res.sendStatus(HttpStatuses.Unauthorized);
      console.log('no refreshToken found');
      return;
    }

    const result = await deviceSessionsService.findSessionsByTokenPayload(currentToken);

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