import { NextFunction, Request, Response } from 'express';
import { HttpStatuses, ResultStatus } from '../../shared/enums';
import { container } from '../../composition-root';
import { JwtService } from '../../service/JwtService';
import { DeviceSessionsService } from '../../service/DeviceSessionsService';

export const refreshTokenGuard =  async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  const jwtService = container.get(JwtService)
  const deviceSessionsService = container.get(DeviceSessionsService)

  console.log('refreshTokenGuard: found currentToken >> ', refreshToken);

  if (!refreshToken) {
    res.sendStatus(HttpStatuses.Unauthorized);
    console.log('no refreshToken found');
    return;
  }

  const tokenResult = await jwtService.verifyToken<{ deviceId: string, iat: number }>(refreshToken);

  if (!tokenResult) {
    res.sendStatus(HttpStatuses.BadRequest);
    console.log('Token verify bad result: ', tokenResult)
    return;
  }

  const session = await deviceSessionsService.findSessionByDeviceIdAndIat(tokenResult.deviceId, tokenResult.iat);

  if (session.status !== ResultStatus.Success || !session.data) {
    res.sendStatus(HttpStatuses.Unauthorized);
    console.log('session not found');
    return;
  }


  req.userId = session.data.userId
  req.deviceId = tokenResult.deviceId
  next()
}