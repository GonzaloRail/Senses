import { Request, Response, NextFunction } from "express";
import {
  getProvinceByIdService,
  getProvincesByRegionIdService,
} from "./service";

export const getProvincesByRegionId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const provinces = await getProvincesByRegionIdService(id);
    res.status(200).json(provinces);
  } catch (error) {
    next(error);
  }
};
export const getProvinceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const province = await getProvinceByIdService(id);
    res.status(200).json(province);
  } catch (error) {
    next(error);
  }
};
