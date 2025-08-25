import { DeviceAuthSessionsDbType, DeviceAuthSessionsUpdateType } from '../db/device-auth-sessions-db-type';
import { db } from '../db/mongoDb';
import { injectable } from 'inversify';
import { DeviceAuthSessionsDbModel } from '../model/DeviceAuthSessionsDbModel';
import exp from 'node:constants';

@injectable()
export class DeviceAuthSessionsRepository {
  async add(data: DeviceAuthSessionsDbType){
    const deviceAuthSessionsDbModel = new DeviceAuthSessionsDbModel(data)
    await deviceAuthSessionsDbModel.save()
    return deviceAuthSessionsDbModel._id.toString();
  }

  async update(data: DeviceAuthSessionsUpdateType) {
    const { deviceId, iat, iatUpdated, expUpdated } = data
    const deviceAuthSessionsDbModel = await DeviceAuthSessionsDbModel.findOne({ deviceId, iat })
    if(!deviceAuthSessionsDbModel) return false

    deviceAuthSessionsDbModel.iat = iatUpdated;
    deviceAuthSessionsDbModel.exp = expUpdated;

    await deviceAuthSessionsDbModel.save()

    return true
  }

  async findAll(){
    return DeviceAuthSessionsDbModel.find().lean()
  }

  async findByDeviceIdAndIat(deviceId: string, iat: number) {
    return DeviceAuthSessionsDbModel.findOne({ deviceId, iat })
  }

  async findByUserId(userId: string) {
    return DeviceAuthSessionsDbModel.find({ userId }).lean()
  }

  async delete(deviceId: string){
    const result = await DeviceAuthSessionsDbModel.findByIdAndDelete(deviceId)
    return result !== null
  }

  async deleteByUserId(userId: string, options: { skip: {deviceId: string} }) {
    const result = await DeviceAuthSessionsDbModel.deleteMany({ userId, deviceId: { $ne: options.skip.deviceId } })
    return result.deletedCount > 0
  }
}