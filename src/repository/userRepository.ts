import { userMapper } from '../mapping/userMapper';
import { UserDbType } from '../db/user-db-type';
import { db } from '../db/mongoDb';
import { ObjectId } from 'mongodb';

export const userRepository = {
  async create(user: UserDbType) {
    const result = await db.getCollections().usersCollection.insertOne({
      ...user,
    });
    return result.insertedId.toString();
  },

  async findByLoginOrEmail(loginOrEmail: string) {
    const result = await db
      .getCollections()
      .usersCollection.findOne({ $or: [{ email: loginOrEmail }, { login: loginOrEmail }] });
    return result ? userMapper.mapUserToOutputType(result) : null;
  },

  async deleteById(userId: string) {
    const result = await db.getCollections().usersCollection.deleteOne({ _id: new ObjectId(userId) });
    return result.deletedCount === 1;
  },
};
