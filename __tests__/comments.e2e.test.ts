import { db } from '../src/db/mongoDb';
import { SETTINGS } from '../src/settings';
import { req, toBase64 } from './test-helpers';
import { comment1, post1 } from './datasets';
import { InputUserType, OutputUserType } from '../src/input-output-types/user-types';
import { HttpStatuses } from '../src/shared/enums';
import { CommentInputType } from '../src/input-output-types/comment-types';

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
        .expect(200);

      const commentsResponse = await req
        .get(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(commentsResponse.body.id).toBe(comment1._id.toString());
      expect(commentsResponse.body.content).toBe(comment1.content);
      expect(commentsResponse.body.createdAt).toBe(comment1.createdAt.toISOString());
      expect(commentsResponse.body.commentatorInfo.userLogin).toBe(comment1.commentatorInfo.userLogin);
      expect(commentsResponse.body.commentatorInfo.userId).toBe(comment1.commentatorInfo.userId);
    });
    it('should not get comments because unauthorized ', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const commentsResponse = await req.get(`${SETTINGS.PATH.COMMENTS}/1`).expect(401);
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
        .expect(200);

      const newComment: CommentInputType = {
        postId: post1._id.toString(),
        content: 'a'.repeat(20),
        userId: newUser.id,
      };

      const createCommentResponse = await req.post(`${SETTINGS.PATH.POSTS}/${post1._id}/comments`).set('Authorization', `Bearer ${loginResponse.body.accessToken}`).send(newComment).expect(201);

      const getCommentsResponse = await req
        .get(`${SETTINGS.PATH.POSTS}/${post1._id.toString()}/comments/`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(getCommentsResponse.body.items.length).toBe(1);
      expect(getCommentsResponse.body.items[0].content).toBe(newComment.content)

    });
  });
  describe('delete comments', () => {
    it('should delete comment by id', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(200);

      const getCommentsResponse1 = await req
        .get(`${SETTINGS.PATH.POSTS}/${comment1.postId}/comments/`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(getCommentsResponse1.body.items.length).toBe(1);

      const deleteCommentsResponse = await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(HttpStatuses.NoContent);

      const getCommentsResponse2 = await req
        .get(`${SETTINGS.PATH.POSTS}/${comment1.postId}/comments/`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(getCommentsResponse2.body.items.length).toBe(0);
    });
    it('should not delete because unauthorized', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const deleteCommentsResponse = await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .expect(HttpStatuses.Unauthorized);
    });
  });
  describe('update comments', () => {
    it('should update existent comment', async () => {
      await db.dropCollections();
      await db.seed({ comments: [comment1] });

      const newUser = await addUser(codedAuth);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({ loginOrEmail: newUser.login, password: newUser.password })
        .expect(200);

      const commentUpdate = { content: 'a'.repeat(20) };
      const updateResponse = await req
        .put(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(commentUpdate)
        .expect(204);

      const commentsResponse = await req
        .get(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

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
        .expect(200);

      const commentUpdate = { content: 'a'.repeat(19) };
      const updateResponse = await req
        .put(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(commentUpdate)
        .expect(400);

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
        .expect(200);

      const commentUpdate = { content: 'a'.repeat(301) };
      const updateResponse = await req
        .put(`${SETTINGS.PATH.COMMENTS}/${comment1._id.toString()}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(commentUpdate)
        .expect(400);

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

const addUser = async (auth: string): Promise<OutputUserType & { password: string }> => {
  const newUser: Partial<InputUserType> = {
    login: 'newlgn',
    email: 'newwmail@some.com',
    password: 'new password',
  };

  const createUserResponse = await req
    .post(SETTINGS.PATH.USERS)
    .set('Authorization', `Basic ${auth}`)
    .send(newUser)
    .expect(201);

  return { ...createUserResponse.body, password: newUser.password };
};
