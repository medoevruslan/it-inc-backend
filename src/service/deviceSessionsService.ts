import { DeviceAuthSessionsRepository } from '../repository/deviceAuthSessionsRepository';
import { sessionsMapper } from '../mapping/sessionsMapper';
import { JwtService } from './jwtService';
import { ResultStatus } from '../shared/enums';

export class DeviceSessionsService {

  public constructor(protected deviceAuthSessionsRepository: DeviceAuthSessionsRepository, protected jwtService: JwtService) {
  }

  public async findSessionsByUserId({ refreshToken }: { refreshToken: string }) {

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

    const res = await this.deviceAuthSessionsRepository.findByDeviceIdAndIat(tokenResult.deviceId, tokenResult.iat)

    if (!res) {
      console.log(`findSessionsByUserId findByDeviceIdAndIat bad result: ${res}`)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `Token is not valid`,
        extensions: [{ field: 'token', message: 'Token is not valid' }],
        data: null,
      };
    }

    const result = await this.deviceAuthSessionsRepository.findByUserId(res.userId);
    return result.map(sessionsMapper.mapSessionsToOutputType);
  }
}