import { DeviceAuthSessionsDbType } from '../db/device-auth-sessions-db-type';
import { db } from '../db/mongoDb';


export class DeviceAuthSessionsRepository {
  async add(data: DeviceAuthSessionsDbType){
    const result = await db.getCollections().deviceAuthSessions.insertOne(data)
    return result.insertedId
  }

  async findAll(){
      return db.getCollections().deviceAuthSessions.find().toArray();
  }

  async findByDeviceId(dId: string) {
    return db.getCollections().deviceAuthSessions.find({ dId })
  }

  async findByUserId(userId: string) {
    return db.getCollections().deviceAuthSessions.find({userId})
  }

  async delete(deviceId: string){
    const result = await db.getCollections().deviceAuthSessions.deleteOne({ dId: deviceId })
    return result.deletedCount === 1
  }
}