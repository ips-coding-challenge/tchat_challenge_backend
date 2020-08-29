import app from '../../src/app';
import assert from 'assert';
import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import config from '../../config/test.json';

jest.setTimeout(15000);

chai.use(chaiHttp);

const should = chai.should();

let token;
let token_2;

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');
    expect(service).toBeTruthy();
  });

  beforeAll(async (done) => {
    this.server = app.listen(4242);
    try {
      await mongoose.connect(config.mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (e) {
      console.log('E', e.message);
    }

    // create an user
    await app.service('users').create({
      name: 'test',
      email: 'test@test.fr',
      githubId: '123',
      password: 'password',
    });

    await app.service('users').create({
      name: 'john',
      email: 'john@test.fr',
      password: 'password',
    });

    chai
      .request(app)
      .post('/authentication')
      .set('Accept', 'application/json')
      .send({
        strategy: 'local',
        email: 'test@test.fr',
        password: 'password',
      })
      .end((err, res) => {
        token = res.body.accessToken;
        done();
      });
    // Get the token for the second use
    chai
      .request(app)
      .post('/authentication')
      .set('Accept', 'application/json')
      .send({
        strategy: 'local',
        email: 'john@test.fr',
        password: 'password',
      })
      .end((err, res) => {
        token_2 = res.body.accessToken;
        done();
      });
  });

  it('shouldnt get the users for an unauthenticated user', (done) => {
    chai
      .request(app)
      .get('/users')
      .end((err, res) => {
        res.body.name.should.equal('NotAuthenticated');
        done();
      });
  });

  it('should get the users for an authenticated user', (done) => {
    chai
      .request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.body.should.have.property('data');
        res.body.data[0].email.should.equal('test@test.fr');
        // res.body.total.should.equal(1);
        done();
      });
  });

  it('should not authorized user to change his userId', (done) => {
    chai
      .request(app)
      .patch('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send({
        email: 'test@test.fr',
        githubId: '456',
      })
      .end((err, res) => {
        res.body.code.should.equal(400);
        res.body.errors.githubId.should.equal('"githubId" is not allowed');
        done();
      });
  });

  it('should not authorize to create a user with an email already taken', (done) => {
    chai
      .request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .send({
        name: 'test',
        email: 'test@test.fr',
        password: 'password',
        password_confirmation: 'password',
      })
      .end((err, res) => {
        res.body.message.should.equal('Email is already taken');
        done();
      });
  });

  
  // afterEach(async () => {});

  afterAll(async (done) => {
    await removeAllCollections();
    this.server.close();
    done();
  });

  async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({});
    }
  }
});
