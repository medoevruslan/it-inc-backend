import { app } from '../src/app';
import { agent } from 'supertest';
import { InputUserType, OutputUserAccountType } from '../src/input-output-types/user-types';
import { SETTINGS } from '../src/settings';
import { HttpStatuses } from '../src/shared/enums';

export const req = agent(app);

export const toBase64 = (authString: string) => {
  const buffer = Buffer.from(authString, 'utf-8');
  return buffer.toString('base64');
};

export const addUser = async (auth: string, randomSeed: string = Math.random().toString(36).slice(2, 5)): Promise<OutputUserAccountType & { password: string }> => {
  const newUser: Partial<InputUserType> = {
    login: 'newlgn' + randomSeed,
    email: `newwmail${randomSeed}@some.com`,
    password: 'new password',
  };

  const createUserResponse = await req
    .post(SETTINGS.PATH.USERS)
    .set('Authorization', `Basic ${auth}`)
    .send(newUser)
    .expect(HttpStatuses.Created);

  return { ...createUserResponse.body, password: newUser.password };
};
