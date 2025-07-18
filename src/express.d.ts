
declare namespace Express {
  export interface Request {
    userId: string | null;
    deviceId: string | null
  }
}
