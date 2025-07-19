import { MongoMemoryServer } from 'mongodb-memory-server';
import { db } from '../src/db/mongoDb';
import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { InputUserType } from '../src/input-output-types/user-types';

describe('tests for security', () => {

  let mongoServer: MongoMemoryServer;
  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri();
    await db.run(uri)
  })

  afterAll(async () => {
    await db.close();
    await mongoServer.stop()
  })

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test rate limit', () => {
    it('should prevent more than 2 requests in 10 sec on register', async () => {
      await db.dropCollections();

      const MAX_REQUESTS = 2;
      const totalRequests = 7;

      const newUsers: InputUserType[] = Array.from({ length: totalRequests }).map((_, idx) => ({
        login: 'newlgn' + idx,
        email: `newwmail${idx}@some.com`,
        password: 'new password' + idx,
      }));

      for (let i = 0; i < totalRequests; i++) {
        const user = newUsers[i];
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send(user);

        if (i <= MAX_REQUESTS) {
          expect(response.status).toBe(204);
        } else {
          expect(response.status).toBe(429);
        }
      }
    });
  })
})