import { NextFunction, Request, Response } from "express";
import {
  getConsentTypesService,
  getIncomeRangesService,
  getIntakeOptionGroupsService,
  getPatientIntakeCatalogService,
} from "./service";

const shouldIncludeInactive = (req: Request) =>
  req.query.includeInactive === "true";

export const getPatientIntakeCatalog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getPatientIntakeCatalogService(
      shouldIncludeInactive(req)
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getIntakeOptionGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getIntakeOptionGroupsService(
      shouldIncludeInactive(req)
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getIncomeRanges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getIncomeRangesService(shouldIncludeInactive(req));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getConsentTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getConsentTypesService(shouldIncludeInactive(req));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
