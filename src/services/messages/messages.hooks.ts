import * as authentication from "@feathersjs/authentication";
import processMessage from "../../hooks/process-message";
import populateUser from "../../hooks/populate-user";
import { format } from "date-fns";
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [processMessage()],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [
      async (context: any) => {
        const { app, result } = context;
        const messages = result.data.reverse();
        const usersId = [
          ...new Set(messages.map((message: any) => message.userId.toString())),
        ];
        const users = await app.service("users").find({
          query: {
            _id: {
              $in: usersId,
            },
            $select: ["_id", "name", "email", "avatar"],
          },
          paginate: false,
        });
        console.log(`users`, users);
        const usersById = users.reduce((byId: any, user: any) => {
          byId[user._id] = user;
          return byId;
        }, {});
        // console.log(`usersById`, usersById);
        messages.forEach((message: any) => {
          return (message.user = usersById[message.userId]);
        });
        const final = messages.reduce((acc: any, value: any) => {
          const formattedDate = format(new Date(value["createdAt"]), "Y-MM-d");
          (acc[formattedDate] = acc[formattedDate] || []).push(value);
          return acc;
        }, {});

        let finalMessages: any = [];

        for (const property in final) {
          finalMessages.push({
            _id: {
              date: property,
            },
            messages: final[property],
          });
        }
        console.log(`Final`, finalMessages);
        // console.log(`Messages here`, messages);
        context.result = finalMessages;
        //   return context;
      },
    ],
    get: [],
    create: [
      async (context: any) => {
        const { app, result } = context;

        const user = await app.service("users").find({
          query: {
            _id: result.userId,
            $select: ["_id", "name", "email", "avatar"],
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
