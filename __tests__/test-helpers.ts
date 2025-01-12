import { app } from '../src/app';
import { agent } from 'supertest';
import { SETTINGS } from '../src/settings';

export const req = agent(app);

export const toBase64 = (authString: string) => {
  const buffer = Buffer.from(authString, 'utf-8');
  return buffer.toString('base64');
};
