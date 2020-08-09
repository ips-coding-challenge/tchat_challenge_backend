import { Service, MongooseServiceOptions } from "feathers-mongoose";
import { Application } from "../../declarations";
import { Params, NullableId } from "@feathersjs/feathers";
import {
  NotAuthenticated,
  NotFound,
  MethodNotAllowed,
  BadRequest,
} from "@feathersjs/errors";

interface Data {
  userId: string;
  channelId: string;
}

export class ConnectedUsers extends Service {
  private app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data: Data, params?: Params) {
    console.log(`Data`, data);

    // TODO
    // I should use find instead of get cause i populate messages in the get hooks
    const channel = await this.app.service("channels").get(data.channelId);

    if (!channel) {
      throw new NotFound("That channel doesn't exists");
    }
    console.log(`Channel`, channel);

    const newData = {
      userId: params?.user._id,
      channelId: channel._id,
    };

    const { _id, name, email } = params?.user;

    let final = await super.create(newData, params);
    console.log(`Final`, final);
    return { ...final, user: { _id, name, email } };
  }

  async remove(id: NullableId, params?: Params) {
    //the id should be the channelId

    console.log(`params`, params?.query);
    if (params?.provider === "rest") {
      if (!params?.query?.channelId) {
        throw new BadRequest("The channelId is required");
      }

      const connectedUser = await this.app.service("connected-users").find({
        query: {
          userId: params?.user._id,
          channelId: params?.query?.channelId,
        },
        paginate: false,
      });

      if (!connectedUser) {
        throw new NotFound();
      }
      console.log(`ConnectedUser`, connectedUser);
      return super.remove(connectedUser[0]._id, params);
    }

    // return await connectedUser.data[0].remove()
    // return connectedUser.remove();
    return super.remove(id, params);
  }
}
