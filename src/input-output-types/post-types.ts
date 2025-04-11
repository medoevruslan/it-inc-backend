import { PostDbType } from '../db/post-db.type';
import { OptionalUnlessRequiredId } from 'mongodb';

export type InputPostType = OptionalUnlessRequiredId<Omit<PostDbType, 'blogName'>>;
export type PostDbTypeWithoutId = OptionalUnlessRequiredId<PostDbType>;
export type PostType = Omit<PostDbType, '_id'>;
export type UpdatePostType = { postId: string; update: PostType };

// Represents the output when sending data to client
export type OutputPostType = PostType & { id: string };
