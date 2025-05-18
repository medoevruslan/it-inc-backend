import { db } from '../src/db/mongoDb';
import { InputUserType } from '../src/input-output-types/user-types';
import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';


describe('test auth', () => {
  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('test login', () => {
    it('should login by login successfully', async () => {
      await db.dropCollections();
      const newUser: Partial<InputUserType> = {
        login: 'newlgn',
        email: 'newwmail@some.com',
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
        .expect(200);

      expect(loginResponse.body.accessToken).toBeDefined();
    });
    it('should login by email successfully', async () => {
      await db.dropCollections();
      const newUser: Partial<InputUserType> = {
        login: 'newlgn',
        email: 'newwmail@some.com',
        password: 'new password',
      };

      const createUserResponse = await req
        .post(SETTINGS.PATH.USERS)
        .set('Authorization', `Basic ${codedAuth}`)
        .send(newUser)
        .expect(201);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.email, password: newUser.password })
        .expect(200);
    });
    it('should not login because user not exist', async () => {
      await db.dropCollections();
      const newUser: Partial<InputUserType> = {
        login: 'newlgn',
        email: 'newwmail@some.com',
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
        .expect(401);
    });
    it('should not login because password is incorrect', async () => {
      await db.dropCollections();
      const newUser: Partial<InputUserType> = {
        login: 'newlgn',
        email: 'newwmail@some.com',
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

      expect(loginResponse.body.errorMessages).toEqual([
        { field: 'email', message: 'login or password is incorrect' },
        { field: 'password', message: 'login or password is incorrect' },
      ]);
    });
    it('should pass me', async () => {
      await db.dropCollections();
      const newUser: Partial<InputUserType> = {
        login: 'newlgn',
        email: 'newwmail@some.com',
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
        .expect(200);

      const meResponse = await req
        .get(`${SETTINGS.PATH.AUTH}/me`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(meResponse.body).toEqual({
        userId: createUserResponse.body.id,
        email: meResponse.body.email,
        login: meResponse.body.login,
      });
    });
  });

  describe('test user registration', () => {
    it('user should be registered', async () => {



    });
  });
});


