import { req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { DBType } from '../src/db/db';
import { blog1, post1, video1 } from './datasets';
import { BlogDbType } from '../src/db/blog-db-type';
import { InputBlogType, UpdateBlogType } from '../src/input-output-types/blog-types';
import { runDb, setMongoDB } from '../src/db/mongoDb';
import { ObjectId } from 'mongodb';
import { InputPostType } from '../src/input-output-types/post-types';

(async () => await runDb(SETTINGS.MONGO_URL))();

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
    await setMongoDB();
    const res = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(res.body.items.length).toBe(0);
  });

  it('should get not empty array', async () => {
    await setMongoDB(dataset1);

    const res = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(res.body.items.length).toBe(1);
  });

  it('should create multiple blogs and return proper response', async () => {
    await setMongoDB();
    const newBlogs = Array.from({ length: 15 }).map((_, idx) => ({
      name: 'new blog' + idx,
      websiteUrl: 'https://new.some.com',
      description: 'new description' + idx,
    }));

    for (const blog of newBlogs) {
      await req.post(SETTINGS.PATH.BLOGS).set('Authorization', `Basic ${codedAuth}`).send(blog).expect(201);
    }

    const blogsResponse = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(blogsResponse.body.items.length).toBe(10);
    expect(blogsResponse.body.totalCount).toBe(15);
    expect(blogsResponse.body.page).toBe(1);
    expect(blogsResponse.body.pageSize).toBe(10);
    expect(blogsResponse.body.pagesCount).toBe(2);
  });

  it('should set default query parameters', async () => {
    await setMongoDB();

    const res = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(res.body.items.length).toBe(0);
    expect(res.body.totalCount).toBe(0);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
    expect(res.body.pagesCount).toBe(0);
  });

  it('should create new blog', async () => {
    await setMongoDB();
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

    expect(newBlog.name).toEqual(res.body.name);
    expect(newBlog.websiteUrl).toEqual(res.body.websiteUrl);
    expect(newBlog.description).toEqual(res.body.description);
  });

  it('should create new post by existing blogId', async () => {
    await setMongoDB();
    const initialBlogId = new ObjectId();
    const newBlog: Partial<BlogDbType> = {
      _id: initialBlogId,
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const resCreatedBlog = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newBlog)
      .expect(201);

    expect(initialBlogId.toString()).toBe(resCreatedBlog.body.id);

    const newPost: Partial<InputPostType> = {
      title: 'new title',
      content: 'new content',
      shortDescription: 'new shortDescription',
    };

    const resCreatedPost = await req
      .post(`${SETTINGS.PATH.BLOGS}/${initialBlogId.toString()}/posts`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newPost)
      .expect(201);

    expect(resCreatedPost.body.blogId).toEqual(initialBlogId.toString());
    expect(resCreatedPost.body.title).toEqual(newPost.title);
    expect(resCreatedPost.body.shortDescription).toEqual(newPost.shortDescription);
    expect(resCreatedPost.body.content).toEqual(newPost.content);
  });

  it('should find blog by searchNameTerm', async () => {
    await setMongoDB();
    const newBlog: Partial<BlogDbType> = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const resCreate = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newBlog)
      .expect(201);

    const resFinAll = await req.get(SETTINGS.PATH.BLOGS).query({ searchNameTerm: 'new' }).expect(200);

    expect(resFinAll.body.items.length).toBe(1);
  });

  it('should not find any blog by searchNameTerm', async () => {
    await setMongoDB();
    const newBlog: Partial<BlogDbType> = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const resCreate = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newBlog)
      .expect(201);

    const resFinAllWithQuery = await req.get(SETTINGS.PATH.BLOGS).query({ searchNameTerm: 'newsss' }).expect(200);
    const resFinAll = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(resFinAll.body.items.length).toBe(1);
    expect(resFinAllWithQuery.body.items.length).toBe(0);
  });

  it('should sortBy name ascending', async () => {
    await setMongoDB();
    const aNewBlog: Partial<BlogDbType> = {
      name: 'a blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const bNewBlog: Partial<BlogDbType> = {
      name: 'b blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const cNewBlog: Partial<BlogDbType> = {
      name: 'c blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const aRes = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(aNewBlog)
      .expect(201);
    const bRes = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(bNewBlog)
      .expect(201);
    const cRes = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(cNewBlog)
      .expect(201);
    const resFinAllWithQuery = await req
      .get(SETTINGS.PATH.BLOGS)
      .query({ sortBy: 'name', sortDirection: 'asc' })
      .expect(200);

    expect(resFinAllWithQuery.body.items.length).toBe(3);
    expect(resFinAllWithQuery.body.items[0].name).toBe(aNewBlog.name);
    expect(resFinAllWithQuery.body.items[1].name).toBe(bNewBlog.name);
    expect(resFinAllWithQuery.body.items[2].name).toBe(cNewBlog.name);
  });

  it('should sortBy name descending', async () => {
    await setMongoDB();
    const aNewBlog: Partial<BlogDbType> = {
      name: 'a blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const bNewBlog: Partial<BlogDbType> = {
      name: 'b blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const cNewBlog: Partial<BlogDbType> = {
      name: 'c blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const aRes = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(aNewBlog)
      .expect(201);
    const bRes = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(bNewBlog)
      .expect(201);
    const cRes = await req
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(cNewBlog)
      .expect(201);
    const resFinAllWithQuery = await req
      .get(SETTINGS.PATH.BLOGS)
      .query({ sortBy: 'name', sortDirection: 'desc' })
      .expect(200);

    expect(resFinAllWithQuery.body.items.length).toBe(3);
    expect(resFinAllWithQuery.body.items[0].name).toBe(cNewBlog.name);
    expect(resFinAllWithQuery.body.items[1].name).toBe(bNewBlog.name);
    expect(resFinAllWithQuery.body.items[2].name).toBe(aNewBlog.name);
  });

  it('should get posts by blogId', async () => {
    await setMongoDB(dataset1);

    const existingBlogId = dataset1.blogs[0]._id.toString();

    const newPost: Partial<InputPostType> = {
      title: 'new title',
      content: 'new content',
      shortDescription: 'new shortDescription',
    };

    const resCreatedPost = await req
      .post(`${SETTINGS.PATH.BLOGS}/${existingBlogId}/posts`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(newPost)
      .expect(201);

    const resPosts = await req.get(`${SETTINGS.PATH.BLOGS}/${existingBlogId}/posts`).expect(200);

    expect(resPosts.body.items.length).toBe(1);
  });

  it('should not get posts by wrong blogId', async () => {
    await setMongoDB(dataset1);

    const nonExistingBlogId = new ObjectId().toString();
    const resPosts = await req.get(`${SETTINGS.PATH.BLOGS}/${nonExistingBlogId}/posts`).expect(404);
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
    await setMongoDB();

    const newBlog: any = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const res = await req.post(SETTINGS.PATH.BLOGS).send(newBlog).expect(401);
    const resData = await req.get(SETTINGS.PATH.BLOGS).expect(200);
    expect(resData.body.items.length).toEqual(0);
  });

  it('should throw auth error on create new blog because wrong auth', async () => {
    const newBlog: any = {
      name: 'new blog',
      websiteUrl: 'https://new.some.com',
      description: 'new description',
    };

    const res = await req.post(SETTINGS.PATH.BLOGS).set('Authorization', `Basic wrongauth`).send(newBlog).expect(401);
    const resData = await req.get(SETTINGS.PATH.BLOGS).expect(200);
    expect(resData.body.items.length).toEqual(0);
  });

  it('should delete blog by id', async () => {
    await setMongoDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body.items[0].id;

    const response2 = await req
      .delete(`${SETTINGS.PATH.BLOGS}/${blogId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(204);

    const resData = await req.get(SETTINGS.PATH.BLOGS).expect(200);
    expect(resData.body.items.length).toEqual(0);
  });

  it('should not delete blog by wrong id', async () => {
    await setMongoDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(response1.body.items.length).toEqual(1);

    const response2 = await req
      .delete(`${SETTINGS.PATH.BLOGS}/${22}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(400);

    const resData = await req.get(SETTINGS.PATH.BLOGS).expect(200);
    expect(resData.body.items.length).toEqual(1);
  });

  it('should not delete blog because unauthorized', async () => {
    await setMongoDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body.items[0].id;

    const response2 = await req.delete(`${SETTINGS.PATH.BLOGS}/${blogId}`).expect(401);

    const resData = await req.get(SETTINGS.PATH.BLOGS).expect(200);
    expect(resData.body.items.length).toEqual(1);
  });

  it('should update blog by id', async () => {
    await setMongoDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body.items[0].id;

    const update: Partial<UpdateBlogType['update']> = {
      name: 'updatedName',
      websiteUrl: 'https://updated.some.com',
      description: 'updatedDescription',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.BLOGS}/${blogId}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(204);

    const resData = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(resData.body.items[0].name).toEqual(update.name);
    expect(resData.body.items[0].websiteUrl).toEqual(update.websiteUrl);
    expect(resData.body.items[0].description).toEqual(update.description);
  });

  it('should not update blog by id because partial update data', async () => {
    await setMongoDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body.items[0].id;

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
    await setMongoDB(dataset1);

    const update: Partial<UpdateBlogType['update']> = {
      name: 'updatedName',
      websiteUrl: 'https://some.com',
      description: 'updatedDescription',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.BLOGS}/${22}`)
      .set('Authorization', `Basic ${codedAuth}`)
      .send(update)
      .expect(400);
  });

  it('should not update blog by id because unauthorized', async () => {
    await setMongoDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body.items[0].id;

    const update: Partial<UpdateBlogType['update']> = {
      name: 'updatedName',
      websiteUrl: ' https://updated.some.com',
      description: 'updatedDescription',
    };

    const response2 = await req.put(`${SETTINGS.PATH.BLOGS}/${blogId}`).send(update).expect(401);

    const resData = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(resData.body.items[0].name).not.toEqual(update.name);
    expect(resData.body.items[0].websiteUrl).not.toEqual(update.websiteUrl);
    expect(resData.body.items[0].description).not.toEqual(update.description);
  });

  it('should not update blog by id because wrong auth', async () => {
    await setMongoDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body.items[0].id;

    const update: Partial<UpdateBlogType['update']> = {
      name: 'updatedName',
      websiteUrl: ' https://updated.some.com',
      description: 'updatedDescription',
    };

    const response2 = await req
      .put(`${SETTINGS.PATH.BLOGS}/${blogId}`)
      .set('Authorization', `Basic wrongauth`)
      .send(update)
      .expect(401);

    const resData = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    expect(resData.body.items[0].name).not.toEqual(update.name);
    expect(resData.body.items[0].websiteUrl).not.toEqual(update.websiteUrl);
    expect(resData.body.items[0].description).not.toEqual(update.description);
  });

  it('should return error if :id from uri param not found', async () => {
    await setMongoDB(dataset1);

    const response1 = await req.get(SETTINGS.PATH.BLOGS).expect(200);

    const blogId = response1.body.items[0].id;

    const response2 = await req
      .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
      .set('Authorization', `Basic ${codedAuth}`)
      .expect(404);
  });
});
