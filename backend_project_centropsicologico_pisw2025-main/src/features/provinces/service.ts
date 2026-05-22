import prisma from "../../lib/prisma";

export const getProvincesByRegionIdService = async (regionId: string) => {
  const provinces = await prisma.province.findMany({
    where: { regionId },
    orderBy: { name: "asc" },
    include: {
      districts: true,
    },
  });

  return provinces;
};
export const getProvinceByIdService = async (regionId: string) => {
  const province = await prisma.province.findUnique({
    where: { id: regionId },
    include: {
      districts: true,
    },
  });

  return province;
};
