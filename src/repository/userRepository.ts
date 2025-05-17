import { UserDbType, UserType } from '../db/user-db-type';
import { db } from '../db/mongoDb';
import { ObjectId } from 'mongodb';
import { userMapper } from '../mapping/userMapper';

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

  async findByConfirmationCode(code: string) {
    return await db.getCollections().usersCollection.findOne({ 'accountData.confirmationCode': code });
  },

  async findById(id: string) {
    const result = await db.getCollections().usersCollection.findOne({ _id: new ObjectId(id) });
    return result ? userMapper.mapUserToOutputType(result) : null;
  },

  async deleteById(userId: string) {
    const result = await db.getCollections().usersCollection.deleteOne({ _id: new ObjectId(userId) });
    return result.deletedCount === 1;
  },

  async update(userId: string, update: Partial<UserType>) {
    const result = await db.getCollections().usersCollection.updateOne({ _id: new ObjectId(userId)}, { $set: update });
    return result.matchedCount === 1;
  }
};
