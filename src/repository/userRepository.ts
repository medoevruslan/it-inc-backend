import { usersCollection } from '../db/mongoDb';
import { userMapper } from '../mapping/userMapper';
import { UserDbType } from '../db/user-db-type';

export const userRepository = {
  async create(user: UserDbType) {
    const result = await usersCollection.insertOne({
      ...user,
    });
    return result.insertedId.toString();
  },

  async findByLoginOrEmail(loginOrEmail: string) {
    const result = await usersCollection.findOne({ $or: [{ email: loginOrEmail }, { login: loginOrEmail }] });
    return result ? userMapper.mapUserToOutputType(result) : null;
  },
};
