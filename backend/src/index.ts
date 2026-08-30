import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { config } from './config';
import { prisma } from './config/prisma';

async function main() {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Career Track API listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  prisma.$disconnect();
  process.exit(1);
});
