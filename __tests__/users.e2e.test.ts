import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { InputUserType } from '../src/input-output-types/user-types';
import { db } from '../src/db/mongoDb';

(async () => await db.run(SETTINGS.MONGO_URL))();

describe('tests for /users', () => {
  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  it('should get all users', async () => {
    await db.dropCollections();
    const usersResponse = await req.get(SETTINGS.PATH.USERS).expect(200);

    expect(usersResponse.body.length).toBe(0);
  });
  it('should create new user', async () => {
    await db.dropCollections();
    const newUser: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse = await req.post(SETTINGS.PATH.USERS).send(newUser).expect(201);

    expect(createUserResponse.body.login).toBe(newUser.login);
    expect(createUserResponse.body.email).toBe(newUser.email);

    const usersResponse = await req.get(SETTINGS.PATH.USERS).expect(200);

    expect(usersResponse.body.length).toBe(1);
  });
  it('should not create new user because unauthorized', async () => {});
  it('should delete user', async () => {
    await db.dropCollections();
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
