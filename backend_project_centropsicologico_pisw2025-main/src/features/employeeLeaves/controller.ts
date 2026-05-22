import { NextFunction, Request, Response } from "express";
import {
  createEmployeeLeaveService,
  getAllEmployeeLeavesService,
  getEmployeeLeaveByIdService,
  getEmployeeLeavesByUserIdService,
  updateEmployeeLeaveService,
  updateEmployeeLeaveStatusService,
} from "./service";

export const getAllEmployeeLeaves = async (
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

    const result = await getAllEmployeeLeavesService(queryParams);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeLeavesByUserId = async (
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

    const result = await getEmployeeLeavesByUserIdService({
      params: { id },
      query: queryParams,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeLeaveById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await getEmployeeLeaveByIdService({ id });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createEmployeeLeave = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createEmployeeLeaveService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeLeave = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await updateEmployeeLeaveService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const updateEmployeeLeaveStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await updateEmployeeLeaveStatusService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
