import { req } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { db, DBType, setDB } from '../src/db/db';
import { blog1, post1, video1 } from './datasets';
import { PostDbType } from '../src/db/post-db.type';
import { generateIdString } from '../src/shared/utils';
import { PostInputType } from '../src/input-output-types/post-types';
import { BlogDbType } from '../src/db/blog-db-type';
import { BlogInputType } from '../src/input-output-types/blog-types';

describe('tests for /blogs', () => {
  let dataset1: DBType;
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
      websiteUrl: 'new url',
      description: 'new description',
    };

    const res = await req.post(SETTINGS.PATH.BLOGS).send(newBlog).expect(201);
    expect(res.body.name).toEqual(newBlog.name);
  });

  it('should throw validation error on create new blog', async () => {
    const newBlog: any = {
      name: 333,
      description: '',
      websiteUrl: null,
    };

    const res = await req.post(SETTINGS.PATH.BLOGS).send(newBlog).expect(400);
    expect(res.body.errorsMessages.length).toEqual(3);
  });

  it('should delete blog by id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body[0].id;

    const response2 = await req.delete(`${SETTINGS.PATH.BLOGS}/${blogId}`).expect(204);

    expect(db.blogs.length).toEqual(0);
  });

  it('should not delete blog by wrong id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(response1.body.length).toEqual(1);

    const response2 = await req.delete(`${SETTINGS.PATH.BLOGS}/${22}`).expect(404);

    expect(db.blogs.length).toEqual(1);
  });

  it('should update blog by id', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body[0].id;

    const update: BlogInputType = {
      name: 'updatedName',
      websiteUrl: 'updatedWebsiteUrl',
      description: 'updatedDescription',
    };

    const response2 = await req.put(`${SETTINGS.PATH.BLOGS}/${blogId}`).send(update).expect(204);

    expect(dataset1.blogs[0].name).toEqual(update.name);
    expect(dataset1.blogs[0].websiteUrl).toEqual(update.websiteUrl);
    expect(dataset1.blogs[0].description).toEqual(update.description);
  });

  it('should not update blog by id because partial update data', async () => {
    setDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body[0].id;

    const update: Partial<BlogInputType> = {
      name: 'updatedName',
    };

    const response2 = await req.put(`${SETTINGS.PATH.BLOGS}/${blogId}`).send(update).expect(400);
    expect(response2.body.errorsMessages.length).toBeGreaterThan(0);
  });

  it('should not update blog by id because wrong id', async () => {
    setDB(dataset1);

    const update: BlogInputType = {
      name: 'updatedName',
      websiteUrl: 'updatedWebsiteUrl',
      description: 'updatedDescription',
    };

    const response2 = await req.put(`${SETTINGS.PATH.BLOGS}/${22}`).send(update).expect(404);
  });
});
