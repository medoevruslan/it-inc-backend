import { userMapper } from '../mapping/userMapper';
import { Filter, ObjectId, WithId } from 'mongodb';
import { db } from '../db/mongoDb';
import { GetAllUsersQueryParams, OutputUserType } from '../input-output-types/user-types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';
import { UserDbType } from '../db/user-db-type';

export const userQueryRepository = {
  async findAll(inputFilter: GetAllUsersQueryParams): Promise<OutputModelTypeWithInfo<OutputUserType>> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchLoginTerm, searchEmailTerm } = inputFilter;
    let filter = {} as Filter<UserDbType>;

    if (searchLoginTerm) {
      if (!filter?.$or) {
        filter.$or = [];
      }
      filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    }

    if (searchEmailTerm) {
      if (!filter?.$or) {
        filter.$or = [];
      }
      filter.$or?.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    }

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    // Execute queries in parallel for better performance
    const [totalCount, users]: [number, WithId<UserDbType>[]] = await Promise.all([
      db.getCollections().usersCollection.countDocuments(filter), // Fetch total count
      db
        .getCollections()
        .usersCollection.find(filter)
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(convertedPageSize)
        .toArray(),
    ]);

    return {
      pagesCount: Math.ceil(totalCount / convertedPageSize),
      page: Number(pageNumber),
      pageSize: convertedPageSize,
      totalCount: totalCount,
      items: users.map(userMapper.mapUserToOutputType),
    };
  },
  async findById(id: string) {
    const result = await db.getCollections().usersCollection.findOne({ _id: new ObjectId(id) });
    return result ? userMapper.mapUserToOutputType(result) : null;
  },

  async findByLoginOrEmail(loginOrEmail: string) {
    const result = await db
      .getCollections()
      .usersCollection.findOne({ $or: [{ email: loginOrEmail }, { login: loginOrEmail }] });
    return result ? userMapper.mapUserToOutputType(result) : null;
  },
};
