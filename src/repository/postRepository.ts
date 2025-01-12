import { db } from '../db/db';
import { generateIdString } from '../shared/utils';
import { InputPostType, OutputPostType } from '../input-output-types/post-types';
import { PostDbType } from '../db/post-db.type';

type UpdatePostType = { postId: string; update: InputPostType };

export const postRepository = {
  async create(input: InputPostType): Promise<OutputPostType> {
    const newPost: PostDbType = {
      id: generateIdString(),
      ...input,
    };

    db.posts.push(newPost);

    return newPost;
  },
  async update({ postId, update }: UpdatePostType): Promise<boolean> {
    const foundIndex = db.posts.findIndex((post) => post.id === postId);
    if (foundIndex < 0) {
      return false;
    }
    db.posts[foundIndex] = { id: postId, ...update };
    return true;
  },
  async findAll(): Promise<OutputPostType[]> {
    return db.posts;
  },
  async findById(id: string): Promise<OutputPostType | null> {
    return db.posts.find((post) => post.id === id) || null;
  },
  async deleteById(id: string): Promise<boolean> {
    const foundIndex = db.posts.findIndex((post) => post.id === id);
    if (foundIndex < 0) {
      return false;
    }
    db.posts.splice(foundIndex, 1);
    return true;
  },
};
