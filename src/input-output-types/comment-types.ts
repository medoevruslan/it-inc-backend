import { CommentDbType } from '../db/comment-db-type';

export type CommentType = CommentDbType & { id: string };
export type CommentUpdateType = { commentId: string; update: { content: string } };
export type OutputCommentType = CommentType;
