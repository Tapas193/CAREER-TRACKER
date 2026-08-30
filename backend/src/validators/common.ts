import { z } from 'zod';

// Common field validators per Section 13
// Dates are accepted as ISO strings or YYYY-MM-DD and transformed to Date objects
// (Prisma @db.Date requires a Date, not a string).
const toDate = (s: string) => new Date(s);
export const dateString = z
  .string()
  .datetime({ offset: true })
  .or(z.string().date())
  .transform(toDate);
export const optionalDate = z
  .union([
    z.string().datetime({ offset: true }),
    z.string().date(),
    z.null(),
    z.undefined(),
  ])
  .transform((v) => (v == null ? null : toDate(v)))
  .nullable()
  .optional();

// SGPA/CGPA between 0 and 10, 2 decimals
export const gpa = z.coerce.number().min(0).max(10);
// Rating between 1 and 5
export const rating = z.coerce.number().int().min(1).max(5);
// Money >= 0
export const money = z.coerce.number().min(0);
// Team size >= 1
export const teamSize = z.coerce.number().int().min(1);

// Date relationship helper: expiry >= issuing
export function dateAfterOrEqual(earlierPath: string, laterPath: string) {
  return (data: any) => {
    const earlier = data[earlierPath];
    const later = data[laterPath];
    if (earlier && later && new Date(later) < new Date(earlier)) {
      return issue(laterPath, `must be on or after ${earlierPath}`);
    }
    return true;
  };
}

function issue(path: string, message: string) {
  return { path, message };
}

// Ensure end >= start
export const dateRange = (
  data: any,
  startKey = 'startDate',
  endKey = 'endDate'
): { path: string; message: string } | true => {
  const start = data[startKey];
  const end = data[endKey];
  if (start && end && new Date(end) < new Date(start)) {
    return { path: endKey, message: `must be on or after ${startKey}` };
  }
  return true;
};
