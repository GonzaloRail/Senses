import { AppointmentStatus, Prisma } from "@prisma/client";
import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import {
  GetAllOfficesPaginatedInput,
  GetOfficeByIdInput,
  UpdateOfficeInput,
  CreateOfficeInput,
  GetAvailableOfficesByDateAndNameInput,
  GetAllOfficesSearchInput,
} from "./schema";

export const getAllOfficesPaginatedService = async ({
  page,
  take,
  search,
  locationId,
}: GetAllOfficesPaginatedInput) => {
  const officesDB = await prisma.office.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      name: {
        contains: search,
      },
      locationId: locationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      location: {
        select: { name: true },
      },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.office.count({
      where: {
        name: {
          contains: search,
        },
        locationId: locationId,
      },
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    offices: officesDB,
  };
};

export const getOfficeByIdService = async ({ id }: GetOfficeByIdInput) => {
  const office = await prisma.office.findUnique({
    where: { id },
    include: {
      location: {
        select: {
          id: true,
          name: true,
        },
      },
      itemInstances: {
        select: {
          id: true,
          item: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!office) {
    throw new AppError("Oficina no encontrada", 404);
  }

  return office;
};

export const updateOfficeService = async (data: UpdateOfficeInput) => {
  const { id } = data.params;
  const { locationId, ...restData } = data.body;

  const officeExists = await prisma.office.findUnique({
    where: { id },
  });

  if (!officeExists) {
    throw new AppError("Oficina no encontrada", 404);
  }

  if (restData.name) {
    const existingOffice = await prisma.office.findFirst({
      where: {
        name: {
          equals: restData.name,
          mode: "insensitive",
        },
        id: {
          not: id, // Excluir la oficina actual de la búsqueda
        },
        isActive: true,
      },
    });

    if (existingOffice) {
      throw new AppError("Ya existe otra oficina con este nombre", 400);
    }
  }

  const dataToUpdate = {
    ...restData,
    ...(locationId && {
      location: {
        connect: { id: locationId },
      },
    }),
  };

  const updatedOffice = await prisma.office.update({
    where: { id },
    data: dataToUpdate,
    include: {
      location: { select: { id: true, name: true } },
    },
  });

  return updatedOffice;
};

export const createOfficeService = async (data: CreateOfficeInput) => {
  const { locationId, ...restData } = data;

  // Verificar si ya existe una oficina con el mismo nombre
  const existingOffice = await prisma.office.findFirst({
    where: {
      name: {
        equals: restData.name,
        mode: "insensitive",
      },
      isActive: true, // Solo considerar oficinas activas
    },
  });

  if (existingOffice) {
    throw new AppError("Ya existe una oficina con este nombre", 400);
  }

  const office = await prisma.office.create({
    data: {
      ...restData,
      location: {
        connect: { id: locationId },
      },
    },
    include: {
      location: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!office) {
    throw new AppError("Error creando la oficina", 500);
  }

  return office;
};

export const getAvailableOfficesByDateAndNameService = async ({
  endDate,
  startDate,
  searchQuery,
  currentAppointmentId,
}: GetAvailableOfficesByDateAndNameInput) => {
  try {
    console.log("Raw input (UTC):", { startDate, endDate, searchQuery });

    const availableOffices = await prisma.office.findMany({
      where: {
        isActive: true,
        // Filtrar por nombre si se proporciona searchQuery
        ...(searchQuery &&
          searchQuery.trim().length > 0 && {
            name: {
              contains: searchQuery.trim(),
              mode: "insensitive",
            },
          }),
        // NO tener citas programadas en el rango de fechas
        appointments: {
          none: {
            status: {
              not: AppointmentStatus.CANCELED, // Excluir citas canceladas
            },
            ...(currentAppointmentId && { id: { not: currentAppointmentId } }),
            OR: [
              // La cita comienza durante el rango solicitado
              {
                startDate: {
                  gte: new Date(startDate),
                  lt: new Date(endDate),
                },
              },
              // La cita termina durante el rango solicitado
              {
                endDate: {
                  gt: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
              // La cita engloba completamente el rango solicitado
              {
                AND: [
                  {
                    startDate: {
                      lte: new Date(startDate),
                    },
                  },
                  {
                    endDate: {
                      gte: new Date(endDate),
                    },
                  },
                ],
              },
            ],
          },
        },
      },
      select: {
        id: true,
        name: true,
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 10,
    });

    console.log("Found available offices:", availableOffices.length);

    return availableOffices.map((office) => ({
      id: office.id,
      name: office.name,
      location: office.location,
    }));
  } catch (error) {
    console.error("Error fetching available offices:", error);
    throw new AppError("Error obteniendo las oficinas disponibles");
  }
};

export const getAllOfficesSearchService = async ({
  name,
}: GetAllOfficesSearchInput) => {
  console.log({ name });

  // Construir las condiciones de búsqueda dinámicamente
  let whereCondition: Prisma.OfficeWhereInput = {
    isActive: true
  };

  if (name && name.trim().length > 0) {
    whereCondition = {
      ...whereCondition,
      name: {
        contains: name.trim(),
        mode: "insensitive" as const,
      },
    };
  }

/*   // Si no hay condiciones de búsqueda, retornar array vacío o todos los pacientes
  if (searchConditions.length === 0) {
    return []; // O puedes retornar todos con un límite
  } */

  const officesDB = await prisma.office.findMany({
    where: whereCondition,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
    },
    take: 10,
  });

  return officesDB;
};