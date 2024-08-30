import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export type CreateMeasure = Prisma.Args<
  typeof prisma.measure,
  "create"
>["data"];
