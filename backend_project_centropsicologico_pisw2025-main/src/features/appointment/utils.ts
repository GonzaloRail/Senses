import { RoleType } from "@prisma/client";
import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import { AppointmentFilterType } from "./service";

export const validateEntityExists = async (
  id: string,
  filterType: AppointmentFilterType
) => {
  let entity;
  let errorMessage: string;

  switch (filterType) {
    case "patient":
      entity = await prisma.patient.findUnique({ where: { id } });
      errorMessage = "El paciente no existe";
      break;
    case "office":
      entity = await prisma.office.findUnique({ where: { id } });
      errorMessage = "La oficina no existe";
      break;
    case "psychologist":
      entity = await prisma.user.findUnique({
        where: {
          id,
          roles: {
            some: {
              role: {
                name: RoleType.PSYCHOLOGIST,
              },
            },
          },
        },
      });
      errorMessage = "El psicólogo no existe";
      break;
    default:
      throw new AppError("Tipo de filtro no válido", 400);
  }

  if (!entity) {
    throw new AppError(errorMessage, 404);
  }
};

export const buildWhereClause = (
  id: string,
  filterType: AppointmentFilterType
) => {
  switch (filterType) {
    case "patient":
      return { patientId: id };
    case "office":
      return { officeId: id };
    case "psychologist":
      return {
        userId: id,
        user: { roles: { some: { role: { name: RoleType.PSYCHOLOGIST } } } },
      };
    default:
      throw new AppError("Tipo de filtro no válido", 400);
  }
};
