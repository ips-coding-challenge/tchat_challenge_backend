import * as authentication from "@feathersjs/authentication";
import { fastJoin } from "feathers-hooks-common";
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const userResolver = {
  joins: {
    user: (...args: any) => async (connectedUser: any, context: any) => {
      const user = await context.app.service("users").find({
        query: {
          _id: connectedUser.userId,
          $select: ["_id", "name", "email"],
        },
        paginate: false,
      });
      console.log(`user`, user);
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
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [],
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
