import { PreparationResourceType, PreparationDifficulty } from '@prisma/client';

export interface PreparationSeedResource {
  title: string;
  description: string;
  category: string;
  topic: string;
  resourceType: PreparationResourceType;
  url: string;
  thumbnailUrl?: string;
  duration?: string;
  difficulty?: PreparationDifficulty;
}

export declare const preparationResources: PreparationSeedResource[];
