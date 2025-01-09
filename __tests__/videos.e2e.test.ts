import { req } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { dataset1 } from './datasets';
import { db, setDB } from '../src/db/db';
import { InputVideoType, Resolutions } from '../src/input-output-types/video-types';

describe('test for /videos', () => {
  beforeEach(() => {
    setDB();
  });

  it('should clear database', async () => {
    setDB(dataset1);

    expect(db.videos.length).toBe(1);

    const res = await req.delete(SETTINGS.PATH.TESTING + '/').expect(204);

    expect(db.videos.length).toBe(0);
  });

  it('should get empty array', async () => {
    const res = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    expect(res.body.length).toBe(0);
  });

  it('should get not empty array', async () => {
    setDB(dataset1);

    const res = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0]).toEqual(dataset1.videos[0]);
  });

  it('should create an video and return OutputVideoType', async () => {
    const newVideo: Partial<InputVideoType> = {
      author: 'a',
      title: 't',
      availableResolutions: [Resolutions.P1080],
    };

    const res = await req.post(SETTINGS.PATH.VIDEOS).send(newVideo).expect(201);

    expect(res.body.availableResolutions).toEqual(newVideo.availableResolutions);
    expect(res.body.title).toEqual(newVideo.title);
    expect(res.body.minAgeRestriction).toBeNull();
    expect(res.body.canBeDownloaded).toBeFalsy();
  });

  it('should not create video and return minAgeRestriction field error', async () => {
    const newVideo: Partial<InputVideoType> = {
      author: 'a',
      title: 't',
      minAgeRestriction: 20,
      availableResolutions: [Resolutions.P1080],
    };

    const res = await req.post(SETTINGS.PATH.VIDEOS).send(newVideo).expect(400);

    expect(res.body.errorsMessages[0].field).toEqual('minAgeRestriction');
    expect(res.body.errorsMessages[0].message).toEqual('minAgeRestriction should be in range 1 to 18 include');
  });

  it('should not create video and return minAgeRestriction field error not a number', async () => {
    const newVideo: any = {
      author: 'a',
      title: 't',
      minAgeRestriction: 'random',
      availableResolutions: [Resolutions.P1080],
    };

    const res = await req.post(SETTINGS.PATH.VIDEOS).send(newVideo).expect(400);

    expect(res.body.errorsMessages[0].field).toEqual('minAgeRestriction');
    expect(res.body.errorsMessages[0].message).toEqual('minAgeRestriction should be a number');
  });

  it('should not create video and return title field error', async () => {
    const newVideo: Partial<InputVideoType> = {
      author: 'a'.repeat(21),
      title: 't',
      availableResolutions: [Resolutions.P1080],
    };

    const res = await req.post(SETTINGS.PATH.VIDEOS).send(newVideo).expect(400);

    expect(res.body.errorsMessages[0].field).toEqual('author');
    expect(res.body.errorsMessages[0].message).toEqual('author name should be equal or less than 20 chars');
  });

  it("shouldn't find video", async () => {
    setDB(dataset1);
    const res = await req.get(SETTINGS.PATH.VIDEOS + '/2').expect(404);
  });

  it('should find video', async () => {
    setDB(dataset1);

    const resVideos = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    const idToFind = resVideos.body[0].id;

    const res = await req.get(SETTINGS.PATH.VIDEOS + '/' + idToFind).expect(200);
  });

  it('should update video metadata', async () => {
    setDB(dataset1);

    const resVideos1 = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    const video = resVideos1.body[0];

    const newTitle = 'updatedTitle';

    expect(dataset1.videos[0].title).not.toEqual(newTitle);

    const resVideos2 = await req
      .put(SETTINGS.PATH.VIDEOS + '/' + video.id)
      .send({ ...video, title: newTitle })
      .expect(204);

    expect(dataset1.videos[0].title).toEqual(newTitle);
  });

  it('should not update video metadata', async () => {
    setDB(dataset1);

    const idToUpdate = Math.random();

    const res = await req
      .put(SETTINGS.PATH.VIDEOS + '/' + idToUpdate)
      .send(dataset1.videos[0])
      .expect(404);
  });

  it('should not update video metadata with bad title data', async () => {
    setDB(dataset1);

    const resVideos1 = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    const video = resVideos1.body[0];

    const resVideos2 = await req
      .put(SETTINGS.PATH.VIDEOS + '/' + video.id)
      .send({ ...video, title: null })
      .expect(400);
  });

  it('should not update video metadata with bad author data', async () => {
    setDB(dataset1);

    const resVideos1 = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    const video = resVideos1.body[0];

    const resVideos2 = await req
      .put(SETTINGS.PATH.VIDEOS + '/' + video.id)
      .send({ ...video, author: null })
      .expect(400);
  });

  it('should delete video', async () => {
    setDB(dataset1);

    const resVideos1 = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    const idToDelete = resVideos1.body[0].id;

    const res = await req.delete(SETTINGS.PATH.VIDEOS + '/' + idToDelete).expect(204);

    const resVideos2 = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    expect(resVideos2.body.length).toBe(0);
  });
});
