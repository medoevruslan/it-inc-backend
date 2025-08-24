import { userMapper } from '../mapping/userMapper';
import { Filter, ObjectId, WithId } from 'mongodb';
import { db } from '../db/mongoDb';
import { GetAllUsersQueryParams, OutputUserAccountType } from '../input-output-types/user-types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';
import { UserDbType, UserType } from '../db/user-db-type';
import { injectable } from 'inversify';
import { UserModel } from '../model/UserModel';
import { FilterQuery } from 'mongoose';

@injectable()
export class UserQueryRepository {
  async findAll(inputFilter: GetAllUsersQueryParams): Promise<OutputModelTypeWithInfo<OutputUserAccountType>> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchLoginTerm, searchEmailTerm } = inputFilter;
    let filter: FilterQuery<UserDbType> = {};

    if (searchLoginTerm) {
      if (!filter?.$or) {
        filter.$or = [];
      }
      filter.$or?.push({ 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } });
    }

    if (searchEmailTerm) {
      if (!filter?.$or) {
        filter.$or = [];
      }
      filter.$or?.push({ 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } });
    }

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    // Execute queries in parallel for better performance
    const [totalCount, users]: [number, WithId<UserDbType>[]] = await Promise.all([
      UserModel.countDocuments(filter), // Fetch total count
      UserModel.find(filter)
        .sort({ [`accountData.${sortBy}`]: sortDirection === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(convertedPageSize)
        .lean(),
    ]);

    return {
      pagesCount: Math.ceil(totalCount / convertedPageSize),
      page: Number(pageNumber),
      pageSize: convertedPageSize,
      totalCount: totalCount,
      items: users.map(userMapper.mapUserToOutputType),
    };
  }

  async findById(id: string) {
    const result = await UserModel.findById(id).lean();
    return result ? userMapper.mapUserToOutputType(result) : null;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const query = UserModel.findOne();
    const result = await query.or([
      { 'accountData.email': loginOrEmail },
      { 'accountData.login': loginOrEmail },
    ]).lean();
    return result ? userMapper.mapUserToOutputType(result) : null;
  }
}

