import { UserDbType } from '../db/user-db-type';
import { Nullable } from '../shared/types';

export type InputUserType = Omit<UserDbType['accountData'], 'createdAt'>;
export type OutputUserAccountType = Omit<UserAccountType['accountData'], 'password'> & { id: string };

export type UserAccountType = UserDbType;

export type GetAllUsersQueryParams = {
  searchLoginTerm: Nullable<string>;
  searchEmailTerm: Nullable<string>;
  sortBy: keyof UserAccountType['accountData'];
  sortDirection: 'asc' | 'desc';
  pageNumber: string;
  pageSize: string;
};
