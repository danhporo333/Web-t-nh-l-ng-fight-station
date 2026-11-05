export type ActionError = { code: string; message: string; details?: unknown };

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: ActionError };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail(code: string, message: string, details?: unknown): ActionResult<never> {
  return { success: false, error: { code, message, details } };
}
