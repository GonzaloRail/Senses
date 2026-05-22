import { Request, Response, NextFunction } from "express";
import {
  getTotalPsychologistsService,
  getTotalPatientsService,
  getTotalHoursThisMonthService,
  getTotalSocialCasesThisMonthService,
  getTotalActiveInternalsService,
  getTotalParticularCasesService,
  getPatientsCountByAgeGroupsService,
  getTotalSocialCasesService,
  getPsychologistsWithPatientCountService,
  getAppointmentsCountByWeekdayService,
} from "./service";

export const getTotalPsychologists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getTotalPsychologistsService();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getTotalPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getTotalPatientsService();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getTotalHoursThisMonth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getTotalHoursThisMonthService();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getTotalSocialCasesThisMonth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getTotalSocialCasesThisMonthService();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getTotalActiveInternals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getTotalActiveInternalsService();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getTotalSocialCases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getTotalSocialCasesService();
    res.json(result);
  } catch (err) { next(err); }
};

export const getTotalParticularCases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getTotalParticularCasesService();
    res.json(result);
  } catch (err) { next(err); }
};

export const getPatientsCountByAgeGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getPatientsCountByAgeGroupsService();
    res.json(result);
  } catch (err) { next(err); }
};

export const getPsychologistsWithPatientCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // permitir rango desde query (ISO strings) ?from=...&to=...
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;

    const result = await getPsychologistsWithPatientCountService({ from, to });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAppointmentsCountByWeekday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // permitir rango desde query
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;

    const result = await getAppointmentsCountByWeekdayService({ from, to });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};