import { DeviceAuthSessionsDbType } from '../db/device-auth-sessions-db-type';
import { OutputDeviceSessionType } from '../input-output-types/device-session-types';

export const sessionsMapper =  {
  mapSessionsToOutputType(session: DeviceAuthSessionsDbType): OutputDeviceSessionType {
    return {
      ip: session.ip,
      deviceId: session.deviceId,
      lastActiveDate: new Date(session.iat).toISOString() ,
      title: session.deviceName
    }
  }
}



