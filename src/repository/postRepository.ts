import { db } from '../db/db';
import { generateIdString } from '../shared/utils';
import { InputPostType, OutputPostType } from '../input-output-types/post-types';
import { PostDbType } from '../db/post-db.type';
import { postCollection } from '../db/mongoDb';
import { ObjectId } from 'mongodb';
import { BlogDbType } from '../db/blog-db-type';
import { OutputBlogType } from '../input-output-types/blog-types';

type UpdatePostType = { postId: string; update: InputPostType };

export const postRepository = {
  async create(input: InputPostType & { blogName: string }): Promise<string> {
    const result = await postCollection.insertOne(input);
    return result.insertedId.toString();
  },
  async update({ postId, update }: UpdatePostType): Promise<boolean> {
    const result = await postCollection.updateOne({ _id: new ObjectId(postId) }, { $set: update });
    return result.modifiedCount > 0;
  },
  async findAll(): Promise<OutputPostType[]> {
    return (await postCollection.find({}).toArray()).map(this.mapToOutputType);
  },
  async findById(id: string): Promise<OutputPostType | null> {
    const post = await postCollection.findOne({ _id: new ObjectId(id) });
    return post === null ? null : this.mapToOutputType(post);
  },
  async deleteById(id: string): Promise<boolean> {
    const result = await postCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },
  mapToOutputType(post: PostDbType): OutputPostType {
    return {
      id: post._id.toString(),
      blogName: post.blogName,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      shortDescription: post.shortDescription,
    };
  },
};
