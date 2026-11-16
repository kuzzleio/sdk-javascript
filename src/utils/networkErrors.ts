/**
 * Errors a Kuzzle node returns before executing a request because it is
 * stopping (SIGTERM received, rolling update, scale down).
 *
 * The request had no effect on the node that rejected it: it can be sent
 * again, as is, to another node of the cluster.
 */
export const NODE_SHUTTING_DOWN_ERROR_IDS: readonly string[] = [
  "api.process.shutting_down",
  "network.entrypoint.shutting_down",
];

/**
 * HTTP statuses meaning "no node could serve this request right now",
 * as opposed to a refusal of the request itself.
 */
const UNAVAILABLE_STATUSES: readonly number[] = [502, 503, 504];

/**
 * Tells whether an error, or a raw API error payload, comes from a Kuzzle
 * node that is shutting down.
 */
export function isNodeShuttingDownError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  return NODE_SHUTTING_DOWN_ERROR_IDS.includes((error as { id?: string }).id);
}

/**
 * Tells whether a request failed because no Kuzzle node could answer it
 * (lost socket, timeout, node shutting down, gateway errors), as opposed to
 * an answer from Kuzzle refusing it (invalid token, forbidden, bad request).
 *
 * Errors raised by the SDK itself carry no HTTP status: the request never
 * got an answer, so they count as transient.
 */
export function isTransientNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  if (isNodeShuttingDownError(error)) {
    return true;
  }

  const status = (error as { status?: unknown }).status;

  if (typeof status !== "number") {
    return true;
  }

  return UNAVAILABLE_STATUSES.includes(status);
}
