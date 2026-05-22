import { Request, Response, NextFunction } from "express";
import { 
  createWorkScheduleService,
  getAllWorkSchedulesService,
  getWorkScheduleByIdService,
  getWorkSchedulesByUserIdService,
  updateWorkScheduleService, 
} from "./service";

export const createWorkSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createWorkScheduleService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}; 

export const getAllWorkSchedules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, take = 10 } = req.query;

    const queryParams = {
      page: Number(page),
      take: Number(take),
    };

    const result = await getAllWorkSchedulesService(queryParams);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getWorkScheduleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await getWorkScheduleByIdService({ id });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getWorkSchedulesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { page = 1, take = 10 } = req.query;

    const queryParams = {
      page: Number(page),
      take: Number(take),
    };

    const result = await getWorkSchedulesByUserIdService({
      params: { id },
      query: queryParams,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateWorkSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await updateWorkScheduleService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};