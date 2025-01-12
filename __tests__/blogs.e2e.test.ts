import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { db, DBType, setDB } from '../src/db/db';
import { blog1, post1, video1 } from './datasets';
import { BlogDbType } from '../src/db/blog-db-type';
import { InputBlogType } from '../src/input-output-types/blog-types';

describe('tests for /blogs', () => {
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
    const res = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(res.body.length).toBe(0);
  });

  it('should get not empty array', async () => {
    setDB(dataset1);

    const res = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0]).toEqual(dataset1.blogs[0]);
  });

  it('should create new blog', async () => {
    const newBlog: Partial<BlogDbType> = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const res = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newBlog)
      .expect(201);
    expect(res.body.name).toEqual(newBlog.name);
  });

  it('should throw validation error on create new blog', async () => {
    const newBlog: any = {
      name: 333,
      description: '',
      websiteUrl: null,
    };

    const res = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newBlog)
      .expect(400);
    expect(res.body.errorsMessages.length).toEqual(3);
  });

  it('should throw auth error on create new blog', async () => {
    const newBlog: any = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const res = await req.post(SETTINGS.PATH.BLOGS).send(newBlog).expect(401);
    expect(dataset1.blogs.length).toEqual(1);
  });

  it('should throw auth error on create new blog because wrong auth', async () => {
    const newBlog: any = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const res = await req.post(SETTINGS.PATH.BLOGS).set('Authorization', `Basic wrongauth`).send(newBlog).expect(401);
    expect(dataset1.blogs.length).toEqual(1);
  });

  it('should delete blog by id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body[0].id;

    const response2 = await req
      .delete(`${SETTINGS.PATH.BLOGS}/${blogId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(204);

    expect(db.blogs.length).toEqual(0);
  });

  it('should not delete blog by wrong id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(response1.body.length).toEqual(1);

    const response2 = await req
      .delete(`${SETTINGS.PATH.BLOGS}/${22}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(404);

    expect(db.blogs.length).toEqual(1);
  });

  it('should not delete blog because unauthorized', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body[0].id;

    const response2 = await req.delete(`${SETTINGS.PATH.BLOGS}/${blogId}`).expect(401);

    expect(db.blogs.length).toEqual(1);
  });

  it('should update blog by id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body[0].id;

    const update: InputBlogType = {
      name: 'updatedName',
      websiteUrl: 'https://updated.some.com',
      description: 'updatedDescription',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.BLOGS}/${blogId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(204);

    expect(dataset1.blogs[0].name).toEqual(update.name);
    expect(dataset1.blogs[0].websiteUrl).toEqual(update.websiteUrl);
    expect(dataset1.blogs[0].description).toEqual(update.description);
  });

  it('should not update blog by id because partial update data', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body[0].id;

    const update: Partial<InputBlogType> = {
      name: 'updatedName',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.BLOGS}/${blogId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(400);
    expect(response2.body.errorsMessages.length).toBeGreaterThan(0);
  });

  it('should not update blog by id because wrong id', async () => {
    setDB(dataset1);

    const update: InputBlogType = {
      name: 'updatedName',
      websiteUrl: 'https://some.com',
      description: 'updatedDescription',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.BLOGS}/${22}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(404);
  });

  it('should not update blog by id because unauthorized', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body[0].id;

    const update: InputBlogType = {
      name: 'updatedName',
      websiteUrl: ' https://updated.some.com',
      description: 'updatedDescription',
    };

    const response2 = await req.put(`${SETTINGS.PATH.BLOGS}/${blogId}`).send(update).expect(401);

    expect(dataset1.blogs[0].name).not.toEqual(update.name);
    expect(dataset1.blogs[0].websiteUrl).not.toEqual(update.websiteUrl);
    expect(dataset1.blogs[0].description).not.toEqual(update.description);
  });

  it('should not update blog by id because wrong auth', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body[0].id;

    const update: InputBlogType = {
      name: 'updatedName',
      websiteUrl: ' https://updated.some.com',
      description: 'updatedDescription',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.BLOGS}/${blogId}`)
      .set('Authorization', `Basic wrongauth`)
      .send(update)
      .expect(401);

    expect(dataset1.blogs[0].name).not.toEqual(update.name);
    expect(dataset1.blogs[0].websiteUrl).not.toEqual(update.websiteUrl);
    expect(dataset1.blogs[0].description).not.toEqual(update.description);
  });
});
