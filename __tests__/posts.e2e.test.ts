import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { DBType } from '../src/db/db';
import { blog1, post1, user1, video1 } from './datasets';
import { PostDbType } from '../src/db/post-db.type';
import { generateIdString } from '../src/shared/utils';
import { InputPostType, UpdatePostType } from '../src/input-output-types/post-types';
import { BlogDbType } from '../src/db/blog-db-type';
import { ObjectId } from 'mongodb';
import { db } from '../src/db/mongoDb';

(async () => await db.run(SETTINGS.MONGO_URL))();

describe('tests for /posts', () => {
  let dataset1: DBType;

  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  beforeEach(() => {
    dataset1 = {
      videos: [video1],
      posts: [post1],
      blogs: [blog1],
      users: [user1],
    };
  });

  it('should return empty array', async () => {
    await db.dropCollections();
    const res = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(res.body.items.length).toBe(0);
  });

  it('should get not empty array', async () => {
    await db.seed(dataset1);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].title).toEqual(dataset1.posts[0].title);
  });

  it('should create multiple posts and return proper response', async () => {
    await db.dropCollections();

    const newBlog: Partial<BlogDbType> = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const resCreatedBlog = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newBlog)
      .expect(201);

    const newPosts = Array.from({ length: 15 }).map((_, idx) => ({
      title: 'new title' + idx,
      content: 'new content' + idx,
      shortDescription: 'new shortDescription' + idx,
      blogId: resCreatedBlog.body.id,
    }));

    for (const post of newPosts) {
      await req.post(SETTINGS.PATH.POSTS).set('Authorization', `Basic ${codedAuth}`).send(post).expect(201);
    }

    const postsResponse = await req.get(`${SETTINGS.PATH.POSTS}?sortDirection=asc`).expect(200);

    expect(postsResponse.body.items.length).toBe(10);
    expect(postsResponse.body.totalCount).toBe(15);
    expect(postsResponse.body.page).toBe(1);
    expect(postsResponse.body.pageSize).toBe(10);
    expect(postsResponse.body.pagesCount).toBe(2);
  });

  it('should not create new post because wrong blogId', async () => {
    await db.dropCollections();

    const newPost: Partial<InputPostType> = {
      title: 'new title',
      content: 'new content',
      shortDescription: 'new shortDescription',
      blogId: 'wrongId',
    };

    const resPost = await req
      .post(SETTINGS.PATH.POSTS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newPost)
      .expect(400);

    const resPosts = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(resPosts.body.items.length).toEqual(0);
  });

  it('should create new post', async () => {
    await db.dropCollections();
    // create blog to get its ID
    const newBlog: Partial<BlogDbType> = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const resCreatedBlog = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newBlog)
      .expect(201);

    const newPost: Partial<InputPostType> = {
      title: 'new title',
      content: 'new content',
      shortDescription: 'new shortDescription',
      blogId: resCreatedBlog.body.id,
    };

    const resCreatedPost = await req
      .post(SETTINGS.PATH.POSTS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newPost)
      .expect(201);

    expect(resCreatedPost.body).not.toBeNull();
    expect(resCreatedPost.body.blogId).toEqual(resCreatedBlog.body.id);
    expect(resCreatedPost.body.title).toEqual(newPost.title);
    expect(resCreatedPost.body.shortDescription).toEqual(newPost.shortDescription);
    expect(resCreatedPost.body.content).toEqual(newPost.content);
  });

  it('should throw validation error on create new post', async () => {
    const newPost: any = {
      title: 1,
      content: false,
      shortDescription: 2211,
      blogId: true,
      blogName: 'new blogName',
    };

    const res = await req
      .post(SETTINGS.PATH.POSTS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newPost)
      .expect(400);
    expect(res.body.errorsMessages.length).toEqual(4);
  });

  it('should throw auth error on create new blog', async () => {
    const newPost: Partial<PostDbType> = {
      title: 'new title',
      content: 'new content',
      shortDescription: 'new shortDescription',
      blogId: generateIdString(),
      blogName: 'new blogName',
    };

    const res = await req.post(SETTINGS.PATH.POSTS).send(newPost).expect(401);
  });

  it('should throw auth error on create new blog because wrong auth', async () => {
    const newPost: Partial<PostDbType> = {
      title: 'new title',
      content: 'new content',
      shortDescription: 'new shortDescription',
      blogId: new ObjectId().toString(),
      blogName: 'new blogName',
    };

    const res = await req.post(SETTINGS.PATH.POSTS).set('Authorization', `Basic wrongauth`).send(newPost).expect(401);
  });

  it('should delete post by id', async () => {
    await db.seed(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = response1.body.items[0].id;

    const response2 = await req
      .delete(`${SETTINGS.PATH.POSTS}/${postId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(204);

    const resAllPosts = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(resAllPosts.body.items.length).toEqual(0);
  });

  it('should not delete post by wrong id', async () => {
    await db.seed(dataset1);

    const postsResponse1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(postsResponse1.body.items.length).toEqual(1);

    const deletedPostsRes = await req
      .delete(`${SETTINGS.PATH.POSTS}/${22}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(400);

    const postsResponse2 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(postsResponse2.body.items.length).toEqual(1);
  });

  it('should not delete post because unauthorized', async () => {
    await db.seed(dataset1);

    const postsResponse1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(postsResponse1.body.items.length).toEqual(1);

    const postId = postsResponse1.body.items[0].id;

    const deletedPostsRes = await req.delete(`${SETTINGS.PATH.POSTS}/${postId}`).expect(401);

    const postsResponse2 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(postsResponse2.body.items.length).toEqual(1);
  });

  it('should not delete post because wrong auth', async () => {
    await db.seed(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(response1.body.items.length).toEqual(1);

    const postId = response1.body.items[0].id;

    const response2 = await req
      .delete(`${SETTINGS.PATH.POSTS}/${postId}`)
      .set('Authorization', `Basic wrongauth`)
      .expect(401);

    const postsResponse2 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(postsResponse2.body.items.length).toEqual(1);
  });

  it('should update post by id', async () => {
    await db.seed(dataset1);

    const postsResponse1 = await req.get(SETTINGS.PATH.POSTS).expect(200);
    const blogsResponse1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const postId = postsResponse1.body.items[0].id;

    const update: Partial<UpdatePostType['update']> = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: blogsResponse1.body.items[0].id,
      content: 'updatedContent',
    };

    const updateResponse1 = await req
      .put(`${SETTINGS.PATH.POSTS}/${postId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(204);

    const postsResponse2 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(postsResponse2.body.items[0].title).toEqual(update.title);
    expect(postsResponse2.body.items[0].shortDescription).toEqual(update.shortDescription);
    expect(postsResponse2.body.items[0].blogId).toEqual(update.blogId);
    expect(postsResponse2.body.items[0].content).toEqual(update.content);
  });

  it('should not update post by id because partial update data', async () => {
    await db.seed(dataset1);

    const postsResponse1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = postsResponse1.body.items[0].id;

    const update: Partial<InputPostType> = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      content: 'updatedContent',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.POSTS}/${postId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(400);
    expect(response2.body.errorsMessages.length).toBeGreaterThan(0);
  });

  it('should not update post by id because wrong id', async () => {
    await db.seed(dataset1);

    const update: Partial<InputPostType> = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: dataset1.blogs[0]._id.toString(),
      content: 'updatedContent',
    };

    const response1 = await req
      .put(`${SETTINGS.PATH.POSTS}/${22}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(400);
  });

  it('should not update post by id because unauthorized', async () => {
    await db.seed(dataset1);

    const postsResponse1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = postsResponse1.body.items[0].id;

    const update: Partial<UpdatePostType['update']> = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: dataset1.blogs[0]._id.toString(),
      content: 'updatedContent',
    };

    const updatedResponse = await req.put(`${SETTINGS.PATH.POSTS}/${postId}`).send(update).expect(401);
    const postsResponse2 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(postsResponse2.body.items[0].title).not.toEqual(update.title);
    expect(postsResponse2.body.items[0].shortDescription).not.toEqual(update.shortDescription);
    expect(postsResponse2.body.items[0].blogId).not.toEqual(update.blogId);
    expect(postsResponse2.body.items[0].content).not.toEqual(update.content);
  });

  it('should not update post by id because wrong auth', async () => {
    await db.seed(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = response1.body.items[0].id;

    const update: Partial<UpdatePostType['update']> = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: dataset1.blogs[0]._id.toString(),
      content: 'updatedContent',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.POSTS}/${postId}`)
      .set('Authorization', `Basic wrongauth`)
      .send(update)
      .expect(401);

    expect(response1.body.items[0].title).not.toEqual(update.title);
    expect(response1.body.items[0].shortDescription).not.toEqual(update.shortDescription);
    expect(response1.body.items[0].blogId).not.toEqual(update.blogId);
    expect(response1.body.items[0].content).not.toEqual(update.content);
  });
});
