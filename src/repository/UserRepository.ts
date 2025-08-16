import { UserType } from '../db/user-db-type';
import { db } from '../db/mongoDb';
import { ObjectId } from 'mongodb';
import { userMapper } from '../mapping/userMapper';
import { injectable } from 'inversify';

@injectable()
export class UserRepository {
  public async create(user: UserType) {
    const result = await db.getCollections().usersCollection.insertOne({
      ...user,
    });
    return result.insertedId.toString();
  }

  public async findByLoginOrEmail(loginOrEmail: string) {
    return await db
      .getCollections()
      .usersCollection.findOne({ $or: [{ 'accountData.email': loginOrEmail }, { 'accountData.login': loginOrEmail }] });
  }

  public async findByConfirmationCode(code: string) {
    return await db.getCollections().usersCollection.findOne({ 'emailConfirmation.confirmationCode': code });
  }

  public async findByPasswordRecoveryCode(code: string) {
    return await db.getCollections().usersCollection.findOne({ 'passwordRecovery.recoveryCode': code });
  }

  public async findById(id: string) {
    const result = await db.getCollections().usersCollection.findOne({ _id: new ObjectId(id) });
    return result ? userMapper.mapUserToOutputType(result) : null;
  }

  public async deleteById(userId: string) {
    const result = await db.getCollections().usersCollection.deleteOne({ _id: new ObjectId(userId) });
    return result.deletedCount === 1;
  }

  public async update(userId: string, update: Partial<UserType>) {
    const result = await db.getCollections().usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: update });
    return result.matchedCount === 1;
  }
}
