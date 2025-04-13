import { db } from '../src/db/mongoDb';
import { SETTINGS } from '../src/settings';
import { req, toBase64 } from './test-helpers';
import { comment1 } from './datasets';
import { InputUserType } from '../src/input-output-types/user-types';
describe('test /comments', () => {
  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL);
  });
  afterAll(async () => {
    await db.close();
  });

  describe('get comments', () => {
    it('should get pre seeded comments ', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

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

      const commentsResponse = await req
        .get(`${SETTINGS.PATH.COMMENTS}/1`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);
    });
    it('should not get comments because unauthorized ', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const commentsResponse = await req.get(`${SETTINGS.PATH.COMMENTS}/1`).expect(401);
    });
  });
});
