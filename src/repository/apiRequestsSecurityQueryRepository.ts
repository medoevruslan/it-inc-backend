import { db } from '../db/mongoDb';
import { ApiRequestsDataDbType } from '../db/api-requests-data-db-type';
import { Filter } from 'mongodb';


export class ApiRequestsSecurityQueryRepository {
  async add(data: ApiRequestsDataDbType) {
    return db.getCollections().apiRequestsDataCollection.insertOne(data)
  }

 async findAll(filter: Filter<ApiRequestsDataDbType>) {
    return db.getCollections().apiRequestsDataCollection.find(filter).toArray()
  }

  async getDocumentsCount(filter: Filter<ApiRequestsDataDbType>) {
    return db.getCollections().apiRequestsDataCollection.countDocuments(filter)
  }
}