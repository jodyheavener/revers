import {
  serve,
  serveTLS,
  HTTPOptions,
  HTTPSOptions,
  Server,
  ServerRequest,
} from 'https://deno.land/std/http/server.ts';
import { join } from 'https://deno.land/std/path/mod.ts';
import { matchingPath, parseUrl } from './uris.ts';
import { MissingHttpsOptionError } from './errors.ts';
import { DEFAULT_OPTS, VERSION } from './constants.ts';
import {
  respondWithResponse,
  respondWithFile,
  respondWithJson,
  respondWithStatus,
} from './responders.ts';
import {
  ServerOptions,
  Request,
  ServerRoute,
  RouteHandlers,
  StatusHandlers,
  ServerStatus,
  RequestHandler,
  HTTPMethods,
  ProtocolType,
  ServerState,
} from './types.ts';

/**
 * The main Revers server class.
 */
export default class Revers {
  private server!: Server;
  private routeHandlers: RouteHandlers = [];
  private statusHandlers: StatusHandlers = [];
  private protocol: ProtocolType = ProtocolType.HTTP;
  public state: ServerState = ServerState.Stopped;

  constructor(readonly serverOptions: ServerOptions = {}) {
    this.serverOptions = Object.assign(DEFAULT_OPTS, serverOptions);

    const { port, hostname, certFile, keyFile, https } = this.serverOptions;
    const listenOptions: HTTPOptions = { port: port! };

    if (hostname) {
      listenOptions.hostname = hostname;
    }

    if (https) {
      if (!certFile || !keyFile) {
        throw new MissingHttpsOptionError(
          'Cannot create HTTPS server; server options must define certFile and keyFile'
        );
      } else {
        this.protocol = ProtocolType.HTTPS;
        const tlsListenOptions: HTTPSOptions = Object.assign(listenOptions, {
          certFile,
          keyFile,
        });

        this.server = serveTLS(tlsListenOptions);
      }
    } else {
      this.server = serve(listenOptions);
    }

    console.log(`Thanks for using Revers (v${VERSION})`);
  }

  /** Add one or more route handlers */
  addRouteHandler(...handlers: ServerRoute[]): void {
    this.routeHandlers.push(...handlers);
  }

  /** Add one or more status handlers */
  addStatusHandler(...handlers: ServerStatus[]): void {
    this.statusHandlers.push(...handlers);
  }

  /** Handle a status code not handled by a route */
  handleStatus(status: number, handler: RequestHandler): void {
    this.statusHandlers.push({
      status,
      handler,
    });
  }

  /** Look for a route handler */
  private findRouteHandler(
    request: ServerRequest
  ): {
    routeHandler?: ServerRoute;
    splitPatternPath?: string[];
    splitTestPath?: string[];
  } {
    const method = request.method.toLowerCase();
    const routeHandler = this.routeHandlers
      .reverse()
      .find(
        (handler) =>
          method === handler.method &&
          matchingPath(handler.path, request.url)?.splitPatternPath?.length
      );

    if (routeHandler) {
      const match = matchingPath(routeHandler.path, request.url);
      if (match !== undefined) {
        const { splitPatternPath, splitTestPath } = match;
        return {
          routeHandler,
          splitPatternPath,
          splitTestPath,
        };
      }
      return {
        routeHandler,
      };
    } else {
      return {};
    }
  }

  /** Look for a status code handler */
  private findStatusHandler(status: number): ServerStatus | undefined {
    return this.statusHandlers.find((handler) => handler.status === status);
  }

  /** Convenience method to handle a HTTP GET request */
  get(path: string, handler: RequestHandler): void {
    this.addRouteHandler({ method: HTTPMethods.Get, path, handler });
  }

  /** Convenience method to handle a HTTP POST request */
  post(path: string, handler: RequestHandler): void {
    this.addRouteHandler({ method: HTTPMethods.Post, path, handler });
  }

  /** Convenience method to handle a HTTP PUT request */
  put(path: string, handler: RequestHandler): void {
    this.addRouteHandler({ method: HTTPMethods.Put, path, handler });
  }

  /** Convenience method to handle a HTTP PATCH request */
  patch(path: string, handler: RequestHandler): void {
    this.addRouteHandler({ method: HTTPMethods.Patch, path, handler });
  }

  /** Convenience method to handle a HTTP DELETE request */
  delete(path: string, handler: RequestHandler): void {
    this.addRouteHandler({ method: HTTPMethods.Delete, path, handler });
  }

  /** Convenience method to handle a HTTP OPTIONS request */
  options(path: string, handler: RequestHandler): void {
    this.addRouteHandler({ method: HTTPMethods.Options, path, handler });
  }

  /** Convenience method to handle a HTTP CONNECT request */
  connect(path: string, handler: RequestHandler): void {
    this.addRouteHandler({ method: HTTPMethods.Connect, path, handler });
  }

  /** Convenience method to handle a HTTP TRACE request */
  trace(path: string, handler: RequestHandler): void {
    this.addRouteHandler({ method: HTTPMethods.Trace, path, handler });
  }

  /** Convenience method to handle a HTTP HEAD request */
  head(path: string, handler: RequestHandler): void {
    this.addRouteHandler({ method: HTTPMethods.Head, path, handler });
  }

  /** Check if the static file exists */
  private async staticFileExists(path: string): Promise<boolean> {
    const { staticPath } = this.serverOptions;

    if (!staticPath) {
      return Promise.resolve(false);
    }

    const fullStaticPath = join(staticPath, path);
    let fileExists;

    try {
      const info = await Deno.stat(fullStaticPath);
      // if Deno can see that it's a file, it must exist
      fileExists = info.isFile;
    } catch (error) {
      fileExists = false;
    }

    return fileExists;
  }

  private printListeningMessage() {
    const { hostname, port } = this.serverOptions;
    const listeningUrl = `${this.protocol}://${hostname}:${port}`;
    console.log(`Server started: ${listeningUrl}`);
  }

  /** Start the server and listen for incoming requests */
  async start() {
    this.printListeningMessage();
    this.state = ServerState.Started;

    for await (const request of this.server) {
      const {
        routeHandler,
        splitPatternPath,
        splitTestPath,
      } = this.findRouteHandler(request);
      const notFoundStatusHandler = this.findStatusHandler(404);

      const { location, params, query } = parseUrl(
        request,
        this.protocol,
        splitPatternPath,
        splitTestPath
      );

      const modifiedRequest: Request = Object.assign(request, {
        location,
        params,
        query,
        _respond: request.respond,
        // set these up after
        respond: () => {},
        file: () => {},
        json: () => {},
        status: () => {},
      });

      modifiedRequest.respond = respondWithResponse.bind({
        request: modifiedRequest,
        serverOptions: this.serverOptions,
      });

      modifiedRequest.json = respondWithJson.bind({ request: modifiedRequest });

      modifiedRequest.file = respondWithFile.bind({
        request: modifiedRequest,
        serverOptions: this.serverOptions,
      });

      modifiedRequest.status = respondWithStatus.bind({
        request: modifiedRequest,
        findStatusHandler: this.findStatusHandler.bind(this),
      });

      if (routeHandler) {
        routeHandler.handler(modifiedRequest);
      } else if (
        await this.staticFileExists(modifiedRequest.location.pathname)
      ) {
        modifiedRequest.file(modifiedRequest.location.pathname, 200);
      } else if (notFoundStatusHandler) {
        notFoundStatusHandler.handler(modifiedRequest);
      } else {
        modifiedRequest.respond({ body: 'Not Found', status: 404 });
      }
    }
  }

  /** Close the server and its listener */
  stop() {
    this.server.listener.close();
    this.state = ServerState.Stopped;
  }
}
