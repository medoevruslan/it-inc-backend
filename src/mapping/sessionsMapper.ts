import { DeviceAuthSessionsDbType } from '../db/device-auth-sessions-db-type';
import { OutputDeviceSessionType } from '../input-output-types/device-session-types';

export const sessionsMapper =  {
  mapSessionsToOutputType(session: DeviceAuthSessionsDbType): OutputDeviceSessionType {
    const jwtInMilliseconds = session.iat * 1000

    return {
      ip: session.ip,
      deviceId: session.deviceId,
      lastActiveDate: new Date(jwtInMilliseconds).toISOString() ,
      title: session.deviceName
    }
  }
}



