import { db } from '../db/mongoDb';


class RefreshTokenBlockedRepository {
  async findAll() {
    return await db.getCollections().refreshTokensBlockedCollection.find({}).toArray();
  }

  async findByToken(token: string) {
    return await db.getCollections().refreshTokensBlockedCollection.findOne({ token });
  }

  async delete(token: string) {
    const result = await db.getCollections().refreshTokensBlockedCollection.deleteOne({ token });
    return result.deletedCount === 1;
  }
}