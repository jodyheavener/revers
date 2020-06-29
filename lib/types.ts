import { ServerRequest, Response } from 'https://deno.land/std/http/server.ts';

/**
 * Options to construct the Revers server with.
 */
export type ServerOptions = {
  /** Host name, defaults to localhost */
  hostname?: string;
  /** Port to serve on, defaults to 3000 */
  port?: number;
  /**
   * Start the server with HTTPS support
   * Requires certFile and keyFile to be defined.
   */
  https?: boolean;
  /** Certificate file for use with HTTPS */
  certFile?: string;
  /** Key file for use with HTTPS */
  keyFile?: string;
  /** Absolute path to your static files */
  staticPath?: string;
  /**
   * Sends an `x-powered-by` header with the current
   * Revers version. Leave enabled to show some love :)
   */
  poweredBy?: boolean;
};

/**
 * The function called when handling a route,
 * status, or other request response.
 */
export type RequestHandler = (request: Request) => void;

/**
 * Info used to handle a route response.
 */
export type ServerRoute = {
  /** Path to observe for requests */
  path: string;
  /** HTTP method to observe for requests */
  method: HTTPMethods;
  /** Function to handle the request response */
  handler: RequestHandler;
};

/**
 * Info used to handle a status response.
 */
export type ServerStatus = {
  status: number;
  handler: RequestHandler;
};

/**
 * An array of ServerRoute objects.
 */
export type RouteHandlers = ServerRoute[];

/**
 * An array of ServerStatus objects.
 */
export type StatusHandlers = ServerStatus[];

/**
 * A Revers server request. Augments Deno's ServerRequest.
 */
export type Request = ServerRequest & {
  /** Fully parsed location of the request */
  location: URL;
  /** Parsed parameters from the address */
  params: RequestParams;
  /** Query parameters from the address */
  query: URLSearchParams;
  /** Deno's ServerRequest response function */
  _respond: (response: Response) => void;
  /**
   * Revers's response function. This wraps _respond,
   * but it's generally recommended to use this over
   * Deno's _respond.
   */
  respond: (response: Response) => void;
  /**
   * Convenience method to respond with a static file.
   * Requires the staticPath server option to be defined.
   */
  file: (filePath: string, status?: number, headers?: Headers) => void;
  /** Convenience method to respond with a JSON object. */
  json: (
    object: { [key: string]: any },
    status?: number,
    headers?: Headers
  ) => void;
  /** Convenience method to respond with a status code and empty body. */
  status: (status: number, headers?: Headers) => void;
};

/**
 * Parameters derived from a Request URL.
 */
export type RequestParams = {
  [name: string]: string | number;
};

/**
 * All permitted HTTP methods.
 */
export enum HTTPMethods {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Patch = 'patch',
  Delete = 'delete',
  Options = 'options',
  Connect = 'connect',
  Trace = 'trace',
  Head = 'head',
}

/**
 * All permitted protocols.
 */
export enum ProtocolType {
  HTTP = 'http',
  HTTPS = 'https',
}

/**
 * Server listening states.
 */
export enum ServerState {
  Started = 'started',
  Stopped = 'stopped',
}
