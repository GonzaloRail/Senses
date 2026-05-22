import { NextFunction, Request, Response } from "express";
import {
  createAppointmentService,
  getAllAppointmentsPaginatedService,
  getAppointmentByIdService,
  getAppointmentsByDateService,
  getAppointmentsByOfficeIdService,
  getAppointmentsByPatientIdService,
  getAppointmentsByPsychologistIdService,
  getAppointmentsListService,
  updateAppointmentService,
  updateAppointmentStatusService,
} from "./service";

export const getAllAppointmentsPaginated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, take = 10, search } = req.query;

    const queryParams = {
      page: Number(page),
      take: Number(take),
      search: typeof search === "string" ? search : undefined,
    };

    const result = await getAllAppointmentsPaginatedService(queryParams);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllAppointmentsPaginatedByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to, page = 1, take = 10 } = req.query;

    const result = await getAppointmentsByDateService({
      from: from as string | undefined,
      to: to as string | undefined,
      page: Number(page),
      take: Number(take),
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};



export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await getAppointmentByIdService({ id });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createAppointmentService(req.body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await updateAppointmentService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await updateAppointmentStatusService({
      params: { id },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByPatientId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await getAppointmentsByPatientIdService({
      params: { id },
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByOfficeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await getAppointmentsByOfficeIdService({
      params: { id },
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByPsychologistId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await getAppointmentsByPsychologistIdService({
      params: { id },
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { from, to, page = 1, take = 10 } = req.query;

    const result = await getAppointmentsListService({
      psychologistId: id,
      from: from as string | undefined,
      to: to as string | undefined,
      page: Number(page),
      take: Number(take),
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
