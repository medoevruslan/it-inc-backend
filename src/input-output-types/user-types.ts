import { OptionalUnlessRequiredId } from 'mongodb';
import { UserDbType } from '../db/user-db-type';

export type InputUserType = OptionalUnlessRequiredId<UserDbType>;
