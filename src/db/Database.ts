import { SETTINGS } from '../settings';
import mongoose from 'mongoose';


export class Db {

  public async run(uri: string) {
    try {
      await mongoose.connect(`${SETTINGS.MONGO_URL}/${SETTINGS.DATABASE}`)
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
      return true;
    } catch (err) {
      console.error(err);
      await mongoose.disconnect()
      return false;
    }
  }

  public async close() {
    await mongoose.disconnect()
    console.log('Connection successful closed');
  }
}