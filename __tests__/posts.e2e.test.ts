import { addUser, req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { DBType } from '../src/db/db';
import { blog1, comment1, post1, refreshToken1, user1, video1 } from './datasets';
import { PostDbType } from '../src/db/post-db.type';
import { generateIdString } from '../src/shared/utils';
import { InputPostType, OutputPostType, UpdatePostType } from '../src/input-output-types/post-types';
import { BlogDbType } from '../src/db/blog-db-type';
import { ObjectId } from 'mongodb';
import { db } from '../src/db/mongoDb';
import mongoose from 'mongoose';
import { HttpStatuses, LikeType } from '../src/shared/enums';

jest.setTimeout(100000000);

describe('tests for /posts', () => {
  let dataset1: DBType;

  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  beforeAll(async () => {
    await db.run(SETTINGS.MONGOOSE_URL);
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(() => {
    dataset1 = {
      videos: [video1],
      posts: [post1],
      blogs: [blog1],
      users: [user1],
      comments: [comment1],
      refreshTokensValid: [refreshToken1],
      refreshTokensBlocked: [refreshToken1],
    };
  });

  describe('test get posts', () => {
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
      expect(res.body.items[0].likesInfo.myStatus).toEqual(LikeType.None);
      expect(res.body.items[0].likesInfo.likesCount).toEqual(0);
      expect(res.body.items[0].likesInfo.dislikesCount).toEqual(0);
    });
  });

  describe('test create post', () => {
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
  });

  describe('test update post', () => {
    it('should update post by id', async () => {
      await db.dropCollections();
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
      await db.dropCollections();
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
      await db.dropCollections();
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
      await db.dropCollections();
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
      await db.dropCollections();
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

  describe('test delete post', () => {
    it('should delete post by id', async () => {
      await db.dropCollections();
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
      await db.dropCollections();
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
      await db.dropCollections();
      await db.seed(dataset1);

      const postsResponse1 = await req.get(SETTINGS.PATH.POSTS).expect(200);

      expect(postsResponse1.body.items.length).toEqual(1);

      const postId = postsResponse1.body.items[0].id;

      const deletedPostsRes = await req.delete(`${SETTINGS.PATH.POSTS}/${postId}`).expect(401);

      const postsResponse2 = await req.get(SETTINGS.PATH.POSTS).expect(200);

      expect(postsResponse2.body.items.length).toEqual(1);
    });

    it('should not delete post because wrong auth', async () => {
      await db.dropCollections();
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
  });

  describe('test create new post for blog', () => {
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
  });

  describe('test create comments for post', () => {
    it('should create new comment', async () => {
      await db.dropCollections();
      await db.seed({ users: [user1] });

      // TODO: login not pass because seeded user password is incorrect... need to create it from scratch
      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: user1.accountData.email, password: user1.accountData.password })
        .expect(200);

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

      const newComment = {
        content: 'some'.repeat(10),
      };

      const createCommentResponse = await req
        .post(`${SETTINGS.PATH.POSTS}/${resCreatedPost.body.id}/comments`)
        .set('Authorization', `Beare ${loginResponse.body.accessToken}`)
        .expect(201);
    });
  });
  describe('test update post like status', () => {
    it('should not update like status multiple times for existent posts from one user account', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser1 = await addUser(codedAuth);

      const loginResponse1 = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser1.login, password: newUser1.password })
        .expect(HttpStatuses.Success);

      const postsReponse1 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .expect(HttpStatuses.Success);

      expect(postsReponse1.body.extendedLikesInfo.likesCount).toBe(0);
      expect(postsReponse1.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postsReponse1.body.extendedLikesInfo.myStatus).toBe(LikeType.None);
      expect(postsReponse1.body.extendedLikesInfo.newestLikes.length).toBe(0);

      const likeActions = Array.from({ length: 5 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse1.body.accessToken}`)
        .send({ likeStatus: LikeType.Like }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions);

      const postResponse2 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse1.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse2.body.extendedLikesInfo.likesCount).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse2.body.extendedLikesInfo.myStatus).toBe(LikeType.Like);
      expect(postResponse2.body.extendedLikesInfo.newestLikes.length).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].login).toBe(newUser1.login);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].userId).toBe(newUser1.id);

    });

    it('should set Like and get this status for existent user', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const postResponse1 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .expect(HttpStatuses.Success);

      expect(postResponse1.body.extendedLikesInfo.likesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.myStatus).toBe(LikeType.None);
      expect(postResponse1.body.extendedLikesInfo.newestLikes.length).toBe(0);

      const likeActions = Array.from({ length: 5 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ likeStatus: LikeType.Like }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions);

      const postResponse2 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse2.body.extendedLikesInfo.likesCount).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse2.body.extendedLikesInfo.myStatus).toBe(LikeType.Like);
      expect(postResponse2.body.extendedLikesInfo.newestLikes.length).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].login).toBe(newUser.login);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].userId).toBe(newUser.id);
    });

    it('should set Dislike and get this status for existent user', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const postResponse1 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .expect(HttpStatuses.Success);

      expect(postResponse1.body.extendedLikesInfo.likesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.myStatus).toBe(LikeType.None);

      const likeActions = Array.from({ length: 5 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ likeStatus: LikeType.Dislike }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions);

      const postResponse2 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse2.body.extendedLikesInfo.likesCount).toBe(0);
      expect(postResponse2.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.myStatus).toBe(LikeType.Dislike);
      expect(postResponse2.body.extendedLikesInfo.newestLikes.length).toBe(0);
    });

    it('user1 & user2 should set Like status and post should have 2 newest likes in response', async () => {
      await db.dropCollections();
      const post2 = {...post1, _id: new ObjectId()}
      await db.seed({ posts: [post1, post2] });

      const newUser1 = await addUser(codedAuth);

      const loginResponse1 = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser1.login, password: newUser1.password })
        .expect(HttpStatuses.Success);

      const postResponse1 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .expect(HttpStatuses.Success);

      expect(postResponse1.body.extendedLikesInfo.likesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.myStatus).toBe(LikeType.None);
      expect(postResponse1.body.extendedLikesInfo.newestLikes.length).toBe(0);

      const likeActions1 = Array.from({ length: 2 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse1.body.accessToken}`)
        .send({ likeStatus: LikeType.Like }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions1);

      const postResponse2 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse1.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse2.body.extendedLikesInfo.likesCount).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse2.body.extendedLikesInfo.myStatus).toBe(LikeType.Like);
      expect(postResponse2.body.extendedLikesInfo.newestLikes.length).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].login).toBe(newUser1.login);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].userId).toBe(newUser1.id);

      const newUser2 = await addUser(codedAuth);

      const loginResponse2 = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser2.login, password: newUser2.password })
        .expect(HttpStatuses.Success);

      const likeActions2 = Array.from({ length: 2 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse2.body.accessToken}`)
        .send({ likeStatus: LikeType.Like }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions2);

      const postResponse3 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse2.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse3.body.extendedLikesInfo.likesCount).toBe(2);
      expect(postResponse3.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse3.body.extendedLikesInfo.myStatus).toBe(LikeType.Like);
      expect(postResponse3.body.extendedLikesInfo.newestLikes.length).toBe(2);

      const allPostsResponse =  await req.get(`${SETTINGS.PATH.POSTS}`)
        .expect(HttpStatuses.Success);

      expect(allPostsResponse.body.items.length).toBe(2);
      expect(allPostsResponse.body.items.find((p: OutputPostType) => p.id === post1._id.toString()).extendedLikesInfo.newestLikes.length).toBe(2)
      expect(allPostsResponse.body.items.find((p: OutputPostType) => p.id === post2._id.toString()).extendedLikesInfo.newestLikes.length).toBe(0)
    });

    it('user1 & user2 should set Like status and user3 set Dislike status and post should have 2 newest likes in response', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser1 = await addUser(codedAuth);

      const loginResponse1 = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser1.login, password: newUser1.password })
        .expect(HttpStatuses.Success);

      const postResponse1 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .expect(HttpStatuses.Success);

      expect(postResponse1.body.extendedLikesInfo.likesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.myStatus).toBe(LikeType.None);
      expect(postResponse1.body.extendedLikesInfo.newestLikes.length).toBe(0);

      const likeActions1 = Array.from({ length: 2 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse1.body.accessToken}`)
        .send({ likeStatus: LikeType.Like }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions1);

      const postResponse2 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse1.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse2.body.extendedLikesInfo.likesCount).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse2.body.extendedLikesInfo.myStatus).toBe(LikeType.Like);
      expect(postResponse2.body.extendedLikesInfo.newestLikes.length).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].login).toBe(newUser1.login);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].userId).toBe(newUser1.id);

      const newUser2 = await addUser(codedAuth);

      const loginResponse2 = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser2.login, password: newUser2.password })
        .expect(HttpStatuses.Success);

      const likeActions2 = Array.from({ length: 2 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse2.body.accessToken}`)
        .send({ likeStatus: LikeType.Like }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions2);

      const postResponse3 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse2.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse3.body.extendedLikesInfo.likesCount).toBe(2);
      expect(postResponse3.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse3.body.extendedLikesInfo.newestLikes.length).toBe(2);

      const newUser3 = await addUser(codedAuth);

      const loginResponse3 = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser3.login, password: newUser3.password })
        .expect(HttpStatuses.Success);

      const likeActions3 = Array.from({ length: 2 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse3.body.accessToken}`)
        .send({ likeStatus: LikeType.Dislike }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions3);

      const postResponse4 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse3.body.accessToken}`)
        .expect(HttpStatuses.Success);


      expect(postResponse4.body.extendedLikesInfo.likesCount).toBe(2);
      expect(postResponse4.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(postResponse4.body.extendedLikesInfo.newestLikes.length).toBe(2);
    });

    it('like the post by user 1; dislike the post by user 1; set "none" status by user 1;', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const postResponse1 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .expect(HttpStatuses.Success);

      expect(postResponse1.body.extendedLikesInfo.likesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse1.body.extendedLikesInfo.myStatus).toBe(LikeType.None);
      expect(postResponse1.body.extendedLikesInfo.newestLikes.length).toBe(0);

      const likeActions = Array.from({ length: 1 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ likeStatus: LikeType.Like }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions);

      const postResponse2 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse2.body.extendedLikesInfo.likesCount).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse2.body.extendedLikesInfo.myStatus).toBe(LikeType.Like);
      expect(postResponse2.body.extendedLikesInfo.newestLikes.length).toBe(1);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].login).toBe(newUser.login);
      expect(postResponse2.body.extendedLikesInfo.newestLikes[0].userId).toBe(newUser.id);

      const likeActions2 = Array.from({ length: 1 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ likeStatus: LikeType.Dislike }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions2);

      const postResponse3 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse3.body.extendedLikesInfo.likesCount).toBe(0);
      expect(postResponse3.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(postResponse3.body.extendedLikesInfo.myStatus).toBe(LikeType.Dislike);
      expect(postResponse3.body.extendedLikesInfo.newestLikes.length).toBe(0);

      const likeActions3 = Array.from({ length: 1 }).map(_ => req
        .put(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ likeStatus: LikeType.None }).expect(HttpStatuses.NoContent));

      await Promise.all(likeActions3);

      const postResponse4 = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(HttpStatuses.Success);

      expect(postResponse4.body.extendedLikesInfo.likesCount).toBe(0);
      expect(postResponse4.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(postResponse4.body.extendedLikesInfo.myStatus).toBe(LikeType.None);
      expect(postResponse4.body.extendedLikesInfo.newestLikes.length).toBe(0);
    });
  });
});
