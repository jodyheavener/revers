# Revers

💻 A simple web server for [Deno](https://deno.land/).

Here's what it can do, so far:

- Support HTTPS
- Path-based static file serving
- Dynamic parameter-based routing
- Status-code handling
- Provides convenience methods for JSON, static file, and status code responses
- Fully-typed objects and methods

_Built and tested in Deno v1.0.2_

## Usage

📦 The main module is located at https://deno.land/x/revers/mod.ts.

Using it is pretty simple:

- Import the default class `Revers` and create a new instance.
- Define routes using the instance's `get`, `post`, `patch`, etc convenience methods. Define more than one at a time with `addRouteHandler`.
- Define a default status code handler, such as 404, using `handleStatus`. Define more than one at a time with `addStatusHandler`.
- When you're ready to start listening for requests, call `start` on the instance.

ℹ️ Note that your file must be executed with a series of command line arguments:

```shell
deno run \
  --allow-net \  # Allow network access
  --allow-read \ # Allow reading files
  --unstable \   # Allow use of unstable Deno lib
  my-server.ts
```

### Example

A very basic example might look like this:

```typescript
import Revers from 'https://deno.land/x/revers/mod.ts';

const server = new Revers({
  port: 8080,
});

server.get('/:organization/:repo', (request) => {
  const { organization, repo } = request.params;
  const repoInfo = await repoLookup(organization, repo);
  request.json({ data: repoInfo });
});

server.handleStatus(404, (request) => {
  request.json({ message: 'Not found' }, 404);
});

server.start();
```

👉 See more examples [here](./examples).

## Development

Want to make Revers better? Go for it. In lieu of a proper contribution guide (it's coming), just try to keep the same style of code, write tests, and submit a PR, okay?

### Testing

Run the test suite:

```shell
deno test --allow-net --allow-read --unstable tests/*.ts
```

You can filter tests with `--filter "hello world"`

Learn more about Deno testing [here](https://deno.land/manual/testing).
