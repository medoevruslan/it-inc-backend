import { Router } from 'express';
import { clearDatabaseController } from './clearDatabaseController';

export const testingRouter = Router();

testingRouter.delete('/all-data', clearDatabaseController);
