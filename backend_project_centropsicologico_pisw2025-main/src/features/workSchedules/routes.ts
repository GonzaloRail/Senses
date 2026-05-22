import express from "express";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { 
  createWorkScheduleSchema,
  getAllWorkSchedulesSchema,
  getWorkScheduleByIdSchema,
  getWorkSchedulesByUserIdSchema,
  updateWorkScheduleSchema, 
} from "./schema";
import { 
  createWorkSchedule,
  getAllWorkSchedules,
  getWorkScheduleById,
  getWorkSchedulesByUserId,
  updateWorkSchedule, 
} from "./controller";

const WORK_SCHEDULE_ROUTES = {
  CREATE: "/work-schedules",
  GET_ALL: "/work-schedules",
  GET_BY_ID: "/work-schedules/:id",
  GET_BY_USER_ID: "/work-schedules/user/:id",
  UPDATE: "/work-schedules/:id",
};

const router = express.Router();

router.post(
  WORK_SCHEDULE_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createWorkScheduleSchema),
  createWorkSchedule
);

router.get(
  WORK_SCHEDULE_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllWorkSchedulesSchema),
  getAllWorkSchedules
);

router.get(
  WORK_SCHEDULE_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getWorkScheduleByIdSchema),
  getWorkScheduleById
);

router.get(
  WORK_SCHEDULE_ROUTES.GET_BY_USER_ID,
  authenticateJWT,
  validateSchema(getWorkSchedulesByUserIdSchema),
  getWorkSchedulesByUserId
);

router.put(
  WORK_SCHEDULE_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateWorkScheduleSchema),
  updateWorkSchedule
);

export default router;
