import ExcelJS from "exceljs";
import {
  PatientExcel,
  PatientExcelConsentType,
  PatientExcelExportData,
  PatientExcelIntakeOptionGroup,
} from "../../interfaces/Patient";

const genderMap = {
  MALE: "Masculino",
  FEMALE: "Femenino",
  LGBTQ: "LGBTQ+",
  NOT_SPECIFIED: "No especificado",
};

const maritalStatusMap = {
  SINGLE: "Soltero(a)",
  MARRIED: "Casado(a)",
  WIDOWED: "Viudo(a)",
  DIVORCED: "Divorciado(a)",
  COHABITANT: "Conviviente",
};

type WorksheetColumn = Partial<ExcelJS.Column> & {
  key: string;
  header: string;
  width: number;
};

type PatientIntakeSelection = NonNullable<
  PatientExcel["intakeInfo"]
>["selections"][number];

type UnknownRecord = Record<string, unknown>;

const emptyCell = null;

const extraDataLabelMap: Record<string, string> = {
  acceptCommunications: "Acepta comunicaciones",
  acceptDataPolicy: "Acepta politica de datos",
  acceptPromotions: "Acepta promociones",
  campaign: "Campana",
  comparedOtherCenters: "Comparo otros centros",
  consultationReasonCategory: "Categoria del motivo de consulta",
  frontend: "",
  guardianName: "Nombre del tutor",
  guardianPhone: "Telefono del tutor",
  howFoundUs: "Como nos conocio",
  howLong: "Tiempo con la situacion",
  incomeRange: "Rango de ingresos",
  livesWith: "Vive con",
  mainReason: "Motivo principal",
  numChildren: "Numero de hijos",
  paymentMethods: "Metodos de pago",
  preferredContact: "Medio de contacto preferido",
  preferredModality: "Modalidad preferida",
  preferredSchedule: "Horario preferido",
  previousTherapy: "Terapia previa",
  psychiatricMedication: "Medicacion psiquiatrica",
  requiredSpecialty: "Especialidad requerida",
  urgencyLevel: "Nivel de urgencia",
  whatAttractedAttention: "Que le llamo la atencion",
  whoReferred: "Quien lo refirio",
  workMode: "Modalidad de trabajo",
  workSector: "Sector laboral",
};

const toCellValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return emptyCell;
  }

  return value;
};

const toDateCellValue = (value?: Date | null) => value ?? emptyCell;

const toBooleanLabel = (value?: boolean | null) => {
  if (value === undefined || value === null) {
    return emptyCell;
  }

  return value ? "Si" : "No";
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const joinValues = (values: Array<string | null | undefined>) => {
  const filteredValues = values.filter(
    (value): value is string => typeof value === "string" && value.trim() !== ""
  );

  return filteredValues.length > 0 ? filteredValues.join(", ") : emptyCell;
};

const toReadableLabel = (key: string) => {
  if (extraDataLabelMap[key] !== undefined) {
    return extraDataLabelMap[key];
  }

  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
};

const formatExtraDataValue = (value: unknown): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return toBooleanLabel(value);
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("es-PE");
  }

  if (Array.isArray(value)) {
    const formattedItems = value
      .map((item) => formatExtraDataValue(item))
      .filter((item): item is string => Boolean(item));

    return formattedItems.length > 0 ? formattedItems.join(", ") : null;
  }

  if (isRecord(value)) {
    const inlineValues = Object.entries(value)
      .map(([key, item]) => {
        const formattedItem = formatExtraDataValue(item);

        return formattedItem ? `${toReadableLabel(key)}: ${formattedItem}` : null;
      })
      .filter((item): item is string => Boolean(item));

    return inlineValues.length > 0 ? inlineValues.join("; ") : null;
  }

  return String(value);
};

const formatExtraDataCell = (value: unknown) => {
  if (!isRecord(value) || Object.keys(value).length === 0) {
    return emptyCell;
  }

  const lines: string[] = [];

  const appendExtraDataLine = (
    key: string,
    item: unknown,
    parentLabel?: string
  ) => {
    const formattedItem = formatExtraDataValue(item);

    if (!formattedItem) {
      return;
    }

    const label = toReadableLabel(key);
    const displayLabel = parentLabel && label ? `${parentLabel} - ${label}` : label;

    lines.push(displayLabel ? `${displayLabel}: ${formattedItem}` : formattedItem);
  };

  for (const [key, item] of Object.entries(value)) {
    if (key === "frontend" && isRecord(item)) {
      for (const [frontendKey, frontendValue] of Object.entries(item)) {
        appendExtraDataLine(frontendKey, frontendValue);
      }
      continue;
    }

    if (isRecord(item)) {
      const parentLabel = toReadableLabel(key);
      for (const [nestedKey, nestedValue] of Object.entries(item)) {
        appendExtraDataLine(nestedKey, nestedValue, parentLabel || undefined);
      }
      continue;
    }

    appendExtraDataLine(key, item);
  }

  return lines.length > 0 ? lines.join("\n") : emptyCell;
};

const fullName = (patient: Pick<PatientExcel, "firstName" | "lastName">) =>
  [patient.firstName, patient.lastName].filter(Boolean).join(" ");

const optionGroupColumnKey = (groupCode: string) => `intake_${groupCode}`;

const consentColumnKey = (consentCode: string) => `consent_${consentCode}`;

const sortSelections = (
  left: PatientIntakeSelection,
  right: PatientIntakeSelection
) => {
  const groupCompare = left.intakeOption.group.code.localeCompare(
    right.intakeOption.group.code
  );

  if (groupCompare !== 0) {
    return groupCompare;
  }

  return left.intakeOption.sortOrder - right.intakeOption.sortOrder;
};

const getSelectionsByGroup = (patient: PatientExcel) => {
  const selectionsByGroup = new Map<string, PatientIntakeSelection[]>();
  const selections = [...(patient.intakeInfo?.selections ?? [])].sort(
    sortSelections
  );

  for (const selection of selections) {
    const groupCode = selection.intakeOption.group.code;
    const groupSelections = selectionsByGroup.get(groupCode) ?? [];

    groupSelections.push(selection);
    selectionsByGroup.set(groupCode, groupSelections);
  }

  return selectionsByGroup;
};

const getLatestConsentByCode = (patient: PatientExcel) => {
  const consentsByCode = new Map<
    string,
    PatientExcel["patientConsents"][number]
  >();

  for (const consent of patient.patientConsents) {
    const existingConsent = consentsByCode.get(consent.consentType.code);
    const existingDate =
      existingConsent?.acceptedAt ?? existingConsent?.createdAt ?? new Date(0);
    const currentDate = consent.acceptedAt ?? consent.createdAt ?? new Date(0);

    if (!existingConsent || currentDate > existingDate) {
      consentsByCode.set(consent.consentType.code, consent);
    }
  }

  return consentsByCode;
};

const buildOptionGroupsForExport = (
  patients: PatientExcel[],
  intakeOptionGroups: PatientExcelIntakeOptionGroup[]
) => {
  const groupsByCode = new Map<string, PatientExcelIntakeOptionGroup>();

  for (const group of intakeOptionGroups) {
    groupsByCode.set(group.code, group);
  }

  for (const patient of patients) {
    for (const selection of patient.intakeInfo?.selections ?? []) {
      const group = selection.intakeOption.group;

      if (!groupsByCode.has(group.code)) {
        groupsByCode.set(group.code, group);
      }
    }
  }

  return Array.from(groupsByCode.values()).sort((left, right) =>
    left.code.localeCompare(right.code)
  );
};

const buildConsentTypesForExport = (
  patients: PatientExcel[],
  consentTypes: PatientExcelConsentType[]
) => {
  const consentTypesByCode = new Map<string, PatientExcelConsentType>();

  for (const consentType of consentTypes) {
    consentTypesByCode.set(consentType.code, consentType);
  }

  for (const patient of patients) {
    for (const consent of patient.patientConsents) {
      if (!consentTypesByCode.has(consent.consentType.code)) {
        consentTypesByCode.set(consent.consentType.code, consent.consentType);
      }
    }
  }

  return Array.from(consentTypesByCode.values()).sort((left, right) =>
    left.code.localeCompare(right.code)
  );
};

const styleWorksheet = (worksheet: ExcelJS.Worksheet) => {
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  if (worksheet.columnCount > 0) {
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columnCount },
    };
  }

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "0B2035" },
  };

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        wrapText: true,
      };
    });
  });
};

const setWorksheetColumns = (
  worksheet: ExcelJS.Worksheet,
  columns: WorksheetColumn[]
) => {
  worksheet.columns = columns;

  for (const column of worksheet.columns) {
    if (column.numFmt && column.eachCell) {
      const columnNumberFormat = column.numFmt;
      column.eachCell((cell) => {
        cell.numFmt = columnNumberFormat;
      });
    }
  }
};

const createPatientsSheet = (
  workbook: ExcelJS.Workbook,
  patients: PatientExcel[],
  optionGroups: PatientExcelIntakeOptionGroup[],
  consentTypes: PatientExcelConsentType[]
) => {
  const worksheet = workbook.addWorksheet("Pacientes");

  const baseColumns: WorksheetColumn[] = [
    { header: "ID paciente", key: "id", width: 38 },
    { header: "Historia clinica", key: "clinicalHistoryNumber", width: 18 },
    { header: "ID historia clinica", key: "clinicalHistoryId", width: 38 },
    { header: "Nombres", key: "firstName", width: 20 },
    { header: "Apellidos", key: "lastName", width: 24 },
    { header: "Nombre completo", key: "fullName", width: 32 },
    { header: "DNI", key: "dni", width: 14 },
    { header: "Genero", key: "gender", width: 18 },
    {
      header: "Fecha de nacimiento",
      key: "birthdate",
      width: 18,
      numFmt: "dd/mm/yyyy",
    },
    { header: "Lugar de nacimiento", key: "birthPlace", width: 22 },
    { header: "Nivel educativo", key: "educationLevel", width: 22 },
    { header: "Ocupacion", key: "occupation", width: 22 },
    { header: "Lugar de ocupacion", key: "occupationLocation", width: 24 },
    { header: "Estado civil", key: "maritalStatus", width: 18 },
    { header: "Religion", key: "religion", width: 18 },
    { header: "Telefono", key: "phoneNumber", width: 16 },
    { header: "Direccion", key: "address", width: 34 },
    { header: "Distrito", key: "district", width: 22 },
    { header: "Provincia", key: "province", width: 22 },
    { header: "Region", key: "region", width: 22 },
    { header: "Psicologo asignado", key: "psychologistName", width: 30 },
    { header: "DNI psicologo", key: "psychologistDni", width: 16 },
    { header: "Email psicologo", key: "psychologistEmail", width: 28 },
    { header: "Paciente activo", key: "isActive", width: 16 },
    { header: "Nombre apoderado", key: "parentFullName", width: 28 },
    { header: "DNI apoderado", key: "parentDni", width: 18 },
    { header: "Telefono apoderado", key: "parentPhoneNumber", width: 20 },
    {
      header: "Creado",
      key: "createdAt",
      width: 20,
      numFmt: "dd/mm/yyyy hh:mm",
    },
    {
      header: "Actualizado",
      key: "updatedAt",
      width: 20,
      numFmt: "dd/mm/yyyy hh:mm",
    },
  ];

  const intakeColumns: WorksheetColumn[] = [
    { header: "Email intake", key: "intakeEmail", width: 28 },
    { header: "Sexo", key: "sex", width: 16 },
    { header: "Vive con", key: "livesWithText", width: 32 },
    { header: "Numero de hijos", key: "childrenCount", width: 16 },
    { header: "Nombre tutor", key: "guardianName", width: 28 },
    { header: "Telefono tutor", key: "guardianPhone", width: 20 },
    {
      header: "Motivo principal de consulta",
      key: "mainConsultationReason",
      width: 42,
    },
    { header: "Tiempo de situacion", key: "situationDurationText", width: 24 },
    { header: "Terapia previa", key: "hadPreviousTherapy", width: 18 },
    {
      header: "Medicacion psiquiatrica",
      key: "takesPsychiatricMedication",
      width: 22,
    },
    { header: "Comparo otros centros", key: "comparedOtherCenters", width: 22 },
    { header: "Referido por", key: "referredByName", width: 24 },
    { header: "Relacion referido", key: "referredByRelation", width: 24 },
    { header: "Telefono referido", key: "referredByPhone", width: 20 },
    { header: "Nota de atraccion", key: "attractionNote", width: 36 },
    { header: "Rango de ingresos", key: "incomeRange", width: 24 },
    { header: "Informacion adicional", key: "extraData", width: 48 },
  ];

  const optionColumns = optionGroups.map((group) => ({
    header: `Intake - ${group.name}`,
    key: optionGroupColumnKey(group.code),
    width: 30,
  }));

  const consentColumns = consentTypes.map((consentType) => ({
    header: `Consentimiento - ${consentType.name}`,
    key: consentColumnKey(consentType.code),
    width: 28,
  }));

  setWorksheetColumns(worksheet, [
    ...baseColumns,
    ...intakeColumns,
    ...optionColumns,
    ...consentColumns,
  ]);

  for (const patient of patients) {
    const selectionsByGroup = getSelectionsByGroup(patient);
    const consentsByCode = getLatestConsentByCode(patient);
    const row: Record<string, unknown> = {
      id: patient.id,
      clinicalHistoryNumber: patient.clinicalHistory.displayInt,
      clinicalHistoryId: patient.clinicalHistoryId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      fullName: fullName(patient),
      dni: patient.dni,
      gender: genderMap[patient.gender],
      birthdate: toDateCellValue(patient.birthdate),
      birthPlace: patient.birthPlace,
      educationLevel: patient.educationLevel,
      occupation: patient.occupation,
      occupationLocation: patient.occupationLocation,
      maritalStatus: maritalStatusMap[patient.maritalStatus],
      religion: toCellValue(patient.religion),
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      district: patient.district.name,
      province: patient.district.province.name,
      region: patient.district.province.region.name,
      psychologistName: patient.psychologist
        ? fullName(patient.psychologist)
        : emptyCell,
      psychologistDni: toCellValue(patient.psychologist?.dni),
      psychologistEmail: toCellValue(patient.psychologist?.email),
      isActive: toBooleanLabel(patient.isActive),
      parentFullName: toCellValue(patient.parentFullName),
      parentDni: toCellValue(patient.parentDni),
      parentPhoneNumber: toCellValue(patient.parentPhoneNumber),
      createdAt: toDateCellValue(patient.createdAt),
      updatedAt: toDateCellValue(patient.updatedAt),
      intakeEmail: toCellValue(patient.intakeInfo?.email),
      sex: toCellValue(patient.intakeInfo?.sex),
      livesWithText: toCellValue(patient.intakeInfo?.livesWithText),
      childrenCount: toCellValue(patient.intakeInfo?.childrenCount),
      guardianName: toCellValue(patient.intakeInfo?.guardianName),
      guardianPhone: toCellValue(patient.intakeInfo?.guardianPhone),
      mainConsultationReason: toCellValue(
        patient.intakeInfo?.mainConsultationReason
      ),
      situationDurationText: toCellValue(
        patient.intakeInfo?.situationDurationText
      ),
      hadPreviousTherapy: toBooleanLabel(
        patient.intakeInfo?.hadPreviousTherapy
      ),
      takesPsychiatricMedication: toBooleanLabel(
        patient.intakeInfo?.takesPsychiatricMedication
      ),
      comparedOtherCenters: toBooleanLabel(
        patient.intakeInfo?.comparedOtherCenters
      ),
      referredByName: toCellValue(patient.intakeInfo?.referredByName),
      referredByRelation: toCellValue(patient.intakeInfo?.referredByRelation),
      referredByPhone: toCellValue(patient.intakeInfo?.referredByPhone),
      attractionNote: toCellValue(patient.intakeInfo?.attractionNote),
      incomeRange: toCellValue(patient.intakeInfo?.incomeRange?.label),
      extraData: formatExtraDataCell(patient.intakeInfo?.extraData),
    };

    for (const group of optionGroups) {
      const groupSelections = selectionsByGroup.get(group.code) ?? [];
      row[optionGroupColumnKey(group.code)] = joinValues(
        groupSelections.map((selection) => selection.intakeOption.name)
      );
    }

    for (const consentType of consentTypes) {
      const consent = consentsByCode.get(consentType.code);
      row[consentColumnKey(consentType.code)] = consent
        ? toBooleanLabel(consent.accepted)
        : emptyCell;
    }

    worksheet.addRow(row);
  }

  styleWorksheet(worksheet);
};

export const generatePatientExcel = async ({
  patients,
  intakeOptionGroups,
  consentTypes,
}: PatientExcelExportData) => {
  const workbook = new ExcelJS.Workbook();
  const optionGroupsForExport = buildOptionGroupsForExport(
    patients,
    intakeOptionGroups
  );
  const consentTypesForExport = buildConsentTypesForExport(
    patients,
    consentTypes
  );

  workbook.creator = "Senses";
  workbook.created = new Date();

  createPatientsSheet(
    workbook,
    patients,
    optionGroupsForExport,
    consentTypesForExport
  );

  return workbook;
};
