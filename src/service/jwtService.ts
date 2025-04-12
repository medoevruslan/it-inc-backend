import jwt from 'jsonwebtoken';
import { SETTINGS } from '../settings';
import { Nullable } from '../shared/types';

export const jwtService = {
  async verifyToken<T>(token: string): Promise<Nullable<T>> {
    try {
      return jwt.verify(token, SETTINGS.JWT as string) as T;
    } catch (e: unknown) {
      console.error('Token verify some error');
      return null;
    }
  },
  async decodeToken(token: string): Promise<any> {
    try {
      return jwt.decode(token);
    } catch (e: unknown) {
      console.error("Can't decode token", e);
      return null;
    }
  },
  async createToken(userId: string) {
    return jwt.sign({ userId }, SETTINGS.JWT, { expiresIn: SETTINGS.TOKEN_EXP_TIME });
  },
};
