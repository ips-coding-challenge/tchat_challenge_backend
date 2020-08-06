// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from "@feathersjs/feathers";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, method, result, params } = context;

    // console.log(`result`, result.channelId);
    if (method === "get") {
      console.log(`----------`);
      console.log(`result._id`, result._id);
      try {
        const messages = await app.service("messages").find({
          query: { channelId: result._id },
        });
        console.log(`Messages`, messages);

        context.result.messages = await Promise.all(
          messages.data.map(async (m: any) => {
            const user = await app.service("users").get(m.userId);
            return { ...m, user };
          })
        );
      } catch (e) {
        console.log(`e`, e.message);
      }
    }

    // if(method === find)
    return context;
  };
};
