import { Collection, Db, MongoClient } from 'mongodb';
import { PostDbType } from './post-db.type';
import { BlogDbType } from './blog-db-type';
import { SETTINGS } from '../settings';
import { DBType } from './db';
import { UserDbType } from './user-db-type';
import { Nullable } from '../shared/types';

export const db = {
  client: {} as MongoClient,

  getDbName() {
    return this.client.db(SETTINGS.DATABASE);
  },

  async run(uri: string) {
    try {
      this.client = new MongoClient(uri);

      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect();
      // Send a ping to confirm a successful connection
      await this.getDbName().command({ ping: 1 });

      console.log('Pinged your deployment. You successfully connected to MongoDB!');
      return true;
    } catch (err) {
      console.error(err);
      await this.client.close();
      return false;
    }
  },

  async close() {
    this.client.close();
    console.log('Connection successful closed');
  },

  async dropCollections() {
    const collections = await this.getDbName().listCollections().toArray();

    collections.forEach((collection) => {
      const collectionName = collection.name;
      this.getDbName().collection(collectionName).deleteMany();
    });
  },

  getCollections() {
    return {
      postCollection: this.getDbName().collection<PostDbType>(SETTINGS.PATH.POSTS),
      blogsCollection: this.getDbName().collection<BlogDbType>(SETTINGS.PATH.BLOGS),
      usersCollection: this.getDbName().collection<UserDbType>(SETTINGS.PATH.USERS),
    };
  },

  async seed(dataset: Partial<DBType>) {
    const collections = this.getCollections();

    if (dataset.blogs) await collections.blogsCollection.insertMany(dataset.blogs);
    if (dataset.posts) await collections.postCollection.insertMany(dataset.posts);
    if (dataset.users) await collections.usersCollection.insertMany(dataset.users);
  },
};
