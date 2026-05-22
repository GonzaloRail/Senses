import { NextFunction, Request, Response } from "express";
import {
  createPatientService,
  getAllPatientsByPsychologistIdService,
  getAllPatientsPaginatedService,
  getAllPatientsSearchService,
  getMyPatientListService,
  getPatientByAppointmentIdService,
  getPatientByIdService,
  getPatientsForExcelService,
  updatePatientService,
} from "./service";
import { GetPatientsByPsychologistIdInput, GetMyPatientListInput } from "./schema";
import { generatePatientExcel } from "../../common/utils/patientExcel";

export const getAllPatientsPaginated = async (
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
    const result = await getAllPatientsPaginatedService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPatientsByPsychologistId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, take = 10, search = "" } = req.query;
    const { psychologistId } = req.params;

    const data: GetPatientsByPsychologistIdInput = {
      query: {
        page: Number(page),
        take: Number(take),
        search: String(search),
      },
      params: {
        psychologistId,
      },
    };

    const result = await getAllPatientsByPsychologistIdService(data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const getAllPatientsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name = "", dni = "" } = req.query;
    const queryParams = {
      name: String(name),
      dni: String(dni),
    };
    const result = await getAllPatientsSearchService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getPatientByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPatientByAppointmentId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appointmentId } = req.params;
    const result = await getPatientByAppointmentIdService({ appointmentId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createPatientService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: patientId } = req.params;
    const result = await updatePatientService({
      params: { id: patientId },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyPatientList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, take = 10, search = "" } = req.query;
    const { psychologistId } = req.params;

    const data: GetMyPatientListInput = {
      query: {
        page: Number(page),
        take: Number(take),
        search: String(search),
      },
      params: {
        psychologistId,
      },
    };

    const result = await getMyPatientListService(data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const downloadPatientReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const patients = await getPatientsForExcelService();

    const workbook = await generatePatientExcel(patients);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=pacientes.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};