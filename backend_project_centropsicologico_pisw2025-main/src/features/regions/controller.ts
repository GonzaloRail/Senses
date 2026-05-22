import { Request, Response, NextFunction } from "express";
import { getAllRegionsService, getRegionByIdService } from "./service";

export const getAllRegions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const regions = await getAllRegionsService();
    res.status(200).json(regions);
  } catch (error) {
    next(error);
  }
};
export const getRegionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const regions = await getRegionByIdService(id);
    res.status(200).json(regions);
  } catch (error) {
    next(error);
  }
};
