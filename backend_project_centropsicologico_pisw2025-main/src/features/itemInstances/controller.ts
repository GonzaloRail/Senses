import { NextFunction, Request, Response } from "express";
import { 
  getAllItemInstancesService,
  getItemInstanceByIdService,
  createItemInstanceService,
  updateItemInstanceService,
} from "./service";

export const getAllItemInstances = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      take = 10,
      search = "",
      locationId,
      officeId,
    } = req.query;

    const queryParams = {
      page: Number(page),
      take: Number(take),
      search: String(search),
      locationId: locationId ? String(locationId) : undefined,
      officeId: officeId ? String(officeId) : undefined,
    };

    const result = await getAllItemInstancesService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getItemInstanceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getItemInstanceByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createItemInstance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createItemInstanceService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateItemInstance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: itemInstanceId } = req.params;

    const result = await updateItemInstanceService({
      params: { id: itemInstanceId },
      body: req.body,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};