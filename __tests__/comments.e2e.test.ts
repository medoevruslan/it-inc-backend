import { db } from '../src/db/mongoDb';
import { SETTINGS } from '../src/settings';
import { addUser, req, toBase64 } from './test-helpers';
import { comment1, post1 } from './datasets';
import { InputUserType, OutputUserAccountType } from '../src/input-output-types/user-types';
import { HttpStatuses } from '../src/shared/enums';
import { CommentInputType } from '../src/input-output-types/comment-types';
import { ObjectId } from 'mongodb';

jest.setTimeout(100000000);

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

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const commentsResponse = await req
        .get(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .expect(HttpStatuses.Success);

      expect(commentsResponse.body.id).toBe(comment1._id.toString());
      expect(commentsResponse.body.content).toBe(comment1.content);
      expect(commentsResponse.body.createdAt).toBe(comment1.createdAt.toISOString());
      expect(commentsResponse.body.commentatorInfo.userLogin).toBe(comment1.commentatorInfo.userLogin);
      expect(commentsResponse.body.commentatorInfo.userId).toBe(comment1.commentatorInfo.userId);
    });

    it('should get created comments ', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser = await addUser(codedAuth);

      const newComments: CommentInputType[] = Array.from({ length: 13 }).map((_, idx) => ({
        postId: post1._id.toString(),
        content: 'a'.repeat(20) + idx,
        userId: newUser.id,
      }))

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const promises = newComments.map(newComment => req.post(`${SETTINGS.PATH.POSTS}/${post1._id}/comments`).set('Authorization', `Bearer ${loginResponse.body.accessToken}`).send(newComment).expect(201))

      await Promise.all(promises)

      const commentsResponse = await req.get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/comments/`).expect(HttpStatuses.Success);

      expect(commentsResponse.body.totalCount).toBe(13)
      expect(commentsResponse.body.pagesCount).toBe(2)

    })

    it('should get 404', async () => {
      await db.dropCollections();
      const commentsResponse = await req.get(`${SETTINGS.PATH.POSTS}/${new ObjectId()}/comments/`).expect(HttpStatuses.NotFound);
    });
  });
  describe('create comments', () => {
    it('should create new comment', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const newComment: CommentInputType = {
        postId: post1._id.toString(),
        content: 'a'.repeat(20),
        userId: newUser.id,
      };

      const createCommentResponse = await req.post(`${SETTINGS.PATH.POSTS}/${post1._id}/comments`).set('Authorization', `Bearer ${loginResponse.body.accessToken}`).send(newComment).expect(201);

      expect(createCommentResponse.body.content).toBe(newComment.content);
      expect(createCommentResponse.body.commentatorInfo).toEqual({ userLogin: newUser.login, userId: newUser.id });

      const getCommentsResponse = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/comments/`)
        .expect(HttpStatuses.Success);

      expect(getCommentsResponse.body.items.length).toBe(1);
      expect(getCommentsResponse.body.items[0].content).toBe(newComment.content)

    });
    it('should not create new comment because invalid body', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const newComment: CommentInputType = {
        postId: post1._id.toString(),
        content: 'short',
        userId: newUser.id,
      };

      const createCommentResponse = await req.post(`${SETTINGS.PATH.POSTS}/${post1._id}/comments`).set('Authorization', `Bearer ${loginResponse.body.accessToken}`).send(newComment).expect(400);

    });
  });
  describe('delete comments', () => {
    it('should delete comment by id', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const newComment: CommentInputType = {
        postId: post1._id.toString(),
        content: 'a'.repeat(20),
        userId: newUser.id,
      };

      const createCommentResponse = await req.post(`${SETTINGS.PATH.POSTS}/${post1._id}/comments`).set('Authorization', `Bearer ${loginResponse.body.accessToken}`).send(newComment).expect(201);

      const getCommentsResponse1 = await req
        .get(`${SETTINGS.PATH.POSTS}/${newComment.postId}/comments/`)
        .expect(HttpStatuses.Success);

      expect(getCommentsResponse1.body.items.length).toBe(1);

      const commentId = createCommentResponse.body.id;

      const deleteCommentsResponse = await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(HttpStatuses.NoContent);

      const deleteCommentsResponse2 = await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(HttpStatuses.NotFound);

      const getCommentsResponse2 = await req
        .get(`${SETTINGS.PATH.POSTS}/${comment1.postId}/comments/`)
        .expect(HttpStatuses.NotFound);
    });
    it('should not delete because unauthorized', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const deleteCommentsResponse = await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .expect(HttpStatuses.Unauthorized);
    });
    it('should not delete because not found', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(200);

      const deleteCommentsResponse = await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${new ObjectId().toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(HttpStatuses.NotFound);
    });
  });
  describe('update comments', () => {
    it('should update existent comment', async () => {
      await db.dropCollections();
      await db.seed({ posts: [post1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const newComment: CommentInputType = {
        postId: post1._id.toString(),
        content: 'a'.repeat(20),
        userId: newUser.id,
      };

      const createCommentResponse = await req.post(`${SETTINGS.PATH.POSTS}/${post1._id}/comments`).set('Authorization', `Bearer ${loginResponse.body.accessToken}`).send(newComment).expect(201);

      const commentId = createCommentResponse.body.id;

      const commentUpdate = { content: 'a'.repeat(20) };
      const updateResponse = await req
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(commentUpdate)
        .expect(HttpStatuses.NoContent);

      const commentsResponse = await req
        .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .expect(HttpStatuses.Success);

      expect(commentsResponse.body.content).not.toBe(comment1.content);
      expect(commentsResponse.body.content).toBe(commentUpdate.content);
    });
    it('should not update existent comment because to short', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const commentUpdate = { content: 'a'.repeat(19) };
      const updateResponse = await req
        .put(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(commentUpdate)
        .expect(HttpStatuses.BadRequest);

      expect(updateResponse.body.errorsMessages[0]).toEqual({
        field: 'content',
        message: 'name should be less than 300 chars and more than 20',
      });
    });
    it('should not update existent comment because to long', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(HttpStatuses.Success);

      const commentUpdate = { content: 'a'.repeat(301) };
      const updateResponse = await req
        .put(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(commentUpdate)
        .expect(HttpStatuses.BadRequest);

      expect(updateResponse.body.errorsMessages[0]).toEqual({
        field: 'content',
        message: 'name should be less than 300 chars and more than 20',
      });
    });
    it('should not update because unauthorized', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const deleteCommentsResponse = await req
        .put(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .expect(HttpStatuses.Unauthorized);
    });
  });
});
