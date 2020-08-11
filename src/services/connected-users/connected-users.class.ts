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

  async remove(id: NullableId, params?: Params) {
    console.log(`params`, params);
    if (params?.provider === "rest" || params?.provider === "socketio") {
      try {
        return super.remove(null, {
          query: {
            userId: params?.user._id,
          },
        });
      } catch (e) {
        console.log(`Error while deleting user from connected users`, e);
      }
    }

    // return await connectedUser.data[0].remove()
    // return connectedUser.remove();
    return super.remove(id, params);
  }
}
