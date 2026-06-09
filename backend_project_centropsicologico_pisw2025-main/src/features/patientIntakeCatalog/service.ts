import prisma from "../../lib/prisma";

const activeWhere = (includeInactive: boolean) =>
  includeInactive ? {} : { isActive: true };

export const getIntakeOptionGroupsService = async (
  includeInactive = false
) => {
  return prisma.intakeOptionGroup.findMany({
    where: activeWhere(includeInactive),
    orderBy: { code: "asc" },
    include: {
      options: {
        where: activeWhere(includeInactive),
        orderBy: { sortOrder: "asc" },
      },
    },
  });
};

export const getIncomeRangesService = async (includeInactive = false) => {
  return prisma.incomeRange.findMany({
    where: activeWhere(includeInactive),
    orderBy: { sortOrder: "asc" },
  });
};

export const getConsentTypesService = async (includeInactive = false) => {
  return prisma.consentType.findMany({
    where: activeWhere(includeInactive),
    orderBy: { code: "asc" },
  });
};

export const getPatientIntakeCatalogService = async (
  includeInactive = false
) => {
  const [optionGroups, incomeRanges, consentTypes] = await Promise.all([
    getIntakeOptionGroupsService(includeInactive),
    getIncomeRangesService(includeInactive),
    getConsentTypesService(includeInactive),
  ]);

  return {
    optionGroups,
    incomeRanges,
    consentTypes,
  };
};
