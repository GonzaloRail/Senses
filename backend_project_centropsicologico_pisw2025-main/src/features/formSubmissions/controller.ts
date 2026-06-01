import { Request, Response, NextFunction } from "express";
import {
  getFormSubmissionByIdService,
  getFormSubmissionByPatientTestIdService,
  createFormSubmissionService,
  updateFormSubmissionService,
} from "./service";

export const getFormSubmissionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getFormSubmissionByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getFormSubmissionByPatientTestId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { patientTestId } = req.params;
    const result = await getFormSubmissionByPatientTestIdService({
      patientTestId,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createFormSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createFormSubmissionService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateFormSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await updateFormSubmissionService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
