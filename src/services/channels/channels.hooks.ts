import * as authentication from "@feathersjs/authentication";
import populateMessages from "../../hooks/populate-messages";
import { setField } from "feathers-authentication-hooks";
import { fastJoin } from "feathers-hooks-common";
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
    update: [setField({ from: "params.user._id", as: "params.query.userId" })],
    patch: [setField({ from: "params.user._id", as: "params.query.userId" })],
    remove: [setField({ from: "params.user._id", as: "params.query.userId" })],
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
