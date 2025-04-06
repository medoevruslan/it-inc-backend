import { usersCollection } from '../db/mongoDb';
import { UserDbType } from '../db/user-db-type';
import { InputUserType, OutputUserType } from '../input-output-types/user-types';
import { userMapper } from '../mapping/userMapper';
import { ObjectId } from 'mongodb';

export const userQueryRepository = {
  async findAll() {
    return usersCollection.find().toArray();
  },
  async findById(id: string) {
    const result = await usersCollection.findOne({ _id: new ObjectId(id) });
    return result ? userMapper.mapUserToOutputType(result) : null;
  },

  async findByLoginOrEmail(loginOrEmail: string) {
    const result = await usersCollection.findOne({ $or: [{ email: loginOrEmail }, { login: loginOrEmail }] });
    return result ? userMapper.mapUserToOutputType(result) : null;
  },
};
