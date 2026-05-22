import { NextFunction, Request, Response } from "express";
import { 
  getAllItemsPaginatedService,
  getItemByIdService, 
  createItemService,
  updateItemService,
  getAllItemsSearchService,
} from "./service";

export const getAllItemsPaginated = async (
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

    const result = await getAllItemsPaginatedService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getItemByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createItemService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const response = await updateItemService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getAllItemsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name = "" } = req.query;
    const queryParams = {
      name: String(name),
    };
    const result = await getAllItemsSearchService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};