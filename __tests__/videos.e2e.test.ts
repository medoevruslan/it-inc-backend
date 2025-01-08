import { req } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { dataset1 } from './datasets';
import { setDB } from '../src/db/db';
import { InputVideoType, Resolutions } from '../src/input-output-types/video-types';

describe('test for /videos', () => {
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
    const newVideo: InputVideoType = {
      author: 'a',
      title: 't',
      minAgeRestriction: null,
      canBeDownloaded: true,
      availableResolutions: [Resolutions.P1080],
    };

    const res = await req.post(SETTINGS.PATH.VIDEOS).send(newVideo).expect(201);

    expect(res.body.availableResolutions).toEqual(newVideo.availableResolutions);
    expect(res.body.title).toEqual(newVideo.title);
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

  it('should delete video', async () => {
    setDB(dataset1);

    const resVideos1 = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    const idToDelete = resVideos1.body[0].id;

    const res = await req.delete(SETTINGS.PATH.VIDEOS + '/' + idToDelete).expect(204);

    const resVideos2 = await req.get(SETTINGS.PATH.VIDEOS).expect(200);

    expect(resVideos2.body.length).toBe(0);
  });
});
