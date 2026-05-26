import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "dotenv/config";

// Error handling middleware
import { errorHandler } from "./src/common/middlewares/errorHandler";

// Routes
import { ItemRouter } from "./src/features/items";
import { UserRouter } from "./src/features/users";
import { AuthRouter } from "./src/auth";
import { RolesRouter } from "./src/features/roles";
import { LocationRouter } from "./src/features/locations";
import { RegionRouter } from "./src/features/regions";
import { ProvinceRouter } from "./src/features/provinces";
import { DistrictRouter } from "./src/features/districts";
import { PatientRouter } from "./src/features/patients";
import { ClinicalHistoryRouter } from "./src/features/clinicalHistories";
import { OfficeRouter } from "./src/features/offices";
import { AppointmentRouter } from "./src/features/appointment";
import { EmployeeLeaveRouter } from "./src/features/employeeLeaves";
import { ItemInstanceRouter } from "./src/features/itemInstances";
import { WorkScheduleRouter } from "./src/features/workSchedules";
import { DocumentRouter } from "./src/features/documents";
import { TestRouter } from "./src/features/tests";
import { EvaluationRouter } from "./src/features/evaluations";
import { PatientTestRouter } from "./src/features/patientTests";
import { DashboardRouter } from "./src/features/dashboard";
import { startEmployeeLeaveReactivationScheduler } from "./src/lib/employeeLeaveScheduler";
import { StorageRouter } from "./src/cloudStorage";
import { setupSwagger } from "./src/swagger";

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://app.sensespsicologos.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

setupSwagger(app);

app.use((req, res, next) => {
  console.log(req.cookies.refreshToken);
  next();
});
app.use("/auth", AuthRouter);

app.use("/api/v1", UserRouter);

app.use("/api/v1", ItemRouter);

app.use("/api/v1", RolesRouter);

app.use("/api/v1", LocationRouter);

app.use("/api/v1", ItemInstanceRouter);

app.use("/api/v1", RegionRouter);
app.use("/api/v1", ProvinceRouter);
app.use("/api/v1", DistrictRouter);
app.use("/api/v1", PatientRouter);
app.use("/api/v1", ClinicalHistoryRouter);
app.use("/api/v1", OfficeRouter);
app.use("/api/v1", AppointmentRouter);
app.use("/api/v1", EmployeeLeaveRouter);
app.use("/api/v1", WorkScheduleRouter);
app.use("/api/v1", DocumentRouter);
app.use("/api/v1", TestRouter);
app.use("/api/v1", EvaluationRouter);
app.use("/api/v1", PatientTestRouter);
app.use("/api/v1", DashboardRouter);
app.use("/api/v1", StorageRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startEmployeeLeaveReactivationScheduler();
});
