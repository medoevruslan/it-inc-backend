import { app } from './app';
import { SETTINGS } from './settings';
import * as Process from 'process';
import { db } from './db/mongoDb';

const startApp = async () => {
  const isDbStarted = await db.run(SETTINGS.MONGO_URL);

  if (!isDbStarted) {
    Process.exit(1);
  }

  app.listen(SETTINGS.PORT, () => {
    console.log('...server started in port ' + SETTINGS.PORT);
  });
};

startApp();
