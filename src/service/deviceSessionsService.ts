import { DeviceAuthSessionsRepository } from '../repository/deviceAuthSessionsRepository';
import { sessionsMapper } from '../mapping/sessionsMapper';
import { JwtService } from './jwtService';
import { ResultStatus } from '../shared/enums';
import { DeviceAuthSessionsDbType, DeviceAuthSessionsUpdateType } from '../db/device-auth-sessions-db-type';

export class DeviceSessionsService {

  public constructor(protected deviceAuthSessionsRepository: DeviceAuthSessionsRepository, protected jwtService: JwtService) {
  }

  public async create(data: DeviceAuthSessionsDbType) {
    const { deviceId, iat, deviceName, ip, exp, userId } = data
    return this.deviceAuthSessionsRepository.add({ deviceId, userId, iat, deviceName, ip, exp});
  }

  public async update(data: DeviceAuthSessionsUpdateType ) {
    return this.deviceAuthSessionsRepository.update(data)
  }

  public async findSessionsByTokenPayload(refreshToken: string) {

    const tokenResult = await this.jwtService.verifyToken<{ deviceId: string, iat: number }>(refreshToken);

    if (!tokenResult) {
      console.log(`findSessionsByUserId token bad result: ${tokenResult}`)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `Token is not valid`,
        extensions: [{ field: 'token', message: 'Token is not valid' }],
        data: null,
      };
    }

    const deviceSessionResult = await this.findSessionByDeviceIdAndIat(tokenResult.deviceId, tokenResult.iat)

    if (deviceSessionResult.status !== ResultStatus.Success || !deviceSessionResult.data) {
      return deviceSessionResult
    }

    const result = await this.deviceAuthSessionsRepository.findByUserId(deviceSessionResult.data.userId);
    const mapped = result.map(sessionsMapper.mapSessionsToOutputType);

    return mapped
  }

  public async findSessionByDeviceIdAndIat(deviceId: string, iat: number) {
    const res = await this.deviceAuthSessionsRepository.findByDeviceIdAndIat(deviceId, iat)

    if (!res) {
      console.log(`findSessionByDeviceIdAndIat bad result: ${res}`)
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
    }
  }
}