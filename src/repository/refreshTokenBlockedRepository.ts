import { db } from '../db/mongoDb';
import { MongoServerError } from 'mongodb';


export class RefreshTokenBlockedRepository {
  async add(token: string) {
    try {
      const added = await db.getCollections().refreshTokensBlockedCollection.insertOne({ token })
      return added.insertedId
    } catch (err: any) {
      if (err instanceof MongoServerError) {
        console.error('Got error on add RefreshTokenBlocked:: ', err.errmsg)
        if (err.code === 11000) {
          // Duplicate key error: token already in blacklist
          return null;
        }
      }
      console.error('Got unknown error on add RefreshTokenBlocked:: ', err)
      throw err
    }

  }

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