import { UserDbType, UserType } from '../db/user-db-type';
import { db } from '../db/mongoDb';
import { ObjectId } from 'mongodb';

export const userRepository = {
  async create(user: UserType) {
    const result = await db.getCollections().usersCollection.insertOne({
      ...user,
    });
    return result.insertedId.toString();
  },

  async findByLoginOrEmail(loginOrEmail: string) {
    return await db
      .getCollections()
      .usersCollection.findOne({ $or: [{ 'accountData.email': loginOrEmail }, { 'accountData.login': loginOrEmail }] });
  },

  async deleteById(userId: string) {
    const result = await db.getCollections().usersCollection.deleteOne({ _id: new ObjectId(userId) });
    return result.deletedCount === 1;
  },
};
