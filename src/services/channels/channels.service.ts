// Initializes the `channels` service on path `/channels`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Channels } from './channels.class';
import createModel from '../../models/channels.model';
import hooks from './channels.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'channels': Channels & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/channels', new Channels(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('channels');

  service.hooks(hooks);
}
