// Non-destructive seeder for PreparationResource rows.
//
// Runs on every Vercel backend build (see vercel.json buildCommand) so the
// production database is kept in sync with the placement-preparation library.
//
// SAFETY: this script ONLY touches the `preparationResource` table. It never
// deletes or modifies users, students, courses, placements, or any other data.
// It is idempotent: it replaces the current resource rows with the canonical
// seed set, so it is safe to run repeatedly.
import { PrismaClient } from '@prisma/client';
import { preparationResources } from '../prisma/preparation-seed-data.mjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.preparationResource.deleteMany();
  const rows = preparationResources.map((r) => ({
    title: r.title,
    description: r.description ?? null,
    category: r.category,
    topic: r.topic,
    resourceType: r.resourceType,
    url: r.url,
    thumbnailUrl: r.thumbnailUrl ?? null,
    duration: r.duration ?? null,
    difficulty: r.difficulty ?? null,
  }));
  await prisma.preparationResource.createMany({ data: rows });
  const count = await prisma.preparationResource.count();
  console.log(`[seed-preparation] preparation resources ready: ${count}`);
}

main()
  .catch((e) => {
    console.error('[seed-preparation] failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
