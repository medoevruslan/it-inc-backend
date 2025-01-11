import { req } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { setDB } from '../src/db/db';
import { dataset1 } from './datasets';
import { PostDbType } from '../src/db/post-db.type';
import { generateIdString } from '../src/shared/utils';

describe('tests for /posts', () => {
  beforeEach(() => {
    setDB();
  });

  it('should return empty array', async () => {
    const res = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(res.body.length).toBe(0);
  });

  it('should get not empty array', async () => {
    setDB(dataset1);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0]).toEqual(dataset1.posts[0]);
  });

  it('should create new post', async () => {
    const newPost: Partial<PostDbType> = {
      title: 'new title',
      content: 'new content',
      shortDescription: 'new shortDescription',
      blogId: generateIdString(),
    };

    const res = await req.post(SETTINGS.PATH.POSTS).send(newPost).expect(201);
    expect(res.body.title).toEqual(newPost.title);
    expect(res.body.blogName).toBeNull();
  });
});
