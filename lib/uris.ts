import { ServerRequest } from 'https://deno.land/std/http/server.ts';
import { RequestParams } from './types.ts';

function stripSlashes(path: string) {
  return path.replace(/^\/|\/$/g, '');
}

function splitUrlEnd(path: string) {
  const splitIndex = path.search(/\?|#/);
  if (splitIndex > -1) {
    return path.slice(0, splitIndex);
  }
  return path;
}

export function matchingPath(
  patternPath: string,
  testPath: string
): { splitPatternPath: string[]; splitTestPath: string[] } | undefined {
  const splitPatternPath = splitUrlEnd(stripSlashes(patternPath))
    .split('/')
    .filter((s) => s && s.length);
  const splitTestPath = splitUrlEnd(stripSlashes(testPath))
    .split('/')
    .filter((s) => s && s.length);

  if (
    splitPatternPath.length === splitTestPath.length &&
    splitTestPath.every((testSegment, index) => {
      const patternSegment = splitPatternPath[index];

      if (patternSegment.startsWith(':')) {
        return true;
      }

      return testSegment === patternSegment;
    })
  ) {
    return { splitPatternPath, splitTestPath };
  } else {
    return;
  }
}

export function parseParams(
  splitPatternPath: string[],
  splitTestPath: string[]
): RequestParams {
  const params: RequestParams = {};

  splitPatternPath.forEach((segment, index) => {
    if (segment.startsWith(':')) {
      let value: string | number = splitTestPath[index];

      // @ts-expect-error
      if (!isNaN(value)) {
        value = parseFloat(value);
      }

      params[segment.slice(1, segment.length)] = value;
    }
  });

  return params;
}

export function parseUrl(
  request: ServerRequest,
  protocol: string,
  splitPatternPath: string[] | undefined,
  splitTestPath: string[] | undefined
): {
  location: URL;
  params: RequestParams;
  query: URLSearchParams;
} {
  const baseUrl = `${protocol}://${(request.conn.localAddr as any).hostname}:${
    (request.conn.localAddr as any).port
  }`;

  const parsedLocation = new URL(request.url, baseUrl);

  return {
    location: parsedLocation,
    params: splitPatternPath
      ? parseParams(splitPatternPath, splitTestPath!)
      : {},
    query: parsedLocation.searchParams,
  };
}
