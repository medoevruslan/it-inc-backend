import { CommentDbType } from '../db/comment-db-type';

export type CommentType = Omit<CommentDbType, '_id' | 'createdAt'>;
export type CommentUpdateType = { commentId: string; update: Partial<CommentDbType> };
export type CommentInputType = { userId: string; postId: string; content: string };
export type CommentOutputType = Omit<CommentType, 'postId'> & { id: string, createdAt: string }

