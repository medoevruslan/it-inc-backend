import { injectable } from 'inversify';
import { LikeInfoModel } from '../model/LikesInfoModel';
import { LikesInfoDbType } from '../db/likes-info-db-type';
import { FilterQuery } from 'mongoose';

@injectable()
export class LikesInfoRepository {

  public async add({ authorId, parentId, myStatus }: LikesInfoDbType) {
    const result = await LikeInfoModel.findOneAndUpdate({ authorId, parentId }, { $set: { myStatus } }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    return result._id.toString();
  }

  public async findOne(filter: FilterQuery<LikesInfoDbType>) {
    return LikeInfoModel.findOne(filter).lean();
  }

  public async update({ authorId, parentId, myStatus }: LikesInfoDbType) {
    const result = await LikeInfoModel.findOneAndUpdate({ authorId, parentId }, { $set: { myStatus } }, { new: true })
    return result !== null
  }

  public async remove() {

  }
}