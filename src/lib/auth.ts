import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, fullName: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOwner() {
  const user = await requireUser();
  if (user.role !== "OWNER") redirect("/me");
  return user;
}
