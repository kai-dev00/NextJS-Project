// lib/prismaWrapper.ts
import { Prisma } from "@/app/generated/prisma/browser";
import prisma from "@/lib/prisma";

// Dynamically get all Prisma models
type PrismaModels = keyof typeof prisma;
type ModelName = Exclude<PrismaModels, `$${string}`>; // exclude internal $ methods

interface LogContext {
  userId: string | null;
  submodule?: string;
}

// -------------------- CREATE --------------------
export async function createWithLog<T>(
  model: ModelName,
  data: any,
  context: LogContext,
  options?: any,
): Promise<T> {
  const result = await (prisma as any)[model].create({ data, ...options });

  await prisma.actionLog.create({
    data: {
      userId: context.userId,
      module: String(model),
      submodule: context.submodule ?? result.id,
      action: "create",
      recordId: result.id,
      before: Prisma.JsonNull,
      after: result ?? Prisma.JsonNull,
    },
  });

  return result as T;
}

// -------------------- UPDATE --------------------
export async function updateWithLog<T>(
  model: ModelName,
  where: any,
  data: any,
  context: LogContext,
  options?: any,
): Promise<T> {
  let before = null;
  try {
    // before = await (prisma as any)[model].findUnique({ where });
    before = await (prisma as any)[model].findUnique({ where, ...options });
  } catch {}

  const result = await (prisma as any)[model].update({
    where,
    data,
    ...options,
  });

  await prisma.actionLog.create({
    data: {
      userId: context.userId,
      module: String(model),
      submodule: context.submodule ?? result.id,
      action: "update",
      recordId: result.id,
      before: before ?? Prisma.JsonNull,
      after: result ?? Prisma.JsonNull,
    },
  });

  return result as T;
}

// -------------------- DELETE --------------------
// export async function deleteWithLog<T>(
//   model: ModelName,
//   where: any,
//   context: LogContext,
//   options?: any,
// ): Promise<T> {
//   let before = null;
//   try {
//     before = await (prisma as any)[model].findUnique({
//       where,
//       include: options?.include ?? {},
//     });
//   } catch {}

//   const result = await (prisma as any)[model].delete({ where });

//   await prisma.actionLog.create({
//     data: {
//       userId: context.userId,
//       module: String(model),
//       submodule: context.submodule ?? result.id,
//       action: "delete",
//       recordId: result.id,
//       before: before ?? Prisma.JsonNull,
//       after: Prisma.JsonNull,
//     },
//   });

//   return result as T;
// }
export async function deleteWithLog<T>(
  model: ModelName,
  where: any,
  context: LogContext,
  options?: { include?: any; before?: any },
): Promise<T> {
  const before =
    options?.before ??
    (await (prisma as any)[model].findUnique({
      where,
      include: options?.include ?? {},
    }));

  const result = await (prisma as any)[model].delete({ where });

  await prisma.actionLog.create({
    data: {
      userId: context.userId,
      module: String(model),
      submodule: context.submodule ?? result.id?.toString() ?? null,
      action: "delete",
      recordId: result.id,
      before: before ?? Prisma.JsonNull,
      after: Prisma.JsonNull,
    },
  });

  return result as T;
}
