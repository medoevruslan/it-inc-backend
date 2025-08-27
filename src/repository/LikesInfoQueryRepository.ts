import { injectable } from 'inversify';
import { LikeInfoModel } from '../model/LikesInfoModel';
import { LikesInfoDbType } from '../db/likes-info-db-type';
import { FilterQuery } from 'mongoose';

@injectable()
export class LikesInfoQueryRepository {

  public async finaAll(filter: FilterQuery<LikesInfoDbType>) {
    return LikeInfoModel.find(filter).lean()
  }

  public async findOne(filter: FilterQuery<LikesInfoDbType>) {
    return LikeInfoModel.findOne(filter).lean();
  }

}