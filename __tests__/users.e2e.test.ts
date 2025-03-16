import { req } from './test-helpers';
import { SETTINGS } from '../src/settings';

describe('tests for /users', () => {
  it('should get all users', async () => {
    const usersResponse = await req.get(SETTINGS.PATH.USERS).expect(200);

    expect(usersResponse.body.items.length).toBeGreaterThan(0);
  });
  it('should create new user', async () => {});
  it('should not create new user because unauthorized', async () => {});
  it('should delete user', async () => {});
  it('should not delete user because unauthorized', async () => {});
});
