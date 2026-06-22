import { appointmentHandlers } from "./handlers/appointments"
import { patientHandlers } from "./handlers/patients"
import { clinicalHistoryHandlers } from "./handlers/clinicalHistories"
import { evaluationHandlers } from "./handlers/evaluations"
import { authHandlers } from "./handlers/auth"
import { systemUserHandlers } from "./handlers/systemUsers"

export const handlers = [
  ...appointmentHandlers,
  ...patientHandlers,
  ...clinicalHistoryHandlers,
  ...evaluationHandlers,
  ...authHandlers,
  ...systemUserHandlers,
]
