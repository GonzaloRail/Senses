import prisma from "../../lib/prisma";

export const getAllRegionsService = async () => {
  const regions = await prisma.region.findMany({
    orderBy: { name: "asc" },
    include: {
      provinces: true,
    },
  });

  return regions;
};

export const getRegionByIdService = async (id: string) => {
  const region = await prisma.region.findUnique({
    where: { id },
    include: {
      provinces: true,
    },
  });
  return region;
};
