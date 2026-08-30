import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that validates req.body (and optionally req.params/req.query)
 * against a Zod schema and attaches the parsed result to req.validated.
 */
export const validate = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse((req as any)[source]);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    (req as any).validated = result.data;
    next();
  };
};
