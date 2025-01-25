import { app } from './app';
import { SETTINGS } from './settings';
import { runDb } from './db/mongoDb';
import * as Process from 'process';

const startApp = async () => {
  const isDbStarted = runDb(SETTINGS.MONGO_URL);

  if (!isDbStarted) {
    Process.exit(1);
  }

  app.listen(SETTINGS.PORT, () => {
    console.log('...server started in port ' + SETTINGS.PORT);
  });
};

startApp();
