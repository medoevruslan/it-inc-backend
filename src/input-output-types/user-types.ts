import { UserDbType } from '../db/user-db-type';

export type InputUserType = Omit<UserDbType, 'createdAt'>;
export type OutputUserType = Omit<UserType, 'password'>;

export type UserType = UserDbType & { id: string };

export type GetAllUsersQueryParams = {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: keyof UserType;
  sortDirection: 'asc' | 'desc';
  pageNumber: string;
  pageSize: string;
};
