import { Request, Response, NextFunction } from "express";
import {
  getAllEvaluationsPaginatedService,
  getAllEvaluationsListPaginatedService,
  getEvaluationByIdService,
  createEvaluationService,
  updateEvaluationService,
  updateEvaluationStatusService,
  getEvaluationOptionsService,
  getSectionsOrdersService,
  updateEvaluationsSectionOrdersService,
  getAllEvaluationsByClinicalHistoryIdSortedBySectionService,
} from "./service";

export const getAllEvaluationsPaginated = async (
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
    const result = await getAllEvaluationsPaginatedService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllEvaluationsListPaginated = async (
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
    const result = await getAllEvaluationsListPaginatedService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEvaluationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getEvaluationByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllEvaluationsByClinicalHistoryIdSortedBySection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result =
      await getAllEvaluationsByClinicalHistoryIdSortedBySectionService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createEvaluationService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
export const getSectionsOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getSectionsOrdersService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: evaluationId } = req.params;
    const result = await updateEvaluationService({
      params: { id: evaluationId },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateEvaluationsSectionOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await updateEvaluationsSectionOrdersService(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateEvaluationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: evaluationId } = req.params;
    const result = await updateEvaluationStatusService({
      params: { id: evaluationId },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEvaluationOptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getEvaluationOptionsService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
