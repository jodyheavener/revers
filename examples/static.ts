import Revers from 'https://deno.land/x/revers/mod.ts';
import { __ } from 'https://deno.land/x/dirname/mod.ts';
import { join } from 'https://deno.land/std/path/mod.ts';

const server = new Revers({
  port: 8080,
  // assuming a relative dir named 'public' exists with static files
  // Deno doesn't have a great equivalent to Node's __dirname, but this works
  staticPath: join(__(import.meta).__dirname, 'public'),
});

// If you're truly only serving static files, no routes need to be defined.
// Revers will scan the public directory for a matching static files and
// if found will serve them.

// However, you can also use staticPath with defined routes to serve static
// assets, like images, stylesheets, and scripts. Defined routes will take
// precedence over static routes.

server.handleStatus(404, (request) => {
  request.file('404.html');
});

server.handleStatus(500, (request) => {
  request.file('500.html');
});

server.start();
