import { PostDbType } from '../db/post-db.type';
import { Nullable } from '../shared/types';

export type InputPostType = Omit<PostDbType, 'id'> & { blogName?: Nullable<string> };
export type OutputPostType = PostDbType;
