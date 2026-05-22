import { encryptPassword } from "../common/utils";
import prisma from "../lib/prisma";

async function main() {
  // Crear los roles manualmente
  const roleAdmin = await prisma.role.findFirst({ where: {
    name: "ADMIN"
  } });

  if (!roleAdmin) {
    throw Error("RoleAdmin does not exists")
  }
  // Crear admin
  await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "User",
      dni: "00000000",
      email: "gruposensespsicologos@gmail.com",
      password: await encryptPassword("MySecurePassword2025ExtraSecure"),
      roles: {
        create: [{ role: { connect: { id: roleAdmin.id } } }],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
