import * as authentication from '@feathersjs/authentication';
import { fastJoin } from 'feathers-hooks-common';
import { NotFound } from '@feathersjs/errors';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const userResolver = {
  joins: {
    user: (...args: any) => async (connectedUser: any, context: any) => {
      const user = await context.app.service('users').find({
        query: {
          _id: connectedUser.userId,
          $select: ['_id', 'name', 'email', 'avatar'],
        },
        paginate: false,
      });

      console.log('user', user);
      return (connectedUser.user = user[0]);
    },
  },
};

const query = {
  channelId: (context: any) => context.params.channelId,
  user: true,
};

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [
      async (context: any) => {
        const { app, service, data, params } = context;
        if (params?.connection) {
          // console.log(`In here`, data.channelId);
          app.channel(`rooms/${data.channelId}`).join(params.connection);
        }

        const channel = app.service('channels').get(data.channelId);

        if (!channel) {
          throw new NotFound('Channel not found');
        }

        const mData = {
          userId: params.user._id,
          channelId: data.channelId,
        };
        // console.log(`Params`, params);

        try {
          const result = await service.patch(null, mData, {
            query: {
              userId: mData.userId,
              channelId: mData.channelId,
            },
            mongoose: { upsert: true },
          });
          context.result = result;
          return context;
        } catch (e) {
          console.log('E', e.message);
        }

        // console.log(`Result`, result);

        return context;
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [fastJoin(userResolver, (context) => query)],
    get: [],
    create: [],
    update: [],
    patch: [fastJoin(userResolver, (context) => query)],
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
