import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { db, DBType, setDB } from '../src/db/db';
import { blog1, post1, video1 } from './datasets';
import { PostDbType } from '../src/db/post-db.type';
import { generateIdString } from '../src/shared/utils';
import { InputPostType } from '../src/input-output-types/post-types';
import { BlogDbType } from '../src/db/blog-db-type';
import { blogRepository, postRepository } from '../src/repository';

describe('tests for /posts', () => {
  let dataset1: DBType;

  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

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

  it('should not create new post because wrong blogId', async () => {
    setDB();

    const newPost: InputPostType = {
      title: 'new title',
      content: 'new content',
      shortDescription: 'new shortDescription',
      blogId: 'wrongId',
    };

    const resPost = await req
      .post(SETTINGS.PATH.POSTS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newPost)
      .expect(404);

    const posts = await postRepository.findAll();

    expect(posts.length).toEqual(0);
  });

  it('should create new post', async () => {
    setDB();
    // create blog to get its ID
    const newBlog: Partial<BlogDbType> = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const resBlog = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newBlog)
      .expect(201);

    const blogs = await blogRepository.findAll();

    const newPost: InputPostType = {
      title: 'new title',
      content: 'new content',
      shortDescription: 'new shortDescription',
      blogId: blogs[0].id,
    };

    const resPost = await req
      .post(SETTINGS.PATH.POSTS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newPost)
      .expect(201);

    const foundPost = await postRepository.findById(resPost.body.id);

    expect(foundPost).not.toBeNull();
    expect(foundPost?.blogId).toEqual(blogs[0].id);
    expect(foundPost?.title).toEqual(resPost.body.title);
    expect(foundPost?.blogName).toEqual(resPost.body.blogName);
    expect(foundPost?.blogId).toEqual(resBlog.body.id);
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
      blogId: generateIdString(),
      blogName: 'new blogName',
    };

    const res = await req.post(SETTINGS.PATH.POSTS).set('Authorization', `Basic wrongauth`).send(newPost).expect(401);
  });

  it('should delete post by id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = response1.body[0].id;

    const response2 = await req
      .delete(`${SETTINGS.PATH.POSTS}/${postId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(204);

    expect(db.posts.length).toEqual(0);
  });

  it('should not delete post by wrong id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(response1.body.length).toEqual(1);

    const response2 = await req
      .delete(`${SETTINGS.PATH.POSTS}/${22}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(404);

    expect(db.posts.length).toEqual(1);
  });

  it('should not delete post because unauthorized', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(response1.body.length).toEqual(1);

    const postId = response1.body[0].id;

    const response2 = await req.delete(`${SETTINGS.PATH.POSTS}/${postId}`).expect(401);

    expect(db.posts.length).toEqual(1);
  });

  it('should not delete post because wrong auth', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    expect(response1.body.length).toEqual(1);

    const postId = response1.body[0].id;

    const response2 = await req
      .delete(`${SETTINGS.PATH.POSTS}/${postId}`)
      .set('Authorization', `Basic wrongauth`)
      .expect(401);

    expect(db.posts.length).toEqual(1);
  });

  it('should update post by id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).set('Authorization', `Basic ${codedAuth}`).expect(200);

    const postId = response1.body[0].id;

    const update: InputPostType = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: dataset1.blogs[0].id,
      content: 'updatedContent',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.POSTS}/${postId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(204);

    expect(dataset1.posts[0].title).toEqual(update.title);
    expect(dataset1.posts[0].shortDescription).toEqual(update.shortDescription);
    expect(dataset1.posts[0].blogId).toEqual(update.blogId);
    expect(dataset1.posts[0].content).toEqual(update.content);
  });

  it('should not update post by id because partial update data', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = response1.body[0].id;

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
    setDB(dataset1);

    const update: Partial<InputPostType> = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: dataset1.blogs[0].id,
      content: 'updatedContent',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.POSTS}/${22}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(404);
  });

  it('should not update post by id because unauthorized', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = response1.body[0].id;

    const update: InputPostType = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: dataset1.blogs[0].id,
      content: 'updatedContent',
    };

    const response2 = await req.put(`${SETTINGS.PATH.POSTS}/${postId}`).send(update).expect(401);

    expect(dataset1.posts[0].title).not.toEqual(update.title);
    expect(dataset1.posts[0].shortDescription).not.toEqual(update.shortDescription);
    expect(dataset1.posts[0].blogId).not.toEqual(update.blogId);
    expect(dataset1.posts[0].content).not.toEqual(update.content);
  });

  it('should not update post by id because wrong auth', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

    const postId = response1.body[0].id;

    const update: InputPostType = {
      title: 'updatedTitle',
      shortDescription: 'updatedShortDescription',
      blogId: dataset1.blogs[0].id,
      content: 'updatedContent',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.POSTS}/${postId}`)
      .set('Authorization', `Basic wrongauth`)
      .send(update)
      .expect(401);

    expect(dataset1.posts[0].title).not.toEqual(update.title);
    expect(dataset1.posts[0].shortDescription).not.toEqual(update.shortDescription);
    expect(dataset1.posts[0].blogId).not.toEqual(update.blogId);
    expect(dataset1.posts[0].content).not.toEqual(update.content);
  });
});
