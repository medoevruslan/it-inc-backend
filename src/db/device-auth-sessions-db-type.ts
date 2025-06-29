export type DeviceAuthSessionsDbType = {
  iat: number,
  deviceId: string,
  ip: string,
  deviceName: string,
  userId: string
  exp: number
}