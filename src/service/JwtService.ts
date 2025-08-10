import jwt from 'jsonwebtoken';
import { SETTINGS } from '../settings';
import { Nullable } from '../shared/types';
import { injectable } from 'inversify';

@injectable()
export class JwtService {

  public async verifyToken<T>(token: string): Promise<Nullable<T>> {
    try {
      return jwt.verify(token, SETTINGS.JWT as string) as T;
    } catch (e: unknown) {
      console.error('Token verify some error: ', e);
      return null;
    }
  }

  public async decodeToken<T>(token: string): Promise<Nullable<T>> {
    try {
      return jwt.decode(token) as T;
    } catch (e: unknown) {
      console.error("Can't decode token", e);
      return null;
    }
  }

  public async createAccessToken(userId: string) {
    return jwt.sign({ userId }, SETTINGS.JWT, { expiresIn: SETTINGS.ACCESS_TOKEN_EXP_TIME });
  }

  public async createRefreshToken(deviceId: string) {
    const token = jwt.sign({ deviceId }, SETTINGS.JWT, { expiresIn: SETTINGS.REFRESH_TOKEN_EXP_TIME });
    const tokenData = jwt.decode(token, { json: true })
    return { token, tokenData }
  }
}
