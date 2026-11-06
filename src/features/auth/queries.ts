import { prisma } from "@/lib/prisma";

export function findUserForLogin(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: { id: true, passwordHash: true, role: true, isActive: true },
  });
}

export function findPasswordHash(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
}

export function updatePasswordHash(userId: number, passwordHash: string) {
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
