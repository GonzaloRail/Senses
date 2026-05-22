import { Prisma } from "@prisma/client";
import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import {
  GetAllItemsPaginatedInput,
  GetItemByIdInput,
  CreateItemInput,
  UpdateItemInput,
  GetAllItemsSearchInput,
} from "./schema";
import { ItemInstance } from "../../interfaces";

export const getAllItemsPaginatedService = async ({
  page,
  take,
  search,
}: GetAllItemsPaginatedInput) => {
  const itemsDB = await prisma.item.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      name: {
        startsWith: search,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPages = Math.ceil(
    (await prisma.item.count({
      where: {
        name: {
          startsWith: search,
        },
      },
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    items: itemsDB,
  };
};

export const getItemByIdService = async ({ id }: GetItemByIdInput) => {
  const item = await prisma.item.findUnique({
    where: { id },
  });

  if (!item) {
    throw new AppError("Objeto no encontrado", 404);
  }
  return item;
};

export const createItemService = async ({
  name,
  description,
  quantity,
}: CreateItemInput) => {
  const existingItem = await prisma.item.findFirst({
    where: { name },
  });

  if (existingItem) {
    throw new AppError("Ya existe un ítem con ese nombre", 400);
  }

  // Usar una transacción para garantizar que tanto el Item como sus instancias se creen
  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // Crear Item
      const newItem = await tx.item.create({
        data: {
          name,
          description,
          quantity,
        },
      });

      // Crear las instancias del item
      if (quantity && quantity > 0) {
        await tx.itemInstance.createMany({
          data: Array.from({ length: quantity }, () => ({
            itemId: newItem.id,
          })),
        });
      }

      // Retornar el item con sus instancias
      return await tx.item.findUnique({
        where: { id: newItem.id },
        include: {
          items: true,
        },
      });
    }
  );

  return result;
};

export const updateItemService = async (data: UpdateItemInput) => {
  const { id } = data.params;
  const { quantity, ...restData } = data.body;

  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const currentItem = await prisma.item.findUnique({
        where: { id },
      });

      if (!currentItem) {
        throw new AppError("Objeto no encontrado", 404);
      }

      // desvincular todas sus instancias
      if (restData.isActive === false) {
        await tx.itemInstance.updateMany({
          where: {
            itemId: id,
            officeId: {
              not: null
            }
          },
          data: {
            officeId: null // desvincular
          }
        });
      }

      const currentQuantity = currentItem.quantity;

      if (quantity !== undefined && quantity !== currentQuantity) {
        if (quantity > currentQuantity) {
          // Crear instancias adicionales
          const newInstancesCount = quantity - currentQuantity;
          await tx.itemInstance.createMany({
            data: Array.from({ length: newInstancesCount }, () => ({
              itemId: id,
            })),
          });
        } else {
          // Eliminar instancias sobrantes
          const instancesToRemove = currentQuantity - quantity;

          // Obtener instancias no asignadas
          const unassignedInstances = await tx.itemInstance.findMany({
            where: {
              itemId: id,
              officeId: null,
            },
            take: instancesToRemove,
          });

          if (unassignedInstances.length < instancesToRemove) {
            throw new AppError(
              "No se pueden eliminar instancias porque algunas están asignadas a oficinas",
              400
            );
          }

          // Eliminar las instancias no asignadas
          await tx.itemInstance.deleteMany({
            where: {
              id: {
                in: unassignedInstances.map((instance) => instance.id),
              },
            },
          });
        }
      }

      // Actualizar el item con los demás datos
      const updatedItem = await tx.item.update({
        where: { id },
        data: {
          ...restData,
          quantity: quantity,
        },
        include: {
          items: true,
        },
      });

      return updatedItem;
    }
  );

  return result;
};

export const getAllItemsSearchService = async ({
  name,
}: GetAllItemsSearchInput) => {
  console.log({ name });

  // Construir las condiciones de búsqueda dinámicamente
  let whereCondition: Prisma.ItemWhereInput = {
    isActive: true,
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

  const itemsDB = await prisma.item.findMany({
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

  return itemsDB;
};
