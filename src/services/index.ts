import { Application } from "../declarations";
import users from "./users/users.service";
import messages from "./messages/messages.service";
import channels from "./channels/channels.service";
import connectedUsers from './connected-users/connected-users.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(messages);
  app.configure(channels);
  app.configure(connectedUsers);
}
