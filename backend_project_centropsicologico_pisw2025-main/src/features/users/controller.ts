import { Request, Response, NextFunction } from "express";
import {
  createUserService,
  getAllUsersService,
  getAvailablePsychologistsByDateAndNameService,
  getUserByIdService,
  updateUserService,
  getAllPsychologistSmallService,
  getUsersByNameService,
  getPsychologistsByNameService,
} from "./service";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createUserService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// TODO: Validate that it's its own user or that the user has the right to see this user

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: userId } = req.params;
    const result = await getUserByIdService(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
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
    const result = await getAllUsersService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllPsychologistSmall = async (
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
    const result = await getAllPsychologistSmallService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPsychologistByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { searchQuery, dni, firstname, lastname } = req.query;
    const result = await getPsychologistsByNameService({
      searchQuery: searchQuery ? String(searchQuery) : undefined,
      dni: dni ? String(dni) : undefined,
      firstname: firstname ? String(firstname) : undefined,
      lastname: lastname ? String(lastname) : undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAvailablePsychologistsByDateAndName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      startDate,
      endDate = new Date(),
      searchQuery,
      currentAppointmentId,
    } = req.query;
    const result = await getAvailablePsychologistsByDateAndNameService({
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      searchQuery: String(searchQuery),
      currentAppointmentId: currentAppointmentId as string | undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUsersByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { searchQuery } = req.query;
    const result = await getUsersByNameService({
      searchQuery: String(searchQuery),
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const response = await updateUserService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
