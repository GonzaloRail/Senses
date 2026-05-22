import { Request, Response, NextFunction } from "express";
import {
  createLocationService,
  getAllLocationsSearchService,
  getAllLocationsService,
  getLocationByIdService,
  updateLocationService,
} from "./service";

export const getAllLocations = async (
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

    const result = await getAllLocationsService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const location = await getLocationByIdService(id);
    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const response = await updateLocationService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await createLocationService(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getAllLocationsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name = "" } = req.query;
    const queryParams = {
      name: String(name),
    };
    const result = await getAllLocationsSearchService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};