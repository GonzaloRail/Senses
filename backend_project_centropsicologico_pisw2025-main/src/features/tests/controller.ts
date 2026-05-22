import { Request, Response, NextFunction } from "express";
import {
  getAllTestsService,
  getTestByIdService,
  createTestService,
  updateTestService,
  createTestsBatchService,
  getTestsOptionsByEvaluationService
} from "./service";

export const getAllTests = async (
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
    const result = await getAllTestsService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTestById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getTestByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createTestService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: testId } = req.params;
    const result = await updateTestService({
      params: { id: testId },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createTestsBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createTestsBatchService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTestsOptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getTestsOptionsByEvaluationService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};