import { NextFunction, Request, Response } from "express";
import {
  getAllOfficesPaginatedService,
  getOfficeByIdService,
  updateOfficeService,
  createOfficeService,
  getAvailableOfficesByDateAndNameService,
  getAllOfficesSearchService,
} from "./service";

export const getAllOfficesPaginated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, take = 10, search = "", locationId } = req.query;

    const queryParams = {
      page: Number(page),
      take: Number(take),
      search: String(search),
      locationId: locationId ? String(locationId) : undefined,
    };

    const result = await getAllOfficesPaginatedService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAvailableOfficesByDateAndName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      startDate = new Date(),
      endDate = new Date(),
      searchQuery,
      currentAppointmentId,
    } = req.query;

    const result = await getAvailableOfficesByDateAndNameService({
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      searchQuery: searchQuery ? String(searchQuery) : "",
      currentAppointmentId: currentAppointmentId as string | undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getOfficeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getOfficeByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateOffice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: officeId } = req.params;
    const result = await updateOfficeService({
      params: { id: officeId },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createOffice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createOfficeService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllOfficesSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name = "" } = req.query;
    const queryParams = {
      name: String(name),
    };
    const result = await getAllOfficesSearchService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};