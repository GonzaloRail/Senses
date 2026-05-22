import { NextFunction, Request, Response } from "express";
import {
  getAllClinicalHistoriesService,
  getClinicalHistoryByIdService,
  getClinicalHistoryByPatientIdService,
} from "./service";

export const getClinicalHistoryByPatientId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { patientId } = req.params;
    const result = await getClinicalHistoryByPatientIdService({ patientId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllClinicalHistories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, take = 10, search = "" } = req.query;

    const queryParams = {
      page: Number(page),
      take: Number(take),
      search: String(search),
    };

    const result = await getAllClinicalHistoriesService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getClinicalHistoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getClinicalHistoryByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
