import { CommentDbType } from '../db/comment-db-type';

export type CommentType = CommentDbType & { id: string };
export type OutputCommentType = CommentType;
