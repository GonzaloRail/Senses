import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import {
  GetAllItemInstancesInput,
  GetItemInstanceByIdInput,
  CreateItemInstanceInput,
  UpdateItemInstanceInput,
} from "./schema";

export const getAllItemInstancesService = async ({
  page,
  take,
  search,
  locationId,
  officeId,
}: GetAllItemInstancesInput) => {
  const itemInstancesDB = await prisma.itemInstance.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      item: {
        name: {
          startsWith: search,
        },
      },
      officeId: officeId,
      office: {
        locationId: locationId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      item: {
        select: { name: true },
      },
      office: {
        select: {
          name: true,
          location: {
            select: { name: true },
          },
        },
      },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.itemInstance.count({
      where: {
        item: {
          name: {
            startsWith: search,
          },
        },
        officeId: officeId,
        office: {
          locationId: locationId,
        },
      },
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    itemInstances: itemInstancesDB,
  };
};

export const getItemInstanceByIdService = async ({
  id,
}: GetItemInstanceByIdInput) => {
  const itemInstance = await prisma.itemInstance.findUnique({
    where: { id },
    include: {
      item: {
        select: { id: true, name: true },
      },
      office: {
        select: {
          id: true,
          name: true,
          location: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!itemInstance) {
    throw new AppError("Instancia del objeto no encontrada", 404);
  }

  return itemInstance;
};

export const createItemInstanceService = async (
  data: CreateItemInstanceInput
) => {
  const { itemId } = data;

  const itemExists = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!itemExists) {
    throw new Error("ItemID not found");
  }

  const instance = await prisma.itemInstance.create({
    data: {
      item: {
        connect: { id: itemId },
      } /* 
        office: {
          connect: { id: officeId },
        }, */,
    },
    include: {
      item: { select: { id: true, name: true } },
      /* office: {
          select: {
            id: true,
            name: true,
            location: { select: { id: true, name: true } },
          },
        }, */
    },
  });

  //createdInstances.push(instance);

  return instance;
};

export const updateItemInstanceService = async (
  data: UpdateItemInstanceInput
) => {
  //const { id } = data.params;
  const { itemId, officeId, quantity, ...restData } = data.body;

  /* const itemInstanceExists = await prisma.itemInstance.findUnique({
    where: { id },
  });

  if (!itemInstanceExists) {
    throw new AppError("ItemInstance not found", 404);
  } */

  return await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id: itemId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!item) {
      throw new AppError("Item no encontrado", 404);
    }

    // Obtener todas las instancias asignadas a esta oficina
    const existingAssignments = await tx.itemInstance.findMany({
      where: {
        itemId: itemId,
        officeId: officeId,
      },
      orderBy: {
        createdAt: "asc", // Importante: mantener un orden consistente
      },
    });

    const currentCount = existingAssignments.length;

    // Validar la cantidad solicitada
    if (quantity > item._count.items) {
      throw new AppError(
        `La cantidad solicitada (${quantity}) excede el total de instancias disponibles (${item._count.items})`,
        400
      );
    }

    // Procesar según el caso
    if (quantity > currentCount) {
      // Caso: Necesitamos agregar instancias
      const additionalNeeded = quantity - currentCount;

      const availableInstances = await tx.itemInstance.findMany({
        where: {
          itemId: itemId,
          officeId: null,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: additionalNeeded,
      });

      if (availableInstances.length < additionalNeeded) {
        throw new AppError(
          `No hay suficientes instancias disponibles. Necesitas ${additionalNeeded} más pero solo hay ${availableInstances.length}`,
          400
        );
      }

      await tx.itemInstance.updateMany({
        where: {
          id: {
            in: availableInstances.map((instance) => instance.id),
          },
        },
        data: {
          officeId: officeId,
        },
      });

      return {
        success: true,
        message: `Se asignaron ${additionalNeeded} instancias adicionales. Total en la oficina: ${quantity}`,
        addedInstances: additionalNeeded,
        removedInstances: 0,
        currentAssigned: quantity,
      };
    } else if (quantity < currentCount) {
      // Caso: Necesitamos remover instancias
      const toRemove = currentCount - quantity;

      // Tomamos las últimas instancias asignadas (LIFO)
      const instancesToUnassign = existingAssignments
        .slice(-toRemove)
        .map((instance) => instance.id);

      await tx.itemInstance.updateMany({
        where: {
          id: {
            in: instancesToUnassign,
          },
        },
        data: {
          officeId: null,
        },
      });

      return {
        success: true,
        message: `Se desasignaron ${toRemove} instancias. Total en la oficina: ${quantity}`,
        addedInstances: 0,
        removedInstances: toRemove,
        currentAssigned: quantity,
      };
    } else {
      return {
        success: true,
        message: `No se requieren cambios. Ya existen ${currentCount} instancias asignadas`,
        addedInstances: 0,
        removedInstances: 0,
        currentAssigned: currentCount,
      };
    }
  });
};
