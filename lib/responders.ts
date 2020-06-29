import { Response } from 'https://deno.land/std/http/server.ts';
import { join, extname } from 'https://deno.land/std/path/mod.ts';
import { ServerStatus, Request, ServerOptions } from './types.ts';
import { VERSION, MEDIA_TYPES } from './constants.ts';
import {
  MissingStaticFileOptionError,
  FileReadFailureError,
} from './errors.ts';

export async function respondWithResponse(
  this: {
    request: Request;
    serverOptions: ServerOptions;
  },
  response: Response
) {
  if (this.serverOptions.poweredBy) {
    response.headers?.set('x-powered-by', `Revers v${VERSION}`);
  }

  this.request._respond(response);
}

function contentType(path: string): string | undefined {
  return MEDIA_TYPES[extname(path)];
}

export async function respondWithFile(
  this: {
    request: Request;
    serverOptions: ServerOptions;
  },
  path: string,
  status?: number,
  headers: Headers = new Headers()
) {
  const { staticPath } = this.serverOptions;

  if (!staticPath) {
    throw new MissingStaticFileOptionError(
      'Cannot send file; server options must define staticPath.'
    );
  }

  const fullStaticPath = join(staticPath, path);

  try {
    const [file, fileInfo] = await Promise.all([
      Deno.open(fullStaticPath),
      Deno.stat(fullStaticPath),
    ]);

    headers.set('content-length', fileInfo.size.toString());
    const contentTypeValue = contentType(fullStaticPath);
    if (contentTypeValue) {
      headers.set('content-type', contentTypeValue);
    }

    this.request.done.then(() => {
      file.close();
    });

    this.request.respond({
      body: file,
      status,
      headers,
    });
  } catch (error) {
    throw new FileReadFailureError(
      `There was an error reading the file "${fullStaticPath}". ${error.message}`
    );
  }
}

export function respondWithJson(
  this: {
    request: Request;
  },
  object: { [key: string]: any },
  status?: number,
  headers?: Headers
) {
  const outputHeaders = headers || new Headers();
  outputHeaders.append('content-type', MEDIA_TYPES['.json']);

  this.request.respond({
    body: JSON.stringify(object),
    status,
    headers: outputHeaders,
  });
}

export function respondWithStatus(
  this: {
    request: Request;
    findStatusHandler: (status: number) => ServerStatus | undefined;
  },
  status: number,
  headers?: Headers
) {
  const statusHandler = this.findStatusHandler(status);
  if (statusHandler) {
    return statusHandler.handler(this.request);
  }

  this.request.respond({
    status,
    headers,
  });
}
