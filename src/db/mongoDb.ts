import { Collection, Db, MongoClient } from 'mongodb';
import { PostDbType } from './post-db.type';
import { BlogDbType } from './blog-db-type';
import { SETTINGS } from '../settings';
import { DBType } from './db';
import { UserDbType } from './user-db-type';
import { Nullable } from '../shared/types';
import { CommentDbType } from './comment-db-type';
import { TokenDbType } from './token-db-type';
import { ApiRequestsDataDbType } from './api-requests-data-db-type';
import { DeviceAuthSessionsDbType } from './device-auth-sessions-db-type';

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

      await this.init(); // set up DB
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
      return true;
    } catch (err) {
      console.error(err);
      await this.client.close();
      return false;
    }
  },

  async close() {
    await this.client.close();
    console.log('Connection successful closed');
  },

  async dropCollections() {
    const collections = await this.getDbName().listCollections().toArray();

    for (let collection of collections) {
      const collectionName = collection.name;
      await this.getDbName().collection(collectionName).deleteMany();
    }
  },

  async init() {
    await this.getCollections().refreshTokensBlockedCollection.createIndex({ token: 1 }, { unique: true });
    await this.getCollections().apiRequestsDataCollection.createIndex({ date: 1 }, { expireAfterSeconds: 60 });
  },

  getCollections() {
    return {
      postCollection: this.getDbName().collection<PostDbType>(SETTINGS.PATH.POSTS),
      blogsCollection: this.getDbName().collection<BlogDbType>(SETTINGS.PATH.BLOGS),
      usersCollection: this.getDbName().collection<UserDbType>(SETTINGS.PATH.USERS),
      commentsCollection: this.getDbName().collection<CommentDbType>(SETTINGS.PATH.COMMENTS),
      refreshTokensBlockedCollection: this.getDbName().collection<TokenDbType>('refreshTokensBlocked'),
      refreshTokensValidCollection: this.getDbName().collection<TokenDbType>('refreshTokensValid'),
      apiRequestsDataCollection: this.getDbName().collection<ApiRequestsDataDbType>('apiRequests'),
      deviceAuthSessionsCollection: this.getDbName().collection<DeviceAuthSessionsDbType>('deviceAuthSessions')
    };
  },

  async seed(dataset: Partial<DBType>) {
    const collections = this.getCollections();

    if (dataset.blogs) await collections.blogsCollection.insertMany(dataset.blogs);
    if (dataset.posts) await collections.postCollection.insertMany(dataset.posts);
    if (dataset.users) await collections.usersCollection.insertMany(dataset.users);
    if (dataset.comments) await collections.commentsCollection.insertMany(dataset.comments);
    if (dataset.refreshTokensBlocked) await collections.refreshTokensBlockedCollection.insertMany(dataset.refreshTokensBlocked);
    if (dataset.refreshTokensValid) await collections.refreshTokensBlockedCollection.insertMany(dataset.refreshTokensValid);
  },
};
