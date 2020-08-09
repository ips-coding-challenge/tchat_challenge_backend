// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from "@feathersjs/feathers";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, method, result, params } = context;

    if (method === "get") {
      try {
        const { result, app } = context;
        const messages = await app.service("messages").find({
          query: {
            $limit: 50,
            channelId: result._id,
          },
        });

        const usersId = [
          ...new Set(
            messages.data.map((message: any) => message.userId.toString())
          ),
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

        // let test: any = [];
        // console.log(`Users`, users);
        // users.forEach((user: any) => {
        //   const id = user._id.toString();
        //   console.log(`user id `, user._id.toString());
        //   // [atztza => {user}]
        //   test[id] = user;
        // });

        // console.log(`Test`, test);

        const usersById = users.reduce((byId: any, user: any) => {
          byId[user._id] = user;
          return byId;
        }, {});
        // console.log(`usersById`, usersById);

        messages.data.forEach((message: any) => {
          return (message.user = usersById[message.userId]);
        });

        context.result.messages = messages;

        return context;
      } catch (e) {
        throw new Error("Error while fetching data");
      }
    }

    // if(method === find)
    return context;
  };
};
