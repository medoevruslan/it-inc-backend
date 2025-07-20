export type DeviceAuthSessionsDbType = {
  iat: number,
  deviceId: string,
  ip: string,
  deviceName: string,
  userId: string
  exp: number
}

export type DeviceAuthSessionsUpdateType = {
  deviceId: string,
  iat: number,
  expUpdated: number,
  iatUpdated: number
}