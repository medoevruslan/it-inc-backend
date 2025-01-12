import { req } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { db, DBType, setDB } from '../src/db/db';
import { blog1, post1, video1 } from './datasets';
import { PostDbType } from '../src/db/post-db.type';
import { generateIdString } from '../src/shared/utils';
import { PostInputType } from '../src/input-output-types/post-types';

describe('tests for /posts', () => {
  let dataset1: DBType;
  beforeEach(() => {
    dataset1 = {
      videos: [video1],
      posts: [post1],
      blogs: [blog1],
    };
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

  it('should throw validation error on create new post', async () => {
    const newPost: any = {
      title: 1,
      content: false,
      shortDescription: 2211,
      blogId: true,
    };

    const res = await req.post(SETTINGS.PATH.POSTS).send(newPost).expect(400);
    expect(res.body.errorsMessages.length).toEqual(4);
  });

  it('should delete post by id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = response1.body[0].id;

    const response2 = await req.delete(`${SETTINGS.PATH.POSTS}/${postId}`).expect(204);

    expect(db.posts.length).toEqual(0);
  });

  it('should not delete post by wrong id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(response1.body.length).toEqual(1);

    const response2 = await req.delete(`${SETTINGS.PATH.POSTS}/${22}`).expect(404);

    expect(db.posts.length).toEqual(1);
  });

  it('should update post by id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = response1.body[0].id;

    const update: PostInputType = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: 'updatedBlogId',
      content: 'updatedContent',
      blogName: 'newBlogName',
    };

    const response2 = await req.put(`${SETTINGS.PATH.POSTS}/${postId}`).send(update).expect(204);

    expect(dataset1.posts[0].title).toEqual(update.title);
    expect(dataset1.posts[0].shortDescription).toEqual(update.shortDescription);
    expect(dataset1.posts[0].blogId).toEqual(update.blogId);
    expect(dataset1.posts[0].content).toEqual(update.content);
    expect(dataset1.posts[0].blogName).toEqual(update.blogName);
  });

  it('should not update post by id because partial update data', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = response1.body[0].id;

    const update: Partial<PostInputType> = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      content: 'updatedContent',
    };

    const response2 = await req.put(`${SETTINGS.PATH.POSTS}/${postId}`).send(update).expect(400);
    expect(response2.body.errorsMessages.length).toBeGreaterThan(0);
  });

  it('should not update post by id because wrong id', async () => {
    setDB(dataset1);

    const update: Partial<PostInputType> = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: 'updatedBlogId',
      content: 'updatedContent',
      blogName: 'newBlogName',
    };

    const response2 = await req.put(`${SETTINGS.PATH.POSTS}/${22}`).send(update).expect(404);
  });
});
