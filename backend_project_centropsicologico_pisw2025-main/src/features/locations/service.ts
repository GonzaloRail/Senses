import { AppError, encryptPassword } from "../../common/utils";
import prisma from "../../lib/prisma";
import type {
  CreateLocationInput,
  GetAllLocationsInput,
  GetAllLocationsSearchInput,
  UpdateLocationInput,
} from "./schema";
import type { Location } from "../../interfaces/Location";
import { Prisma } from "@prisma/client";

export const getAllLocationsService = async ({
  page,
  take,
}: GetAllLocationsInput) => {
  const locationsDB = await prisma.location.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    orderBy: {
      name: "asc",
    },
    include: {
      district: {
        select: {
          name: true,
        },
      },
      /*offices: {
        select: {
          id: true,
          name: true,
          type: true,
          capacity: true,
          isActive: true,
        },
      },*/
    },
  });

  const totalCount = await prisma.location.count();

  const totalPages = Math.ceil(totalCount / take!);

  return {
    currentPage: page!,
    totalPages,
    locations: locationsDB as Location[],
  };
};

export const getLocationByIdService = async (locationId: string) => {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    include: {
      district: {
        select: {
          id: true,
          name: true,
          province: {
            select: {
              id: true,
              name: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      /*offices: {
        select: {
          id: true,
          name: true,
          type: true,
          capacity: true,
          isActive: true,
        },
      },*/
    },
  });

  if (!location) {
    throw new AppError("Sede no encontrada", 404);
  }

  return location;
};

export const updateLocationService = async (data: UpdateLocationInput) => {
  const { id } = data.params;
  const { ...restData } = data.body;

  const location = await prisma.location.findUnique({
    where: { id },
  });
  if (!location) {
    throw new AppError("Sede no encontrada", 404);
  }
  const updatedLocation = await prisma.location.update({
    where: { id },
    data: restData,
  });

  return updatedLocation;
};

export const createLocationService = async ({
  address,
  districtId,
  name,
}: CreateLocationInput) => {
  const existingLocation = await prisma.location.findFirst({
    where: { name, address },
  });

  if (existingLocation) {
    throw new AppError(
      "Ya existe una sede con el mismo nombre y dirección",
      400
    );
  }

  const newLocation = await prisma.location.create({
    data: {
      name,
      address,
      districtId,
    },
  });

  return newLocation;
};


export const getAllLocationsSearchService = async ({
  name,
}: GetAllLocationsSearchInput) => {
  console.log({ name });

  // Construir las condiciones de búsqueda dinámicamente
  let whereCondition: Prisma.LocationWhereInput = {
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

  const locationsDB = await prisma.location.findMany({
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

  return locationsDB;
};