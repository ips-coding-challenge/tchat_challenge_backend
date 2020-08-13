// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { data } = context;

    if (!data.content) {
      throw new Error('Content cannot be empty');
    }

    if (!data.channelId) {
      throw new Error('ChannelId cannot be empty');
    }

    const { _id, name, email, avatar } = context.params.user;
    // console.log(`user`, user);

    context.data = {
      content: data.content,
      userId: _id,
      channelId: data.channelId,
      createdAt: new Date().getTime(),
    };

    return context;
  };
};
