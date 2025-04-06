import { UserDbType } from '../db/user-db-type';
import { OutputUserType } from '../input-output-types/user-types';
import { WithId } from 'mongodb';

export const userMapper = {
  mapUserToOutputType(user: WithId<UserDbType>): OutputUserType {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
};
