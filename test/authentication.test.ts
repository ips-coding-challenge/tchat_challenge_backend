import app from '../src/app';
import mongoose from 'mongoose';
import config from '../config/test.json';
// import jest from "jest";

describe('authentication', () => {
  it('registered the authentication service', () => {
    expect(app.service('authentication')).toBeTruthy();
  });

  beforeAll(async () => {
    try {
      await mongoose.connect(config.mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (e) {
      console.log('E', e.message);
    }
  });

  describe('local strategy', () => {
    const userInfo = {
      name: 'someone',
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

    it('authorizes only the current user to modify his infos', async () => {
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

      // console.log("user", params.user);
      const updated = await app
        .service('users')
        .patch(params.user._id, { _id: '123', name: 'truc' });

      // console.log("Updated", updated);
      expect(updated._id.toString()).toBe(user._id.toString());

      const otherUpdate = await app
        .service('users')
        .patch(otherUser._id, { _id: '5456', name: 'other' });

      expect(otherUpdate._id.toString()).not.toBe('5456');
    });

    it('should not authorize user to modify his githubId', async () => {
      const user = await app.service('users').create({
        name: 'machin',
        email: 'admin@test.fr',
        password: 'password',
        githubId: '123',
      });

      const params = {
        user,
        provider: 'rest',
      };
      const updated = await app
        .service('users')
        .patch(params.user._id, { githubId: '456' }, params);

      expect(updated.githubId).toBe('123');
    });

    afterEach(async () => {
      // console.log('After each called');
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
