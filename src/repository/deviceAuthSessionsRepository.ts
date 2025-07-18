import { DeviceAuthSessionsDbType, DeviceAuthSessionsUpdateType } from '../db/device-auth-sessions-db-type';
import { db } from '../db/mongoDb';


export class DeviceAuthSessionsRepository {
  async add(data: DeviceAuthSessionsDbType){
    const result = await db.getCollections().deviceAuthSessions.insertOne(data)
    return result.insertedId
  }

  async update(data: DeviceAuthSessionsUpdateType) {
    const { deviceId, iat, iatUpdated, expUpdated } = data
    const result = await db.getCollections().deviceAuthSessions.updateOne({ deviceId, iat }, { $set: { iat: iatUpdated, exp: expUpdated } })
    return result.matchedCount === 1
  }

  async findAll(){
      return db.getCollections().deviceAuthSessions.find().toArray();
  }

  async findByDeviceIdAndIat(deviceId: string, iat: number) {
    return db.getCollections().deviceAuthSessions.findOne({ deviceId, iat })
  }

  async findByUserId(userId: string) {
    return db.getCollections().deviceAuthSessions.find({userId}).toArray()
  }

  async delete(deviceId: string){
    const result = await db.getCollections().deviceAuthSessions.deleteOne({ deviceId })
    return result.deletedCount === 1
  }

  async deleteByUserId(userId: string, options: { skip: {deviceId: string} }) {
    const result = await db.getCollections().deviceAuthSessions.deleteMany({ userId, deviceId: { $ne: options.skip.deviceId } })
    return result.deletedCount > 0
  }
}