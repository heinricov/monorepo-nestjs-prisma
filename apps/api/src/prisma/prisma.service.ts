// apps/api/src/prisma/prisma.service.ts
import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class PrismaService {
  get client() {
    return prisma;
  }
}
