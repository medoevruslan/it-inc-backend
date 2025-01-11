import { PostDbType } from '../db/post-db.type';
import { Nullable } from '../shared/types';

export type PostInputType = Omit<PostDbType, 'id'> & { blogName?: Nullable<string> };
