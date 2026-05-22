import prisma from "../../lib/prisma";

export const getAllRolesService = async () => {
  const roles = await prisma.role.findMany();

  return roles;
};
