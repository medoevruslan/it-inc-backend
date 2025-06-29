import {
  DeviceAuthSessionsQueryRepository,
} from '../repository/deviceAuthSessionsQueryRepository';


export const getActiveSessionsByUserId = async (userId: string) => {
  const deviceAuthSessionsQueryRepository = new DeviceAuthSessionsQueryRepository()
  const result = await deviceAuthSessionsQueryRepository.findByUserId(userId);
}