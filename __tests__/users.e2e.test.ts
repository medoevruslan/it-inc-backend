import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { InputUserType } from '../src/input-output-types/user-types';
import { db } from '../src/db/mongoDb';
import exp = require('node:constants');

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

    const createUserResponse = await req
      .post(SETTINGS.PATH.USERS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newUser)
      .expect(201);

    expect(createUserResponse.body.login).toBe(newUser.login);
    expect(createUserResponse.body.email).toBe(newUser.email);

    const usersResponse = await req.get(SETTINGS.PATH.USERS).expect(200);

    expect(usersResponse.body.length).toBe(1);
  });
  it('should not create new user because unauthorized', async () => {
    await db.dropCollections();
    const newUser: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse = await req.post(SETTINGS.PATH.USERS).send(newUser).expect(401);
  });
  it('should not create new user because already exists', async () => {
    await db.dropCollections();
    const newUser: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const existedUser: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse1 = await req
      .post(SETTINGS.PATH.USERS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newUser)
      .expect(201);

    const createUserResponse2 = await req
      .post(SETTINGS.PATH.USERS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(existedUser)
      .expect(400);

    expect(createUserResponse2.body.errorsMessages.length).toBe(1);
    expect(createUserResponse2.body.errorsMessages[0]).toEqual({ field: 'email', message: 'email should be unique' });
  });
  it('should delete user', async () => {
    await db.dropCollections();
    const user: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse = await req
      .post(SETTINGS.PATH.USERS)
      .send(user)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(201);

    const deleteUserResponse = await req
      .delete(`${SETTINGS.PATH.USERS}/${createUserResponse.body.id}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(204);

    const getUsersResponse = await req.get(SETTINGS.PATH.USERS).expect(200);

    expect(getUsersResponse.body.length).toBe(0);
  });
  it('should not delete user because unauthorized', async () => {
    await db.dropCollections();
    const user: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse = await req
      .post(SETTINGS.PATH.USERS)
      .send(user)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(201);

    const deleteUserResponse = await req.delete(`${SETTINGS.PATH.USERS}/${createUserResponse.body.id}`).expect(401);
  });
  it('should login successfully', async () => {
    await db.dropCollections();
    const newUser: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse = await req
      .post(SETTINGS.PATH.USERS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newUser)
      .expect(201);

    const loginResponse = await req
      .post(`${SETTINGS.PATH.AUTH}/login`)
      .send({ loginOrEmail: newUser.login, password: newUser.password })
      .expect(204);
  });
  it('should not login because user not exist', async () => {
    await db.dropCollections();
    const newUser: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse = await req
      .post(SETTINGS.PATH.USERS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newUser)
      .expect(201);

    const loginResponse = await req
      .post(`${SETTINGS.PATH.AUTH}/login`)
      .send({ loginOrEmail: 'incorrect login', password: newUser.password })
      .expect(404);
  });
  it('should not login because password is incorrect', async () => {
    await db.dropCollections();
    const newUser: Partial<InputUserType> = {
      login: 'new login',
      email: 'new email',
      password: 'new password',
    };

    const createUserResponse = await req
      .post(SETTINGS.PATH.USERS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newUser)
      .expect(201);

    const loginResponse = await req
      .post(`${SETTINGS.PATH.AUTH}/login`)
      .send({ loginOrEmail: newUser.login, password: 'incorrect' })
      .expect(401);

    expect(loginResponse.body.errorsMessages).toEqual([
      { field: 'email', message: 'login or password is incorrect' },
      { field: 'password', message: 'login or password is incorrect' },
    ]);
  });
});
