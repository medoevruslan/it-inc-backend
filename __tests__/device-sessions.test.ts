import { MongoMemoryServer } from 'mongodb-memory-server';
import { addUser, req, toBase64 } from './test-helpers';
import { SETTINGS } from '../src/settings';
import { db } from '../src/db/mongoDb';
import { JwtService } from '../src/service/jwtService';
import { DeviceAuthSessionsRepository } from '../src/repository/deviceAuthSessionsRepository';
import { HttpStatuses } from '../src/shared/enums';
import { DeviceSessionsService } from '../src/service/deviceSessionsService';


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
      return  req.post(`${SETTINGS.PATH.AUTH}/login`).send({
        loginOrEmail: user.login,
        password: user.password,
      }).set('User-Agent', `Custom-${idx}`).expect(HttpStatuses.Success);
    })

    const loginResponses = await Promise.all(loginRequests)

    const cookies = loginResponses[0].header['set-cookie'][0].split(';')[0];

    const resSessions = await req.get(`${SETTINGS.PATH.SECURITY}/devices`).set('Cookie', cookies).expect(HttpStatuses.Success);

    console.log(resSessions.body);

    expect(resSessions.body.length).toBe(4);
  });
  it ('should re-auth by device id ', async () => {

  })
});