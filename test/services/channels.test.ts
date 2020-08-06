import app from '../../src/app';

describe('\'channels\' service', () => {
  it('registered the service', () => {
    const service = app.service('channels');
    expect(service).toBeTruthy();
  });
});
