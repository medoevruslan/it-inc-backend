import { PostDbType } from '../db/post-db.type';
import { Nullable } from '../shared/types';

export type InputPostType = Omit<PostDbType, 'id'>;
export type OutputPostType = PostDbType;
