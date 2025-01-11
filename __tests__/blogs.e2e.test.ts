import { req } from './test-helpers';
import { SETTINGS } from '../src/settings';

describe('tests for /blogs', () => {
  it('should return empty array', async () => {
    const res = req.get(SETTINGS.PATH.BLOGS).status(200);

    expect(res.blogs.length).toBe(0);
  });
});
