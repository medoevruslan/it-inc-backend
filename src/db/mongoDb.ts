import { Collection, MongoClient } from 'mongodb';
import { PostDbType } from './post-db.type';
import { BlogDbType } from './blog-db-type';
import { SETTINGS } from '../settings';
import { DBType } from './db';

export let postCollection: Collection<PostDbType>;
export let blogsCollection: Collection<BlogDbType>;

export const runDb = async (uri: string) => {
  const client = new MongoClient(uri);
  const db = client.db(SETTINGS.DATABASE);

  postCollection = db.collection<PostDbType>(SETTINGS.PATH.POSTS);
  blogsCollection = db.collection<BlogDbType>(SETTINGS.PATH.BLOGS);

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await db.command({ ping: 1 });

    console.log('Pinged your deployment. You successfully connected to MongoDB!');
    return true;
  } catch (err) {
    console.error(err);
    await client.close();
    return false;
  }
};

export const setMongoDB = async (dataset?: Partial<DBType>) => {
  await postCollection.drop();
  await blogsCollection.drop();
  if (!dataset) return;

  if (dataset.blogs) await blogsCollection.insertMany(dataset.blogs);
  if (dataset.posts) await postCollection.insertMany(dataset.posts);
  // if (dataset.videos) await videoCollection.insertMany(dataset.videos); // not implemented yet
};
