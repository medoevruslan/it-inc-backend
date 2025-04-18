import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { InputUserType, OutputUserType } from '../src/input-output-types/user-types';
import { db } from '../src/db/mongoDb';
import { accessTokenGuard } from '../src/middlewares/guard';

describe('tests for /users', () => {
  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('test get users', () => {
    it('should get all users', async () => {
      await db.dropCollections();

      const newUsers: Partial<InputUserType[]> = Array.from({ length: 12 }).map((_, idx) => ({
        login: 'newlgn' + idx,
        email: `newwmail${idx}@some.com`,
        password: 'new password' + idx,
      }));

      await Promise.all(
        newUsers.map((user) =>
          req.post(SETTINGS.PATH.USERS).set('Authorization', `Basic ${codedAuth}`).send(user).expect(201),
        ),
      );

      const usersResponse = await req.get(SETTINGS.PATH.USERS).set('Authorization', `Basic ${codedAuth}`).expect(200);

      expect(usersResponse.body.totalCount).toBe(12);
      expect(usersResponse.body.pageSize).toBe(10);
      expect(usersResponse.body.pagesCount).toBe(2);
      expect(usersResponse.body.page).toBe(1);
    });
    it('should get all users on page 2', async () => {
      await db.dropCollections();

      const newUsers: Partial<InputUserType[]> = Array.from({ length: 20 }).map((_, idx) => ({
        login: 'newlgn' + idx,
        email: `new_email${idx}@gg.com`,
        password: 'new password' + idx,
      }));

      await Promise.all(
        newUsers.map((user) =>
          req.post(SETTINGS.PATH.USERS).set('Authorization', `Basic ${codedAuth}`).send(user).expect(201),
        ),
      );

      const usersResponse = await req
        .get(
          `${SETTINGS.PATH.USERS}?pageSize=15&pageNumber=1&searchLoginTerm=seR&searchEmailTerm=.com&sortDirection=asc&sortBy=login`,
        )
        .set('Authorization', `Basic ${codedAuth}`)
        .expect(200);

      expect(usersResponse.body.totalCount).toBe(20);
      expect(usersResponse.body.pageSize).toBe(15);
      expect(usersResponse.body.pagesCount).toBe(2);
      expect(usersResponse.body.page).toBe(1);
    });
    it('should get all users by searchLoginTerm', async () => {
      await db.dropCollections();

      const newUsers: Partial<InputUserType[]> = Array.from({ length: 5 }).map((_, idx) => ({
        login: 'newlgn' + idx,
        email: `newwmail${idx}@some.com`,
        password: 'new password' + idx,
      }));

      await Promise.all(
        newUsers.map((user) =>
          req.post(SETTINGS.PATH.USERS).set('Authorization', `Basic ${codedAuth}`).send(user).expect(201),
        ),
      );

      const usersResponse = await req
        .get(`${SETTINGS.PATH.USERS}?searchLoginTerm=1`)
        .set('Authorization', `Basic ${codedAuth}`)
        .expect(200);

      expect(usersResponse.body.items.length).toBe(1);
      expect(usersResponse.body.items[0].login).toBe(newUsers[1]?.login);
    });
    it('should get all users by searchEmailTerm', async () => {
      await db.dropCollections();

      const newUsers: Partial<InputUserType[]> = Array.from({ length: 5 }).map((_, idx) => ({
        login: 'newlogin' + idx,
        email: `newemail${idx}@some.com`,
        password: 'new password' + idx,
      }));

      await Promise.all(
        newUsers.map((user) =>
          req.post(SETTINGS.PATH.USERS).set('Authorization', `Basic ${codedAuth}`).send(user).expect(201),
        ),
      );

      const usersResponse = await req
        .get(`${SETTINGS.PATH.USERS}?searchEmailTerm=3`)
        .set('Authorization', `Basic ${codedAuth}`)
        .expect(200);

      expect(usersResponse.body.items.length).toBe(1);
      expect(usersResponse.body.items[0].email).toBe(newUsers[3]?.email);
    });
  });

  describe('test create user', () => {
    it('should create new user', async () => {
      await db.dropCollections();

      const newUsers: Partial<InputUserType[]> = Array.from({ length: 5 }).map((_, idx) => ({
        login: 'newlogin' + idx,
        email: `newemail${idx}@some.com`,
        password: 'new password' + idx,
      }));

      await Promise.all(
        newUsers.map((user) =>
          req.post(SETTINGS.PATH.USERS).set('Authorization', `Basic ${codedAuth}`).send(user).expect(201),
        ),
      );

      const usersResponse1 = await req.get(SETTINGS.PATH.USERS).set('Authorization', `Basic ${codedAuth}`).expect(200);

      expect(usersResponse1.body.items.length).toBe(newUsers.length);

      const newUser: Partial<InputUserType> = {
        login: 'newlogin',
        email: 'newemail@some.com',
        password: 'new password',
      };

      const createUserResponse2 = await req
        .post(SETTINGS.PATH.USERS)
        .set('Authorization', `Basic ${codedAuth}`)
        .send(newUser)
        .expect(201);

      const usersResponse2 = await req.get(SETTINGS.PATH.USERS).set('Authorization', `Basic ${codedAuth}`).expect(200);

      expect(usersResponse2.body.items.length).toBe(usersResponse1.body.items.length + 1);
      expect(usersResponse2.body.items.some((user: OutputUserType) => user.login === newUser.login)).toBeTruthy();
      expect(usersResponse2.body.items.some((user: OutputUserType) => user.email === newUser.email)).toBeTruthy();

      expect(usersResponse2.body.totalCount).toBe(usersResponse1.body.totalCount + 1);
    });
    it('should not create new user because incorrect body', async () => {
      await db.dropCollections();
      const newUser: Partial<InputUserType> = {
        login: 'sh',
        password: 'length_21-weqweqweqwq',
        email: 'someemail@gg.com',
      };

      const createUserResponse = await req
        .post(SETTINGS.PATH.USERS)
        .set('Authorization', `Basic ${codedAuth}`)
        .send(newUser)
        .expect(400);

      expect(createUserResponse.body.errorsMessages.length).toBe(2);
      expect(createUserResponse.body.errorsMessages).toEqual([
        { field: 'login', message: '[login] should be more than 2 and less than 10 characters' },
        { field: 'password', message: 'password should be less than 20 chars and more than 5' },
      ]);
    });
    it('should not create new user because unauthorized', async () => {
      await db.dropCollections();
      const newUser: Partial<InputUserType> = {
        login: 'newlgn',
        email: 'newwmail@some.com',
        password: 'new password',
      };

      const createUserResponse = await req.post(SETTINGS.PATH.USERS).send(newUser).expect(401);
    });
    it('should not create new user because already exists', async () => {
      await db.dropCollections();
      const newUser: Partial<InputUserType> = {
        login: 'newlgn',
        email: 'newwmail@some.com',
        password: 'new password',
      };

      const existedUser: Partial<InputUserType> = {
        login: 'newlgn',
        email: 'newwmail@some.com',
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
  });

  describe('test delete user', () => {
    it('should delete user', async () => {
      await db.dropCollections();

      const newUsers: Partial<InputUserType[]> = Array.from({ length: 10 }).map((_, idx) => ({
        login: 'newlgn' + idx,
        email: `newwmail${idx}@some.com`,
        password: 'new password' + idx,
      }));

      const createUsersResponse = await Promise.all(
        newUsers.map((user) =>
          req.post(SETTINGS.PATH.USERS).set('Authorization', `Basic ${codedAuth}`).send(user).expect(201),
        ),
      );

      const getUsersBeforeDeletingResponse = await req
        .get(SETTINGS.PATH.USERS + '?pageSize=20')
        .set('Authorization', `Basic ${codedAuth}`)
        .expect(200);

      console.log('getUsersBeforeDeletingResponse.body::: ', getUsersBeforeDeletingResponse.body);

      expect(getUsersBeforeDeletingResponse.body.items.length).toBe(newUsers.length);

      const deleteUserResponse = await req
        .delete(`${SETTINGS.PATH.USERS}/${createUsersResponse[5].body.id}`)
        .set('Authorization', `Basic ${codedAuth}`)
        .expect(204);

      const getUsersAfterDeletingResponse = await req
        .get(SETTINGS.PATH.USERS + '?pageSize=20')
        .set('Authorization', `Basic ${codedAuth}`)
        .expect(200);

      console.log('getUsersAfterDeletingResponse.body::: ', getUsersAfterDeletingResponse.body);

      expect(getUsersAfterDeletingResponse.body.items.length).toBe(newUsers.length - 1);
    });
    it('should not delete user because unauthorized', async () => {
      await db.dropCollections();
      const user: Partial<InputUserType> = {
        login: 'newlgn',
        email: 'newwmail@some.com',
        password: 'new password',
      };

      const createUserResponse = await req
        .post(SETTINGS.PATH.USERS)
        .send(user)
        .set('Authorization', `Basic ${codedAuth}`)
        .expect(201);

      const deleteUserResponse = await req.delete(`${SETTINGS.PATH.USERS}/${createUserResponse.body.id}`).expect(401);
    });
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

      expect(loginResponse.body.accessToken).toReturn();
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
        .expect(204);
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
        .expect(404);
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

      expect(loginResponse.body).toEqual([
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
});
