import {
  assertArrayContains,
  assertEquals,
} from 'https://deno.land/std/testing/asserts.ts';
import { matchingPath, parseParams, parseUrl } from '../lib/uris.ts';
import { ServerRequest } from '../../../../Library/Caches/deno/deps/https/deno.land/c1723c570639ab9ac7b57b4c6169663cda9d5f85151d647088ae17884514b868.ts';

Deno.test('uris - matchingPath - matches exact', () => {
  const splitPatternResult = ['foo', 'bar'];
  const splitTestResult = ['foo', 'bar'];

  const matches = [
    matchingPath('/foo/bar', '/foo/bar'),
    matchingPath('foo/bar/', 'foo/bar'),
    matchingPath('foo/bar', 'foo/bar/'),
    matchingPath('/foo/bar/', 'foo/bar?foo=bar'),
    matchingPath('/foo/bar/', 'foo/bar/#bar=baz'),
  ];

  matches.forEach((match) => {
    assertArrayContains(match!.splitPatternPath, splitPatternResult);
    assertArrayContains(match!.splitTestPath, splitTestResult);
  });
});

Deno.test('uris - matchingPath - matches param', () => {
  const splitPatternResult = [':lorem', 'ipsum'];
  const splitTestResult = ['dolor', 'ipsum'];

  const matches = [
    matchingPath('/:lorem/ipsum', '/dolor/ipsum'),
    matchingPath(':lorem/ipsum/', 'dolor/ipsum'),
    matchingPath(':lorem/ipsum', 'dolor/ipsum/'),
    matchingPath('/:lorem/ipsum/', 'dolor/ipsum/?foo=bar'),
    matchingPath('/:lorem/ipsum/', 'dolor/ipsum#bar=baz'),
  ];

  matches.forEach((match) => {
    assertArrayContains(match!.splitPatternPath, splitPatternResult);
    assertArrayContains(match!.splitTestPath, splitTestResult);
  });
});

Deno.test('uris - parseParams - parses the parts', () => {
  const splitPatternResult = [':lorem', 'ipsum', ':id'];

  assertEquals(
    parseParams(splitPatternResult, ['hello', 'doesnt matter', 'world']),
    {
      lorem: 'hello',
      id: 'world',
    }
  );

  assertEquals(
    parseParams(splitPatternResult, ['blah', 'doesnt matter', '23']),
    {
      lorem: 'blah',
      id: 23,
    }
  );
});

// Deno.test('uris - parseUrl - parses the request url', () => {
//   parseUrl(
//     {
//       request: {
//         conn: {
//           localAddr: {
//             hostname: 'localhost',
//             port: 8080,
//           },
//         },
//         url: '/index.html?howdy=partner',
//       } as ServerRequest,
//     },
//     'http',
//     ['index.html'],
//     ['index.html']
//   );
// });

