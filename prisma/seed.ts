import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.shift.upsert({
    where: { code: "MORNING" },
    update: {},
    create: {
      code: "MORNING",
      name: "Ca sáng",
      startTime: "07:30",
      endTime: "16:00",
      defaultHours: 8.5,
      defaultRate: 24000,
    },
  });
  await prisma.shift.upsert({
    where: { code: "AFTERNOON" },
    update: {},
    create: {
      code: "AFTERNOON",
      name: "Ca chiều",
      startTime: "16:00",
      endTime: "02:00",
      defaultHours: 10,
      defaultRate: 26000,
    },
  });

  const username = process.env.OWNER_USERNAME;
  const password = process.env.OWNER_PASSWORD;
  if (!username || !password) {
    throw new Error("Thiếu OWNER_USERNAME hoặc OWNER_PASSWORD trong .env");
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  if (!existing) {
    await prisma.user.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(password, 10),
        fullName: "Chủ quán",
        role: "OWNER",
      },
    });
    console.log("Đã tạo tài khoản chủ quán: " + username);
  } else {
    console.log("Tài khoản chủ quán đã có: " + username);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
