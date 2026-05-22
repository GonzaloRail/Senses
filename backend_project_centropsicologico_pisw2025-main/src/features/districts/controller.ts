import { Request, Response, NextFunction } from "express";
import { getDistrictsByProvinceIdService } from "./service";

export const getDistrictsByProvinceId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const districts = await getDistrictsByProvinceIdService(id);
    res.status(200).json(districts);
  } catch (error) {
    next(error);
  }
};