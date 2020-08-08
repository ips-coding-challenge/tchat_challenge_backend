import app from '../src/app';
import mongoose from 'mongoose';
import config from '../config/test.json';

describe('authentication', () => {
  it('registered the authentication service', () => {
    expect(app.service('authentication')).toBeTruthy();
  });

  describe('local strategy', () => {
    const userInfo = {
      email: 'someone@example.com',
      password: 'supersecret',
    };

    beforeAll(async () => {
      try {
        await app.service('users').create(userInfo);
      } catch (error) {
        // Do nothing, it just means the user already exists and can be tested
      }
    });

    it('authenticates user and creates accessToken', async () => {
      const { user, accessToken } = await app.service('authentication').create(
        {
          strategy: 'local',
          ...userInfo,
        },
        {}
      );

      expect(accessToken).toBeTruthy();
      expect(user).toBeTruthy();
    });

    it.only('authorizes only the current user to modify his infos', async () => {
      const user = await app.service('users').create({
        name: 'machin',
        email: 'admin@test.fr',
        password: 'password',
      });

      const otherUser = await app.service('users').create({
        name: 'notAllowed',
        email: 'test@test.fr',
        password: 'password',
      });

      const params = { user };

      console.log('user', params.user);
      const updated = await app
        .service('users')
        .update(params.user._id, { _id: '123', name: 'truc' });

      console.log('Updated', updated);
      expect(updated._id.toString()).toBe(user._id.toString());

      const otherUpdate = await app
        .service('users')
        .update(otherUser._id, { _id: '5456', name: 'other' });

      expect(otherUpdate._id.toString()).not.toBe('5456');
    });

    afterEach(async () => {
      await mongoose.connect(config.mongodb, { useNewUrlParser: true });
      await removeAllCollections();
    });
  });
});

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  }
}
