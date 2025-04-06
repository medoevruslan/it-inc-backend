import { UserDbType } from '../db/user-db-type';

export type InputUserType = Omit<UserDbType, 'createdAt'>;
export type OutputUserType = Omit<UserType, 'password'>;

export type UserType = Omit<UserDbType, '_id'> & { id: string };
