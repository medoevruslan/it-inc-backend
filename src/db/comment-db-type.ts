export type CommentDbType = {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  postId: string;
};

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};
