import { Request, Response, NextFunction } from "express";
import {
  getAllFormTemplatesService,
  getFormTemplateByIdService,
  getFormTemplateByTestIdService,
  getDefaultFormTemplatesService,
  createFormTemplateService,
  updateFormTemplateService,
  deleteFormTemplateService,
} from "./service";

export const getAllFormTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, take = 10, search = "", isActive } = req.query;
    const result = await getAllFormTemplatesService({
      page: Number(page),
      take: Number(take),
      search: String(search),
      isActive: isActive as any,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getFormTemplateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getFormTemplateByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getFormTemplateByTestId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { testId } = req.params;
    const result = await getFormTemplateByTestIdService({ testId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDefaultFormTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getDefaultFormTemplatesService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createFormTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createFormTemplateService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateFormTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await updateFormTemplateService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteFormTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await deleteFormTemplateService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
