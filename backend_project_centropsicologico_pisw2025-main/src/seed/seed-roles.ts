import prisma from "../lib/prisma";

async function main() {
  // Crear los roles manualmente
  await prisma.role.create({ data: { name: "ADMIN" } });
  await prisma.role.create({
    data: { name: "ADMISSION" },
  });
  await prisma.role.create({
    data: { name: "PSYCHOLOGIST" },
  });
  await prisma.role.create({ data: { name: "INTERNAL" } });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
