import app from '../../src/app';

describe('\'connectedUsers\' service', () => {
  it('registered the service', () => {
    const service = app.service('connected-users');
    expect(service).toBeTruthy();
  });
});
