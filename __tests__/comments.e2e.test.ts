import { db } from '../src/db/mongoDb';
import { SETTINGS } from '../src/settings';
import { req } from './test-helpers';
import { comment1 } from './datasets';
describe('test /comments', () => {
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

      const commentsResponse = await req.get(`${SETTINGS.PATH.COMMENTS}/1`).expect(200);
    });
  });
});
