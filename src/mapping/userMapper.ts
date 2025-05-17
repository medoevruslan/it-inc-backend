import { UserDbType } from '../db/user-db-type';
import { OutputUserAccountType } from '../input-output-types/user-types';
import { WithId } from 'mongodb';

export const userMapper = {
  mapUserToOutputType(user: WithId<UserDbType>): OutputUserAccountType {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.createdAt,
    };
  },
};
