import { DeviceAuthSessionsRepository } from '../repository/deviceAuthSessionsRepository';
import { JwtService } from './jwtService';
import { ResultStatus } from '../shared/enums';
import { DeviceAuthSessionsDbType, DeviceAuthSessionsUpdateType } from '../db/device-auth-sessions-db-type';
import { ObjectId } from 'mongodb';
import { Result } from '../shared/types';
import { sessionsMapper } from '../mapping/sessionsMapper';
import { OutputDeviceSessionType } from '../input-output-types/device-session-types';

export class DeviceSessionsService {

  public constructor(protected deviceAuthSessionsRepository: DeviceAuthSessionsRepository, protected jwtService: JwtService) {
  }

  public async create(data: DeviceAuthSessionsDbType) {
    const { deviceId, iat, deviceName, ip, exp, userId } = data;
    return this.deviceAuthSessionsRepository.add({ deviceId, userId, iat, deviceName, ip, exp });
  }

  public async update(data: DeviceAuthSessionsUpdateType) {
    return this.deviceAuthSessionsRepository.update(data);
  }

  public async findSessionsByUserId(userId: string): Promise<Result<OutputDeviceSessionType[]>> {
    if (!ObjectId.isValid(userId)) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'User id is not valid',
        extensions: [],
        data: null,
      };
    }

    const result = await this.deviceAuthSessionsRepository.findByUserId(userId);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: result.map(sessionsMapper.mapSessionsToOutputType),
    };
  }

  public async findSessionByDeviceIdAndIat(deviceId: string, iat: number) {
    const res = await this.deviceAuthSessionsRepository.findByDeviceIdAndIat(deviceId, iat);

    if (!res) {
      console.log(`findSessionByDeviceIdAndIat bad result: ${res}`);
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `no session found for device: ${deviceId}`,
        extensions: [],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: res,
    };
  }

  public async deleteSessionByDeviceId(deviceId: string) {
    return await this.deviceAuthSessionsRepository.delete(deviceId);
  }

  public async deleteSessionsExceptForCurrent(userId: string, deviceId: string) {
    const isDeleted = await this.deviceAuthSessionsRepository.deleteByUserId(userId, { skip: { deviceId } });

    if (!isDeleted) {
      console.log('deleteSessionsExceptForCurrent: delete sessions error');
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `user id is not valid`,
        extensions: [],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: true,
    };
  }
}