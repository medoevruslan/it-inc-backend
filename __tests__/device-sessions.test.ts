import { MongoMemoryServer } from 'mongodb-memory-server';
import { addUser, req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { db } from '../src/db/mongoDb';
import { JwtService } from '../src/service/jwtService';
import { DeviceAuthSessionsRepository } from '../src/repository/deviceAuthSessionsRepository';
import { HttpStatuses } from '../src/shared/enums';
import { DeviceSessionsService } from '../src/service/deviceSessionsService';
import { OutputDeviceSessionType } from '../src/input-output-types/device-session-types';


jest.setTimeout(100000000);


describe('tests for device sessions', () => {

  let mongoServer: MongoMemoryServer;
  const codedAuth = toBase64(SETTINGS.ADMIN_AUTH);

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await db.run(uri);
  });

  afterAll(async () => {
    await db.close();
    await mongoServer.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });


  const deviceAuthSessionsRepository = new DeviceAuthSessionsRepository();
  const jwtService = new JwtService();

  const deviceSessionsService = new DeviceSessionsService(deviceAuthSessionsRepository, jwtService);

  it('should login and add device sessions', async () => {
    const sessions1 = await db.getCollections().deviceAuthSessions.find().toArray();

    expect(sessions1.length).toBe(0);

    const user = await addUser(codedAuth);

    const loginRequests = Array.from({ length: 4 }).map((_, idx) => {
      return req.post(`${SETTINGS.PATH.AUTH}/login`).send({
        loginOrEmail: user.login,
        password: user.password,
      }).set('User-Agent', `Custom-${idx}`).expect(HttpStatuses.Success);
    });

    const loginResponses = await Promise.all(loginRequests);

    const cookies = loginResponses[0].header['set-cookie'][0].split(';')[0];

    const resSessions = await req.get(`${SETTINGS.PATH.SECURITY}/devices`).set('Cookie', cookies).expect(HttpStatuses.Success);

    expect(resSessions.body.length).toBe(4);
  });
  it('should refresh token for current device ', async () => {
    await db.dropCollections();
    const sessionCount = 4;

    const user = await addUser(codedAuth);

    const loginRequests = Array.from({ length: sessionCount }).map((_, idx) => {
      return req.post(`${SETTINGS.PATH.AUTH}/login`).send({
        loginOrEmail: user.login,
        password: user.password,
      }).set('User-Agent', `Custom-${idx}`).expect(HttpStatuses.Success);
    });

    const loginResponses = await Promise.all(loginRequests);

    const loginResponseCookies = loginResponses[0].header['set-cookie'][0].split(';')[0];

    const deviceSessionsBeforeRefresh = await req.get(`${SETTINGS.PATH.SECURITY}/devices`).set('Cookie', loginResponseCookies).expect(HttpStatuses.Success);

    await new Promise(res => setTimeout(res, 2000));

    const resRefreshToken = await req.post(`${SETTINGS.PATH.AUTH}/refresh-token`).set('Cookie', loginResponseCookies).expect(HttpStatuses.Success);
    const refreshTokeResponseCookies = resRefreshToken.header['set-cookie'][0].split(';')[0];

    const deviceSessionsAfterRefresh = await req.get(`${SETTINGS.PATH.SECURITY}/devices`).set('Cookie', refreshTokeResponseCookies).expect(HttpStatuses.Success);

    const deviceSession1BeforeRefresh: OutputDeviceSessionType = deviceSessionsBeforeRefresh.body[0];
    const deviceSession1AfterRefresh: OutputDeviceSessionType = deviceSessionsAfterRefresh.body[0];

    expect(resRefreshToken.body.accessToken).toBeDefined();

    expect(deviceSession1BeforeRefresh.deviceId).toBe(deviceSession1AfterRefresh.deviceId);
    expect(deviceSession1BeforeRefresh.title).toBe(deviceSession1AfterRefresh.title);
    expect(deviceSession1BeforeRefresh.ip).toBe(deviceSession1AfterRefresh.ip);
    expect(deviceSession1BeforeRefresh.lastActiveDate).not.toBe(deviceSession1AfterRefresh.lastActiveDate);
  });
  it('should not refresh token for current device because invalid refresh token', async () => {
    await db.dropCollections();
    const sessionCount = 4;

    const user = await addUser(codedAuth);

    const loginRequests = Array.from({ length: sessionCount }).map((_, idx) => {
      return req.post(`${SETTINGS.PATH.AUTH}/login`).send({
        loginOrEmail: user.login,
        password: user.password,
      }).set('User-Agent', `Custom-${idx}`).expect(HttpStatuses.Success);
    });

    const loginResponses = await Promise.all(loginRequests);

    const loginResponseCookies = loginResponses[0].header['set-cookie'][0].split(';')[0];

    await new Promise(res => setTimeout(res, 2000));

    const resRefreshToken1 = await req.post(`${SETTINGS.PATH.AUTH}/refresh-token`).set('Cookie', loginResponseCookies).expect(HttpStatuses.Success);
    expect(resRefreshToken1.body.accessToken).toBeDefined();

    const resRefreshToken2 = await req.post(`${SETTINGS.PATH.AUTH}/refresh-token`).set('Cookie', loginResponseCookies).expect(HttpStatuses.Unauthorized);
  });
  it('should logout and delete session', async () => {
    await db.dropCollections();
    const sessionCount = 4;

    const user = await addUser(codedAuth);

    const loginRequests = Array.from({ length: sessionCount }).map((_, idx) => {
      return req.post(`${SETTINGS.PATH.AUTH}/login`).send({
        loginOrEmail: user.login,
        password: user.password,
      }).set('User-Agent', `Custom-${idx}`).expect(HttpStatuses.Success);
    });

    const loginResponses = await Promise.all(loginRequests);

    const loginResponseCookies = loginResponses[0].header['set-cookie'][0].split(';')[0];

    await new Promise(res => setTimeout(res, 2000));

    const resRefreshToken1 = await req.post(`${SETTINGS.PATH.AUTH}/logout`).set('Cookie', loginResponseCookies).expect(HttpStatuses.Success);
    expect(resRefreshToken1.body.accessToken).toBeDefined();

    const resRefreshToken2 = await req.post(`${SETTINGS.PATH.AUTH}/refresh-token`).set('Cookie', loginResponseCookies).expect(HttpStatuses.Unauthorized);
  });
});