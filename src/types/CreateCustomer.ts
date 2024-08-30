import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export type CreateCustomer = Prisma.Args<
  typeof prisma.customer,
  "create"
>["data"];
