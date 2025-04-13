export type CommentDbType = {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
};

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};
