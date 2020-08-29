import * as authentication from '@feathersjs/authentication';
import populateMessages from '../../hooks/populate-messages';
import { setField } from 'feathers-authentication-hooks';
import Joi from '@hapi/joi';
import validate from '@feathers-plus/validate-joi';
import { fastJoin, iff, isProvider } from 'feathers-hooks-common';
const { authenticate } = authentication.hooks;

const limitToOwner = setField({
  from: 'params.user._id',
  as: 'params.query.userId',
});

const createSchema = Joi.object().keys({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
});
export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [
      validate.form(createSchema),
      async (context: any) => {
        const { data } = context;
        const userData = context.params.user;
        context.data = {
          name: data.name,
          description: data.description,
          userId: userData._id,
        };
        return context;
      },
    ],
    update: [limitToOwner],
    patch: [limitToOwner],
    remove: [limitToOwner],
  },

  after: {
    all: [],
    find: [],
    get: [iff(isProvider('external'), populateMessages())],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
