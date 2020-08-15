// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from "@feathersjs/feathers";
import { FeathersError } from "@feathersjs/errors";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    console.log(`context`, context);
    const { app, method, result, params, data } = context;

    // console.log(`params query email`, data.email);

    // Meaning it's a Oauth Creation with email possibly null
    if (data.email === null) {
      return context;
    }

    console.log(`Method`, method);

    if (data.email === params.user?.email) {
      return context;
    }

    const user = await app.service("users").find({
      query: {
        email: data.email,
      },
      paginate: false,
    });

    if (user.length > 0) {
      throw new Error("Email is already taken");
    }

    console.log(`User exists ?`, user);

    return context;
  };
};
