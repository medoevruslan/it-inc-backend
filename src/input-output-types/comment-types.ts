import { CommentDbType } from '../db/comment-db-type';

export type CommentUpdateType = { commentId: string; update: { content: string } };
export type CommentInputType = { userId: string; postId: string; content: string };
export type CommentOutputType = Omit<CommentDbType, 'postId' | '_id'> & { id: string }

