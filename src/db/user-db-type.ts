import { ObjectId } from 'mongodb';

export type UserDbType = {
  _id: ObjectId;
  login: string;
  password: string;
  email: string;
};
