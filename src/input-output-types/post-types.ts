import { PostDbType } from '../db/post-db.type';
import { Nullable } from '../shared/types';
import { OptionalUnlessRequiredId } from 'mongodb';

export type InputPostType = OptionalUnlessRequiredId<Omit<PostDbType, 'blogName'>>;
export type UpdatePostType = Omit<InputPostType, '_id'>;

// Represents the output when sending data to client
export type OutputPostType = Omit<PostDbType, '_id'> & { id: string };
