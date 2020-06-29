import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import Revers from '../lib/revers.ts';
import { DEFAULT_OPTS } from '../lib/constants.ts';
import { ServerOptions, ServerState } from '../lib/types.ts';

// Deno.test('server - can start and stop repeatedly', () => {
//   const server = new Revers();

//   server.start();
//   assertEquals(server.state, ServerState.Started);

//   server.stop();
//   assertEquals(server.state, ServerState.Stopped);

//   server.start();
//   assertEquals(server.state, ServerState.Started);

//   server.stop();
//   assertEquals(server.state, ServerState.Stopped);
// });

Deno.test('server - has default config', () => {
  const server = new Revers();
  assertEquals(server.serverOptions, DEFAULT_OPTS);
  server.stop();
});

Deno.test('server - can be configured', () => {
  const options = {
    port: 1234,
    poweredBy: false,
    staticPath: './somewhere/else',
  } as ServerOptions;

  const server = new Revers(options);

  assertEquals(server.serverOptions.port, options.port);
  assertEquals(server.serverOptions.poweredBy, options.poweredBy);
  assertEquals(server.serverOptions.staticPath, options.staticPath);

  server.stop();
});
