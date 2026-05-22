import prisma from "../../lib/prisma";

export const getDistrictsByProvinceIdService = async (provinceId: string) => {
  const districts = await prisma.district.findMany({
    where: { provinceId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return districts;
};