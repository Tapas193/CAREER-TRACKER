import { z } from 'zod';
import { dateString, optionalDate, dateAfterOrEqual } from './common';

export const createCertificationSchema = z
  .object({
    studentId: z.coerce.number().int().positive().optional(),
    certificationName: z.string().min(1).max(150),
    issuingOrganisation: z.string().min(1).max(150),
    issuingDate: dateString,
    expiryDate: optionalDate,
    certificationUrl: z.string().max(500).nullable().optional(),
  })
  .superRefine(dateAfterOrEqual('issuingDate', 'expiryDate'));

export const updateCertificationSchema = z
  .object({
    certificationName: z.string().min(1).max(150).optional(),
    issuingOrganisation: z.string().min(1).max(150).optional(),
    issuingDate: dateString.optional(),
    expiryDate: optionalDate,
    certificationUrl: z.string().max(500).nullable().optional(),
  })
  .superRefine(dateAfterOrEqual('issuingDate', 'expiryDate'));

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
