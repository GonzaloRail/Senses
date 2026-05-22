import { encryptPassword } from "../common/utils";
import prisma from "../lib/prisma";

async function main() {
  // Crear región, provincia y distrito con localizaciones
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.office.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();
  await prisma.district.deleteMany();
  await prisma.province.deleteMany();
  await prisma.region.deleteMany();

  const region = await prisma.region.create({
    data: {
      id: "region-1",
      name: "Lima",
      provinces: {
        create: [
          {
            id: "province-1",
            name: "Lima Province",
            districts: {
              create: [
                {
                  id: "district-1",
                  name: "Miraflores",
                  locations: {
                    create: [
                      {
                        id: "location-1",
                        name: "Sede Central",
                        address: "Av. Principal 123",
                      },
                      {
                        id: "location-2",
                        name: "Sede Sur",
                        address: "Av. Secundaria 456",
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Crear los roles manualmente
  const roleAdmin = await prisma.role.create({ data: { name: "ADMIN" } });
  const roleAdmission = await prisma.role.create({
    data: { name: "ADMISSION" },
  });
  const rolePsychologist = await prisma.role.create({
    data: { name: "PSYCHOLOGIST" },
  });
  const roleInternal = await prisma.role.create({ data: { name: "INTERNAL" } });

  // Crear usuarios
  const user1 = await prisma.user.create({
    data: {
      firstName: "Alice",
      lastName: "Smith",
      dni: "12342678",
      email: "user1@user.com",
      password: await encryptPassword("password"),
      roles: {
        create: [
          { role: { connect: { id: roleAdmin.id } } },
          { role: { connect: { id: roleAdmission.id } } },
          { role: { connect: { id: rolePsychologist.id } } },
        ],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: "Bob",
      lastName: "Johnson",
      dni: "87654321",
      email: "user2@user.com",
      password: await encryptPassword("password"),
      roles: {
        create: [
          { role: { connect: { id: rolePsychologist.id } } },
          { role: { connect: { id: roleInternal.id } } },
        ],
      },
    },
  });

  // Crear oficinas para cada usuario
  const locations = await prisma.location.findMany();

  await Promise.all([
    prisma.office.create({
      data: {
        name: "Oficina 1B",
        type: "Admisión",
        capacity: 8,
        locationId: locations[1].id,
      },
    }),
    prisma.office.create({
      data: {
        name: "Oficina 2A",
        type: "Psicología",
        capacity: 5,
        locationId: locations[0].id,
      },
    }),
    prisma.office.create({
      data: {
        name: "Oficina 2B",
        type: "Admisión",
        capacity: 7,
        locationId: locations[1].id,
      },
    }),
  ]);

  console.log("🌱 Seed completado ");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
