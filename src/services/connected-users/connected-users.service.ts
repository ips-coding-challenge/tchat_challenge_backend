// Initializes the `connectedUsers` service on path `/connected-users`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { ConnectedUsers } from "./connected-users.class";
import createModel from "../../models/connected-users.model";
import hooks from "./connected-users.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    "connected-users": ConnectedUsers & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/connected-users", new ConnectedUsers(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("connected-users");

  service.hooks(hooks);
  service.options.multi = ["patch", "remove"];

  // service.publish("created", (data, hook) => {
  //   console.log(`From connected user services`, data);
  //   return app.channel(`rooms/${data.channelId}`).send(data);
  // });
}
