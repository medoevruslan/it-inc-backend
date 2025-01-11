import { req } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { setDB } from '../src/db/db';
import { dataset1 } from './datasets';

describe('tests for /blogs', () => {
  beforeEach(() => {
    setDB();
  });

  it('should return empty array', async () => {
    const res = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(res.body.length).toBe(0);
  });

  it('should get not empty array', async () => {
    setDB(dataset1);

    const res = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0]).toEqual(dataset1.blogs[0]);
  });
});
