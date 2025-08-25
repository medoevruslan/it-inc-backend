import { SETTINGS } from '../settings';
import mongoose from 'mongoose';
import { DBType } from './db';
import { BlogModel, CommentModel, PostModel, UserModel } from '../model';
import { TokenDbModel } from '../model/TokenDbModel';
import { ApiRequestsDataDbModel } from '../model/ApiRequestsDataDbModel';


export class Db {

  public async run(uri: string) {
    try {
      await mongoose.connect(`${uri}/${SETTINGS.DATABASE}?retryWrites=true&w=majority&appName=lesson-3`)
      await this.init()
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
      return true;
    } catch (err) {
      console.error(err);
      await mongoose.disconnect()
      return false;
    }
  }

  public async runTesting(uri: string) {
    try {
      await mongoose.connect(uri)
      await this.init()
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
      return true;
    } catch (err) {
      console.error(err);
      await mongoose.disconnect()
      return false;
    }
  }

  private async init() {
    await TokenDbModel.init();
    await ApiRequestsDataDbModel.init();
  }

  public async close() {
    await mongoose.disconnect()
    console.log('Connection successful closed');
  }

  public async dropCollections() {
    await mongoose.connection.dropDatabase()
  }

  public async seed(dataset: Partial<DBType>) {
    if (dataset.blogs) {
      await BlogModel.insertMany(dataset.blogs);
      console.log(`Seeded ${dataset.blogs.length} blogs`);
    }
    if (dataset.posts) {
      await PostModel.insertMany(dataset.posts);
      console.log(`Seeded ${dataset.posts.length} posts`);
    }
    if (dataset.users) {
      await UserModel.insertMany(dataset.users);
      console.log(`Seeded ${dataset.users.length} users`);
    }
    if (dataset.comments) {
      await CommentModel.insertMany(dataset.comments);
      console.log(`Seeded ${dataset.comments.length} comments`);
    }
  }
}