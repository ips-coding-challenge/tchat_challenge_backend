import * as authentication from '@feathersjs/authentication';
import processMessage from '../../hooks/process-message';
import populateUser from '../../hooks/populate-user';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt')],
    find: [(context: any) => console.log('Context', context)],
    get: [],
    create: [processMessage()],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context: any) => {
        const { app, result } = context;

        const user = await app.service('users').find({
          query: {
            _id: result.userId,
            $select: ['_id', 'name', 'email', 'avatar'],
          },
          paginate: false,
        });

        // console.log("user", user);
        // console.log("user[0]", user[0]);

        context.result.user = user[0];
        return context;
      },
    ],
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
