import { UserDbType } from '../db/user-db-type';

export type InputUserType = Omit<UserDbType['accountData'], 'createdAt'>;
export type OutputUserAccountType = Omit<UserAccountType['accountData'], 'password'> & { id: string, createdAt: Date } ;

export type UserAccountType = UserDbType;

export type GetAllUsersQueryParams = {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: keyof UserAccountType['accountData'];
  sortDirection: 'asc' | 'desc';
  pageNumber: string;
  pageSize: string;
};
