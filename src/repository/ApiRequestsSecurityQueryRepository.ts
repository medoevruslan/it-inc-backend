import { ApiRequestsDataDbType } from '../db/api-requests-data-db-type';
import { ApiRequestsDataDbModel } from '../model/ApiRequestsDataDbModel';
import { FilterQuery } from 'mongoose';


export class ApiRequestsSecurityQueryRepository {
  async add(data: ApiRequestsDataDbType) {
    const apiRequestsDataDbModel = new ApiRequestsDataDbModel(data);
    await apiRequestsDataDbModel.save();
    return apiRequestsDataDbModel._id.toString();
  }

  async findAll(filter: FilterQuery<ApiRequestsDataDbType>) {
    return ApiRequestsDataDbModel.find(filter).lean();
  }

  async getDocumentsCount(filter: FilterQuery<ApiRequestsDataDbType>) {
    return ApiRequestsDataDbModel.countDocuments(filter);
  }
}