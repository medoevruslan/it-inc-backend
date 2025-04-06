import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { InputUserType } from '../src/input-output-types/user-types';
import { ObjectId } from 'mongodb';
import { setMongoDB } from '../src/db/mongoDb';

describe('tests for /users', () => {
  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  it('should get all users', async () => {
    await setMongoDB();
    const usersResponse = await req.get(SETTINGS.PATH.USERS).expect(200);

    expect(usersResponse.body.items.length).toBeGreaterThan(0);
  });
  it('should create new user', async () => {
    await setMongoDB();
    const user: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse = await req.post(SETTINGS.PATH.USERS).send(user).expect(201);
  });
  it('should not create new user because unauthorized', async () => {});
  it('should delete user', async () => {
    await setMongoDB();
    const user: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse = await req.post(SETTINGS.PATH.USERS).send(user).expect(201);

    const deleteUserResponse = await req.delete(`${SETTINGS.PATH.USERS}/${createUserResponse.body.userId}`).expect(204);
  });
  it('should not delete user because unauthorized', async () => {});
});
