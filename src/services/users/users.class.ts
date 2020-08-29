import crypto from 'crypto';
import { Service, MongooseServiceOptions } from 'feathers-mongoose';
import { Application } from '../../declarations';
import { Params } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';
// The size query. Our chat needs 60px images
const query = 's=60&d=identicon';
// Returns the Gravatar image for an email
const getGravatar = (email: string) => {
  // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
  const hash = crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex');
  // Return the full avatar URL
  return `${gravatarUrl}/${hash}?${query}`;
};

interface UserData {
  email: string;
  password: string;
  bio?: string;
  phone?: number;
  name?: string;
  avatar?: string;
  githubId?: string;
}

export class Users extends Service {
  private app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data: UserData, params?: Params) {
    // This is the information we want from the user signup data

    const { email, password, githubId, name } = data;
    // Need to check if email exist and != null because of github

    // Use the existing avatar image or return the Gravatar for the email
    const avatar = data.avatar || getGravatar(email);

    // The complete user
    const userData = {
      email,
      name,
      password,
      githubId,
      avatar,
    };

    return super.create(userData, params);
  }
}
