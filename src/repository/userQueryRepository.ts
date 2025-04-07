import { userMapper } from '../mapping/userMapper';
import { ObjectId } from 'mongodb';
import { db } from '../db/mongoDb';

export const userQueryRepository = {
  async findAll() {
    return await db.getCollections().usersCollection.find().toArray();
  },
  async findById(id: string) {
    const result = await db.getCollections().usersCollection.findOne({ _id: new ObjectId(id) });
    return result ? userMapper.mapUserToOutputType(result) : null;
  },

  async findByLoginOrEmail(loginOrEmail: string) {
    const result = await db
      .getCollections()
      .usersCollection.findOne({ $or: [{ email: loginOrEmail }, { login: loginOrEmail }] });
    return result ? userMapper.mapUserToOutputType(result) : null;
  },
};
