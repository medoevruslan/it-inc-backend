import { db } from '../db/mongoDb';
import { MongoServerError } from 'mongodb';
import { injectable } from 'inversify';
import { TokenDbModel } from '../model/TokenDbModel';

@injectable()
export class RefreshTokenBlockedRepository {
  async add(token: string) {
    try {
      const tokenDbModel = new TokenDbModel(token)
      await tokenDbModel.save()
      return tokenDbModel._id.toString()
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
    return TokenDbModel.find().lean();
  }

  async findByToken(token: string) {
    return TokenDbModel.findOne().where('token').equals(token);
  }

  async delete(token: string) {
    const result = await TokenDbModel.deleteOne({ token });
    return result.deletedCount === 1;
  }
}