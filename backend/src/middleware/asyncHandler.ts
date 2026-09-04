import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Sends a rejected async handler to the error middleware instead of the floor.
 *
 * Express 4 does not await route handlers, so a promise that rejects inside one
 * is nobody's business: it becomes an unhandled rejection, and Node 20 exits the
 * process on those by default. That is how a single bad INSERT took the whole
 * site down on 2 Sep — a check-constraint violation on one wedding-party row
 * killed the server, Railway restarted it three times, hit its retry limit, and
 * stopped. Every request after that was a 502.
 *
 * Wrapping restores the ordinary contract: the request fails, the error handler
 * turns it into a response, and everyone else's requests carry on.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/** Wraps every handler on a controller object, so none can be missed. */
export function wrapController<T extends Record<string, RequestHandler>>(controller: T): T {
  const wrapped = {} as T;
  for (const [name, handler] of Object.entries(controller) as [keyof T, RequestHandler][]) {
    wrapped[name] = asyncHandler(handler) as T[keyof T];
  }
  return wrapped;
}
