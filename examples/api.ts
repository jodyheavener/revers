import Revers from 'https://deno.land/x/revers/mod.ts';

const server = new Revers({
  port: 8080,
});

server.get('/:organization/:repo', (request) => {
  const { organization, repo } = request.params;
  // assuming this method exists
  const repoInfo = await repoLookup(organization, repo);
  request.json({ data: repoInfo });
});

server.handleStatus(404, (request) => {
  request.json({ message: 'Not found' }, 404);
});

server.start();
