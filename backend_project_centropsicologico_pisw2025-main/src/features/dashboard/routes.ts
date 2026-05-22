import express from "express";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { getAppointmentsCountByWeekday, getPatientsCountByAgeGroups, getPsychologistsWithPatientCount, getTotalActiveInternals, getTotalHoursThisMonth, getTotalParticularCases, getTotalPatients, getTotalPsychologists, getTotalSocialCases, getTotalSocialCasesThisMonth } from "./controller";

const DASHBOARD_ROUTES = {
  GET_NUMBER_PSYCHOLOGISTS: "/dashboard/psychologists",
  GET_NUMBER_PATIENTS: "/dashboard/patients",
  GET_NUMBER_TOTAL_HOURS_PER_MONTH: "/dashboard/total-hours",
  GET_NUMBER_SOCIAL_CASES_PER_MONTH: "/dashboard/social-cases-month",
  GET_NUMBER_ACTIVE_INTERNALS: "/dashboard/active-internals",

  GET_TOTAL_SOCIAL_CASES: "/dashboard/social-cases",
  GET_TOTAL_PARTICULAR_CASES: "/dashboard/particular-cases",
  GET_PATIENTS_PER_AGE_GROUPS: "/dashboard/patients-age-groups",

  GET_PSYCHOLOGISTS_WITH_PATIENTS: "/dashboard/psychologists-with-patients",
  GET_APPOINTMENTS_BY_WEEKDAY: "/dashboard/appointments-by-weekday",
};

const router = express.Router();

router.get(DASHBOARD_ROUTES.GET_NUMBER_PSYCHOLOGISTS, authenticateJWT, getTotalPsychologists);
router.get(DASHBOARD_ROUTES.GET_NUMBER_PATIENTS, authenticateJWT, getTotalPatients);
router.get(DASHBOARD_ROUTES.GET_NUMBER_TOTAL_HOURS_PER_MONTH, authenticateJWT, getTotalHoursThisMonth);
router.get(DASHBOARD_ROUTES.GET_NUMBER_SOCIAL_CASES_PER_MONTH, authenticateJWT, getTotalSocialCasesThisMonth);
router.get(DASHBOARD_ROUTES.GET_NUMBER_ACTIVE_INTERNALS, authenticateJWT, getTotalActiveInternals);
router.get(DASHBOARD_ROUTES.GET_TOTAL_SOCIAL_CASES, authenticateJWT, getTotalSocialCases);
router.get(DASHBOARD_ROUTES.GET_TOTAL_PARTICULAR_CASES, authenticateJWT, getTotalParticularCases);
router.get(DASHBOARD_ROUTES.GET_PATIENTS_PER_AGE_GROUPS, authenticateJWT, getPatientsCountByAgeGroups); 
router.get(DASHBOARD_ROUTES.GET_PSYCHOLOGISTS_WITH_PATIENTS, authenticateJWT, getPsychologistsWithPatientCount);
router.get(DASHBOARD_ROUTES.GET_APPOINTMENTS_BY_WEEKDAY, authenticateJWT, getAppointmentsCountByWeekday);

export default router;