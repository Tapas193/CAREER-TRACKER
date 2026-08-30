import { Response } from 'express';

export interface ApiError {
  status: number;
  message: string;
  errors?: unknown[];
}

export class AppError extends Error {
  status: number;
  errors?: unknown[];

  constructor(message: string, status = 400, errors?: unknown[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/** Success response envelope */
export function success(res: Response, data: unknown, message = 'Operation successful', status = 200) {
  return res.status(status).json({ success: true, data, message });
}

/** Error response envelope - never leaks stack traces */
export function failure(res: Response, message: string, status = 500, errors?: unknown[]) {
  const body: { success: boolean; message: string; errors?: unknown[] } = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
}

export function asyncHandler(
  fn: (req: any, res: Response, next: any) => Promise<unknown>
) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
