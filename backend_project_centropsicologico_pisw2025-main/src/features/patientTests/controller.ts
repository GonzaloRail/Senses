import { Request, Response, NextFunction } from "express";
import {
  getAllPatientTestsPaginatedService,
  getPatientTestByIdService,
  createPatientTestService,
  updatePatientTestService,
  getPatientTestsByAppointmentIdService,
} from "./service";

export const getAllPatientTestsPaginated = async (
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
    const result = await getAllPatientTestsPaginatedService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPatientTestById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getPatientTestByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createPatientTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createPatientTestService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updatePatientTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: patientTestId } = req.params;
    const result = await updatePatientTestService({
      params: { id: patientTestId },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPatientTestsByAppointmentId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appointmentId } = req.params;
    const result = await getPatientTestsByAppointmentIdService({ appointmentId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};