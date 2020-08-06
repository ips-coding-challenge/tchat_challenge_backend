import * as authentication from "@feathersjs/authentication";
import populateMessages from "../../hooks/populate-messages";
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [
      async (context: any) => {
        const { data } = context;
        const userData = context.params.user;
        context.data = {
          name: data.name,
          userId: userData._id,
          createdAt: new Date().getTime(),
        };
        return context;
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [populateMessages()],
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
