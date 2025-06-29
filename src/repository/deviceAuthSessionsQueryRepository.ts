import { DeviceAuthSessionsDbType } from '../db/device-auth-sessions-db-type';
import { db } from '../db/mongoDb';


export class DeviceAuthSessionsQueryRepository {
  async findAll(){
      return db.getCollections().deviceAuthSessions.find().toArray();
  }

  async findByDeviceId(deviceId: string) {
    return db.getCollections().deviceAuthSessions.findOne({ deviceId });
  }

  async findByUserId(userId: string) {
    return db.getCollections().deviceAuthSessions.find({userId}).toArray()
  }

}