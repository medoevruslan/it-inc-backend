import { Nullable } from '../shared/types';

export type BlogDbType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: Nullable<string>;
};
