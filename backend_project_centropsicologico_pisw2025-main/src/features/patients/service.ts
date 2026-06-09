import type { Prisma } from "@prisma/client";
import { AppError } from "../../common/utils";
import { PatientMinimal } from "../../interfaces";
import prisma from "../../lib/prisma";
import {
  CreatePatientInput,
  GetAllPatientsPaginatedInput,
  GetAllPatientsSearchInput,
  GetMyPatientListInput,
  GetPatientByAppointmentIdInput,
  GetPatientByIdInput,
  GetPatientsByPsychologistIdInput,
  UpdatePatientInput,
} from "./schema";

const normalizeSearch = (value?: string) =>
  value?.trim().replace(/\s+/g, " ") ?? "";

type PatientSearchFilters = {
  dni?: string;
  firstname?: string;
  lastname?: string;
};

const buildDniFilter = (
  value: string
): Prisma.StringFilter<"Patient"> | string =>
  value.length === 8 ? value : { startsWith: value };

const buildPatientSearchWhere = ({
  dni,
  firstname,
  lastname,
}: PatientSearchFilters): Prisma.PatientWhereInput => {
  const dniTerm = normalizeSearch(dni);
  const firstnameTerm = normalizeSearch(firstname);
  const lastnameTerm = normalizeSearch(lastname);

  return {
    ...(dniTerm
      ? {
          dni: buildDniFilter(dniTerm),
        }
      : {
          ...(firstnameTerm && {
            firstName: {
              contains: firstnameTerm,
              mode: "insensitive",
            },
          }),
          ...(lastnameTerm && {
            lastName: {
              contains: lastnameTerm,
              mode: "insensitive",
            },
          }),
        }),
  };
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const optionId = (order: number) =>
  `20000000-0000-4000-8000-${order.toString().padStart(12, "0")}`;

const consentTypeId = (order: number) =>
  `30000000-0000-4000-8000-${order.toString().padStart(12, "0")}`;

const normalizeLookupKey = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const readNonEmptyString = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const readOptionalNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  const valueAsString = readNonEmptyString(value);
  if (!valueAsString) {
    return undefined;
  }

  const parsed = Number(valueAsString);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
};

const readOptionalBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = normalizeLookupKey(value);
  if (!normalizedValue) {
    return undefined;
  }

  if (["si", "yes", "true", "1"].includes(normalizedValue)) {
    return true;
  }

  if (["no", "false", "0"].includes(normalizedValue)) {
    return false;
  }

  return undefined;
};

const asArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  const valueAsString = readNonEmptyString(value);
  if (!valueAsString) {
    return [];
  }

  return valueAsString
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const readFromIntakeOrRoot = (
  intakeInfo: UnknownRecord,
  root: UnknownRecord,
  key: string
) => (intakeInfo[key] !== undefined ? intakeInfo[key] : root[key]);

const assignStringIfPresent = (
  target: UnknownRecord,
  key: string,
  value: unknown
) => {
  const valueAsString = readNonEmptyString(value);
  if (valueAsString !== undefined) {
    target[key] = valueAsString;
  }
};

const assignNumberIfPresent = (
  target: UnknownRecord,
  key: string,
  value: unknown
) => {
  const valueAsNumber = readOptionalNumber(value);
  if (valueAsNumber !== undefined) {
    target[key] = valueAsNumber;
  }
};

const assignBooleanIfPresent = (
  target: UnknownRecord,
  key: string,
  value: unknown
) => {
  const valueAsBoolean = readOptionalBoolean(value);
  if (valueAsBoolean !== undefined) {
    target[key] = valueAsBoolean;
  }
};

const incomeRangeIdByLabel: Record<string, string> = {
  "menos de s 1025": "00000000-0000-4000-8000-000000000001",
  "menos de s 1 025": "00000000-0000-4000-8000-000000000001",
  "s 1025 s 1500": "00000000-0000-4000-8000-000000000002",
  "s 1 025 s 1 500": "00000000-0000-4000-8000-000000000002",
  "s 1501 s 2500": "00000000-0000-4000-8000-000000000003",
  "s 1 501 s 2 500": "00000000-0000-4000-8000-000000000003",
  "s 2501 s 4000": "00000000-0000-4000-8000-000000000004",
  "s 2 501 s 4 000": "00000000-0000-4000-8000-000000000004",
  "mas de s 4000": "00000000-0000-4000-8000-000000000005",
  "mas de s 4 000": "00000000-0000-4000-8000-000000000005",
  "prefiere no decirlo": "00000000-0000-4000-8000-000000000006",
};

const intakeOptionIdsByPrototypeField: Record<string, Record<string, string>> = {
  urgencyLevel: {
    baja: optionId(21),
    media: optionId(22),
    alta: optionId(23),
    critica: optionId(24),
    emergencia: optionId(24),
    "critica emergencia": optionId(24),
  },
  preferredModality: {
    virtual: optionId(9),
    presencial: optionId(10),
    mixta: optionId(11),
  },
  preferredSchedule: {
    manana: optionId(12),
    tarde: optionId(13),
    noche: optionId(14),
    "fin de semana": optionId(15),
  },
  requiredSpecialty: {
    ansiedad: optionId(35),
    depresion: optionId(36),
    "terapia de pareja": optionId(37),
    "terapia familiar": optionId(41),
    "psicologia infantil": optionId(42),
    "evaluacion psicologica": optionId(43),
    "orientacion vocacional": optionId(44),
    otro: optionId(45),
  },
  preferredContact: {
    whatsapp: optionId(25),
    "llamada telefonica": optionId(26),
    llamada: optionId(26),
    telefono: optionId(26),
    "correo electronico": optionId(27),
    correo: optionId(27),
    email: optionId(27),
  },
  howFoundUs: {
    google: optionId(1),
    instagram: optionId(2),
    facebook: optionId(3),
    tiktok: optionId(4),
    recomendacion: optionId(5),
    volante: optionId(6),
    convenio: optionId(7),
    otro: optionId(8),
  },
  employmentStatus: {
    "sin trabajo": optionId(28),
    "con trabajo": optionId(29),
    independiente: optionId(30),
    estudiante: optionId(31),
    jubilado: optionId(46),
    jubilada: optionId(46),
  },
  workMode: {
    remoto: optionId(32),
    presencial: optionId(33),
    mixto: optionId(34),
    mixta: optionId(34),
    "no aplica": optionId(47),
  },
  paymentMethods: {
    efectivo: optionId(16),
    tarjeta: optionId(17),
    transferencia: optionId(18),
    "transferencia bancaria": optionId(18),
    yape: optionId(19),
    plin: optionId(20),
  },
};

const prototypeIntakeFields = [
  "livesWith",
  "numChildren",
  "guardianName",
  "guardianPhone",
  "mainReason",
  "howLong",
  "previousTherapy",
  "psychiatricMedication",
  "urgencyLevel",
  "preferredModality",
  "preferredSchedule",
  "requiredSpecialty",
  "preferredContact",
  "howFoundUs",
  "whoReferred",
  "comparedOtherCenters",
  "whatAttractedAttention",
  "acceptPromotions",
  "employmentStatus",
  "workSector",
  "workMode",
  "incomeRange",
  "paymentMethods",
  "acceptDataPolicy",
  "acceptCommunications",
];

const patientCreateFields = [
  "firstName",
  "lastName",
  "dni",
  "gender",
  "birthdate",
  "birthPlace",
  "educationLevel",
  "occupation",
  "maritalStatus",
  "religion",
  "occupationLocation",
  "phoneNumber",
  "parentFullName",
  "parentPhoneNumber",
  "parentDni",
  "districtId",
  "psychologistId",
  "address",
] as const;

const patientUpdateFields = [
  "firstName",
  "lastName",
  "gender",
  "birthDate",
  "birthdate",
  "birthPlace",
  "educationLevel",
  "occupation",
  "maritalStatus",
  "religion",
  "occupationLocation",
  "phoneNumber",
  "parentFullName",
  "parentPhoneNumber",
  "parentDni",
  "districtId",
  "psychologistId",
  "address",
] as const;

const normalizeExistingSelections = (selections: unknown) => {
  if (!Array.isArray(selections)) {
    return [];
  }

  const normalizedSelections: PatientIntakeSelectionInput[] = [];

  for (const selection of selections) {
    if (!isRecord(selection)) {
      continue;
    }

    const intakeOptionId = readNonEmptyString(selection.intakeOptionId);
    if (!intakeOptionId) {
      continue;
    }

    normalizedSelections.push({
      intakeOptionId,
      isPrimary: readOptionalBoolean(selection.isPrimary) ?? false,
      notes: readNonEmptyString(selection.notes),
    });
  }

  return normalizedSelections;
};

const normalizePrototypeSelections = (
  root: UnknownRecord,
  intakeInfo: UnknownRecord
) => {
  const selections: PatientIntakeSelectionInput[] = [];

  for (const [field, optionIdsByValue] of Object.entries(
    intakeOptionIdsByPrototypeField
  )) {
    const selectedValues = asArray(readFromIntakeOrRoot(intakeInfo, root, field));

    for (const selectedValue of selectedValues) {
      const optionIdFromValue =
        optionIdsByValue[normalizeLookupKey(selectedValue)];

      if (optionIdFromValue) {
        selections.push({
          intakeOptionId: optionIdFromValue,
          isPrimary: selections.length === 0,
        });
      }
    }
  }

  return selections;
};

const dedupeSelections = (selections: PatientIntakeSelectionInput[]) => {
  const selectionsByOptionId = new Map<string, PatientIntakeSelectionInput>();

  for (const selection of selections) {
    selectionsByOptionId.set(selection.intakeOptionId, selection);
  }

  return Array.from(selectionsByOptionId.values());
};

const normalizePatientConsents = (
  root: UnknownRecord,
  currentConsents: unknown
) => {
  const consents = Array.isArray(currentConsents)
    ? currentConsents.filter(isRecord).map((consent) => ({
        consentTypeId: readNonEmptyString(consent.consentTypeId) ?? "",
        accepted: readOptionalBoolean(consent.accepted) ?? false,
        policyVersion: readNonEmptyString(consent.policyVersion),
        acceptedAt: readNonEmptyString(consent.acceptedAt),
      }))
    : [];

  const acceptDataPolicy = readOptionalBoolean(root.acceptDataPolicy);
  const acceptPromotions =
    readOptionalBoolean(root.acceptPromotions) ??
    readOptionalBoolean(root.acceptCommunications);

  if (acceptDataPolicy !== undefined) {
    consents.push({
      consentTypeId: consentTypeId(1),
      accepted: acceptDataPolicy,
      policyVersion: undefined,
      acceptedAt: undefined,
    });
  }

  if (acceptPromotions !== undefined) {
    consents.push({
      consentTypeId: consentTypeId(2),
      accepted: acceptPromotions,
      policyVersion: undefined,
      acceptedAt: undefined,
    });
  }

  const consentsByType = new Map<string, (typeof consents)[number]>();
  for (const consent of consents) {
    if (consent.consentTypeId) {
      consentsByType.set(consent.consentTypeId, consent);
    }
  }

  return Array.from(consentsByType.values());
};

const normalizePatientIntakeInput = (
  root: UnknownRecord,
  currentIntakeInfo: unknown
) => {
  const intakeInfo = isRecord(currentIntakeInfo) ? currentIntakeInfo : {};
  const normalized: UnknownRecord = {};
  const frontendExtraData: UnknownRecord = {};

  assignStringIfPresent(normalized, "email", intakeInfo.email);
  assignStringIfPresent(normalized, "sex", intakeInfo.sex);
  assignStringIfPresent(normalized, "livesWithText", intakeInfo.livesWithText);
  assignNumberIfPresent(normalized, "childrenCount", intakeInfo.childrenCount);
  assignStringIfPresent(normalized, "guardianName", intakeInfo.guardianName);
  assignStringIfPresent(normalized, "guardianPhone", intakeInfo.guardianPhone);
  assignStringIfPresent(
    normalized,
    "mainConsultationReason",
    intakeInfo.mainConsultationReason
  );
  assignStringIfPresent(
    normalized,
    "situationDurationText",
    intakeInfo.situationDurationText
  );
  assignBooleanIfPresent(
    normalized,
    "hadPreviousTherapy",
    intakeInfo.hadPreviousTherapy
  );
  assignBooleanIfPresent(
    normalized,
    "takesPsychiatricMedication",
    intakeInfo.takesPsychiatricMedication
  );
  assignBooleanIfPresent(
    normalized,
    "comparedOtherCenters",
    intakeInfo.comparedOtherCenters
  );
  assignStringIfPresent(normalized, "referredByName", intakeInfo.referredByName);
  assignStringIfPresent(
    normalized,
    "referredByRelation",
    intakeInfo.referredByRelation
  );
  assignStringIfPresent(
    normalized,
    "referredByPhone",
    intakeInfo.referredByPhone
  );
  assignStringIfPresent(normalized, "attractionNote", intakeInfo.attractionNote);

  assignStringIfPresent(
    normalized,
    "livesWithText",
    readFromIntakeOrRoot(intakeInfo, root, "livesWith")
  );
  assignNumberIfPresent(
    normalized,
    "childrenCount",
    readFromIntakeOrRoot(intakeInfo, root, "numChildren")
  );
  assignStringIfPresent(
    normalized,
    "guardianName",
    readFromIntakeOrRoot(intakeInfo, root, "guardianName")
  );
  assignStringIfPresent(
    normalized,
    "guardianPhone",
    readFromIntakeOrRoot(intakeInfo, root, "guardianPhone")
  );
  assignStringIfPresent(
    normalized,
    "mainConsultationReason",
    readFromIntakeOrRoot(intakeInfo, root, "mainReason")
  );
  assignStringIfPresent(
    normalized,
    "situationDurationText",
    readFromIntakeOrRoot(intakeInfo, root, "howLong")
  );
  assignBooleanIfPresent(
    normalized,
    "hadPreviousTherapy",
    readFromIntakeOrRoot(intakeInfo, root, "previousTherapy")
  );
  assignBooleanIfPresent(
    normalized,
    "takesPsychiatricMedication",
    readFromIntakeOrRoot(intakeInfo, root, "psychiatricMedication")
  );
  assignBooleanIfPresent(
    normalized,
    "comparedOtherCenters",
    readFromIntakeOrRoot(intakeInfo, root, "comparedOtherCenters")
  );
  assignStringIfPresent(
    normalized,
    "referredByName",
    readFromIntakeOrRoot(intakeInfo, root, "whoReferred")
  );
  assignStringIfPresent(
    normalized,
    "attractionNote",
    readFromIntakeOrRoot(intakeInfo, root, "whatAttractedAttention")
  );

  const incomeRangeId =
    readNonEmptyString(intakeInfo.incomeRangeId) ??
    incomeRangeIdByLabel[
      normalizeLookupKey(readFromIntakeOrRoot(intakeInfo, root, "incomeRange"))
    ];
  if (incomeRangeId) {
    normalized.incomeRangeId = incomeRangeId;
  }

  for (const field of prototypeIntakeFields) {
    const value = readFromIntakeOrRoot(intakeInfo, root, field);
    if (value !== undefined && value !== "") {
      frontendExtraData[field] = value;
    }
  }

  const existingExtraData = isRecord(intakeInfo.extraData)
    ? intakeInfo.extraData
    : {};
  if (
    Object.keys(existingExtraData).length > 0 ||
    Object.keys(frontendExtraData).length > 0
  ) {
    normalized.extraData = {
      ...existingExtraData,
      frontend: {
        ...(isRecord(existingExtraData.frontend)
          ? existingExtraData.frontend
          : {}),
        ...frontendExtraData,
      },
    };
  }

  const selections = dedupeSelections([
    ...normalizeExistingSelections(intakeInfo.selections),
    ...normalizePrototypeSelections(root, intakeInfo),
  ]);
  if (selections.length > 0 || intakeInfo.selections !== undefined) {
    normalized.selections = selections;
  }

  return Object.keys(normalized).length > 0
    ? (normalized as PatientIntakeInput)
    : undefined;
};

const normalizePatientPayload = <T extends readonly string[]>(
  rawData: unknown,
  allowedFields: T
) => {
  const root = isRecord(rawData) ? rawData : {};
  const normalized: UnknownRecord = {};

  for (const field of allowedFields) {
    const value = root[field];
    if (value !== undefined && value !== "") {
      normalized[field] = value;
    }
  }

  const intakeInfo = normalizePatientIntakeInput(root, root.intakeInfo);
  if (intakeInfo) {
    normalized.intakeInfo = intakeInfo;
  }

  const consents = normalizePatientConsents(root, root.consents);
  if (consents.length > 0 || root.consents !== undefined) {
    normalized.consents = consents;
  }

  return normalized;
};

const buildIntakeScalarData = (intakeInfo: UnknownRecord) => {
  const data: UnknownRecord = {};

  assignStringIfPresent(data, "email", intakeInfo.email);
  assignStringIfPresent(data, "sex", intakeInfo.sex);
  assignStringIfPresent(data, "livesWithText", intakeInfo.livesWithText);
  assignNumberIfPresent(data, "childrenCount", intakeInfo.childrenCount);
  assignStringIfPresent(data, "guardianName", intakeInfo.guardianName);
  assignStringIfPresent(data, "guardianPhone", intakeInfo.guardianPhone);
  assignStringIfPresent(
    data,
    "mainConsultationReason",
    intakeInfo.mainConsultationReason
  );
  assignStringIfPresent(
    data,
    "situationDurationText",
    intakeInfo.situationDurationText
  );
  assignBooleanIfPresent(
    data,
    "hadPreviousTherapy",
    intakeInfo.hadPreviousTherapy
  );
  assignBooleanIfPresent(
    data,
    "takesPsychiatricMedication",
    intakeInfo.takesPsychiatricMedication
  );
  assignBooleanIfPresent(
    data,
    "comparedOtherCenters",
    intakeInfo.comparedOtherCenters
  );
  assignStringIfPresent(data, "referredByName", intakeInfo.referredByName);
  assignStringIfPresent(
    data,
    "referredByRelation",
    intakeInfo.referredByRelation
  );
  assignStringIfPresent(data, "referredByPhone", intakeInfo.referredByPhone);
  assignStringIfPresent(data, "attractionNote", intakeInfo.attractionNote);

  return data;
};

type PatientIntakeInput =
  | NonNullable<CreatePatientInput["intakeInfo"]>
  | NonNullable<UpdatePatientInput["body"]["intakeInfo"]>;

type PatientIntakeSelectionInput = NonNullable<PatientIntakeInput["selections"]>[number];

type IntakeSelectionWithCatalog = Prisma.PatientIntakeSelectionGetPayload<{
  include: {
    intakeOption: {
      include: {
        group: true;
      };
    };
  };
}>;

type PatientIntakeInfoWithCatalog = Prisma.PatientIntakeInfoGetPayload<{
  include: {
    incomeRange: true;
    selections: {
      include: {
        intakeOption: {
          include: {
            group: true;
          };
        };
      };
    };
  };
}>;

type PatientWithIntakeInfo = {
  intakeInfo: PatientIntakeInfoWithCatalog | null;
};

type IntakeSelectionGroupResponse = {
  groupId: string;
  groupCode: string;
  groupName: string;
  selectionType: string;
  selectedOptions: {
    intakeOptionId: string;
    code: string;
    name: string;
    category: string | null;
    sortOrder: number;
    isPrimary: boolean;
    notes: string | null;
    selectedAt: Date;
  }[];
};

const sortIntakeSelectionsByCatalog = (
  left: IntakeSelectionWithCatalog,
  right: IntakeSelectionWithCatalog
) => {
  const groupCompare = left.intakeOption.group.code.localeCompare(
    right.intakeOption.group.code
  );

  if (groupCompare !== 0) {
    return groupCompare;
  }

  return left.intakeOption.sortOrder - right.intakeOption.sortOrder;
};

const groupIntakeSelectionsByCatalog = (
  selections: IntakeSelectionWithCatalog[]
) => {
  const groups: Record<string, IntakeSelectionGroupResponse> = {};

  for (const selection of [...selections].sort(sortIntakeSelectionsByCatalog)) {
    const { group } = selection.intakeOption;

    if (!groups[group.code]) {
      groups[group.code] = {
        groupId: group.id,
        groupCode: group.code,
        groupName: group.name,
        selectionType: group.selectionType,
        selectedOptions: [],
      };
    }

    groups[group.code].selectedOptions.push({
      intakeOptionId: selection.intakeOptionId,
      code: selection.intakeOption.code,
      name: selection.intakeOption.name,
      category: selection.intakeOption.category,
      sortOrder: selection.intakeOption.sortOrder,
      isPrimary: selection.isPrimary,
      notes: selection.notes,
      selectedAt: selection.createdAt,
    });
  }

  return groups;
};

const formatPatientIntakeInfo = (
  intakeInfo: PatientIntakeInfoWithCatalog | null
) => {
  if (!intakeInfo) {
    return null;
  }

  const { selections, ...restIntakeInfo } = intakeInfo;

  return {
    ...restIntakeInfo,
    selectionsByGroup: groupIntakeSelectionsByCatalog(selections),
  };
};

const formatPatientResponse = <T extends PatientWithIntakeInfo>(patient: T) => ({
  ...patient,
  intakeInfo: formatPatientIntakeInfo(patient.intakeInfo),
});

const validatePatientIntakeSelections = async (
  tx: Prisma.TransactionClient,
  selections?: PatientIntakeInput["selections"]
) => {
  if (!selections || selections.length === 0) {
    return;
  }

  const selectedOptionIds = selections.map(
    (selection: PatientIntakeSelectionInput) => selection.intakeOptionId
  );
  const uniqueOptionIds = new Set(selectedOptionIds);

  if (uniqueOptionIds.size !== selectedOptionIds.length) {
    throw new AppError("No se puede repetir la misma opcion de intake", 400);
  }

  const intakeOptions = await tx.intakeOption.findMany({
    where: {
      id: {
        in: selectedOptionIds,
      },
      isActive: true,
      group: {
        isActive: true,
      },
    },
    include: {
      group: true,
    },
  });

  if (intakeOptions.length !== selectedOptionIds.length) {
    throw new AppError("Una o mas opciones de intake no existen o estan inactivas", 400);
  }

  const selectionCountByGroup = new Map<string, number>();

  for (const option of intakeOptions) {
    const currentCount = selectionCountByGroup.get(option.group.code) ?? 0;
    selectionCountByGroup.set(option.group.code, currentCount + 1);
  }

  const invalidSingleGroup = intakeOptions.find((option) => {
    const selectedCount = selectionCountByGroup.get(option.group.code) ?? 0;
    return option.group.selectionType === "SINGLE" && selectedCount > 1;
  });

  if (invalidSingleGroup) {
    throw new AppError(
      `El grupo ${invalidSingleGroup.group.code} acepta una sola opcion`,
      400
    );
  }
};

const buildPatientIntakeCreateData = (
  patientId: string,
  intakeInfo: PatientIntakeInput
): Prisma.PatientIntakeInfoCreateArgs["data"] => {
  const intakeInfoRecord = intakeInfo as UnknownRecord;
  const selections = normalizeExistingSelections(intakeInfoRecord.selections);
  const incomeRangeId = readNonEmptyString(intakeInfoRecord.incomeRangeId);
  const intakeInfoData = buildIntakeScalarData(intakeInfoRecord);

  return {
    ...intakeInfoData,
    ...(intakeInfoRecord.extraData !== undefined && {
      extraData: intakeInfoRecord.extraData as Prisma.InputJsonValue,
    }),
    patient: {
      connect: { id: patientId },
    },
    ...(incomeRangeId
      ? {
          incomeRange: {
            connect: { id: incomeRangeId },
          },
        }
      : {}),
    ...(selections && selections.length > 0
      ? {
          selections: {
            create: selections.map((selection) => ({
              intakeOption: {
                connect: { id: selection.intakeOptionId },
              },
              isPrimary: readOptionalBoolean(selection.isPrimary) ?? false,
              notes: selection.notes,
            })),
          },
        }
      : {}),
  };
};

const buildPatientIntakeUpdateData = (
  intakeInfo: PatientIntakeInput
): Prisma.PatientIntakeInfoUpdateInput => {
  const intakeInfoRecord = intakeInfo as UnknownRecord;
  const incomeRangeId = readNonEmptyString(intakeInfoRecord.incomeRangeId);
  const intakeInfoData = buildIntakeScalarData(intakeInfoRecord);

  return {
    ...intakeInfoData,
    ...(intakeInfoRecord.extraData !== undefined && {
      extraData: intakeInfoRecord.extraData as Prisma.InputJsonValue,
    }),
    ...(intakeInfoRecord.incomeRangeId !== undefined && {
      incomeRange: incomeRangeId ? { connect: { id: incomeRangeId } } : { disconnect: true },
    }),
  };
};

const replacePatientIntakeSelections = async (
  tx: Prisma.TransactionClient,
  patientIntakeInfoId: string,
  selections: NonNullable<PatientIntakeInput["selections"]>
) => {
  await tx.patientIntakeSelection.deleteMany({
    where: { patientIntakeInfoId },
  });

  if (selections.length === 0) {
    return;
  }

  await tx.patientIntakeSelection.createMany({
    data: selections.map((selection) => ({
      patientIntakeInfoId,
      intakeOptionId: selection.intakeOptionId,
      isPrimary: readOptionalBoolean(selection.isPrimary) ?? false,
      notes: selection.notes,
    })),
  });
};

const upsertPatientIntakeInfo = async (
  tx: Prisma.TransactionClient,
  patientId: string,
  intakeInfo: PatientIntakeInput
) => {
  const existingIntake = await tx.patientIntakeInfo.findUnique({
    where: { patientId },
  });

  if (!existingIntake) {
    return tx.patientIntakeInfo.create({
      data: buildPatientIntakeCreateData(patientId, intakeInfo),
    });
  }

  const updateData = buildPatientIntakeUpdateData(intakeInfo);
  if (Object.keys(updateData).length > 0) {
    await tx.patientIntakeInfo.update({
      where: { patientId },
      data: updateData,
    });
  }

  if (intakeInfo.selections !== undefined) {
    await replacePatientIntakeSelections(
      tx,
      existingIntake.id,
      intakeInfo.selections
    );
  }

  return tx.patientIntakeInfo.findUnique({
    where: { patientId },
  });
};

const replacePatientConsents = async (
  tx: Prisma.TransactionClient,
  patientId: string,
  consents: NonNullable<
    CreatePatientInput["consents"] | UpdatePatientInput["body"]["consents"]
  >
) => {
  await tx.patientConsent.deleteMany({
    where: { patientId },
  });

  if (consents.length === 0) {
    return;
  }

  await tx.patientConsent.createMany({
    data: consents.map((consent) => ({
      patientId,
      consentTypeId: consent.consentTypeId,
      accepted: readOptionalBoolean(consent.accepted) ?? false,
      policyVersion: consent.policyVersion,
      acceptedAt: consent.acceptedAt ? new Date(consent.acceptedAt) : undefined,
    })),
  });
};

const includeCreatedPatient = {
  intakeInfo: {
    include: {
      incomeRange: true,
      selections: {
        include: {
          intakeOption: {
            include: {
              group: true,
            },
          },
        },
      },
    },
  },
  patientConsents: {
    include: {
      consentType: true,
    },
  },
} satisfies Prisma.PatientInclude;

export const getAllPatientsPaginatedService = async ({
  dni,
  firstname,
  lastname,
  page,
  take,
}: GetAllPatientsPaginatedInput) => {
  const whereClause = buildPatientSearchWhere({
    dni,
    firstname,
    lastname,
  });

  const patientsDB = await prisma.patient.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      district: { select: { name: true } },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.patient.count({
      where: whereClause,
    })) / take!
  );
  return {
    currentPage: page!,
    totalPages,
    patients: patientsDB,
  };
};

export const getAllPatientsByPsychologistIdService = async ({
  params,
  query,
}: GetPatientsByPsychologistIdInput) => {
  const { page, take } = query;
  const { dni, firstname, lastname } = query;
  const { psychologistId } = params;

  const whereClause: Prisma.PatientWhereInput = {
    psychologistId,
    ...buildPatientSearchWhere({
      dni,
      firstname,
      lastname,
    }),
  };

  const patientsDB = await prisma.patient.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      clinicalHistory: { select: { id: true } },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.patient.count({
      where: whereClause,
    })) / take!
  );
  return {
    currentPage: page!,
    totalPages,
    patients: patientsDB,
  };
};

export const getAllPatientsSearchService = async ({
  dni,
  firstname,
  lastname,
}: GetAllPatientsSearchInput) => {
  const whereClause = buildPatientSearchWhere({ dni, firstname, lastname });

  if (Object.keys(whereClause).length === 0) {
    return [];
  }

  const patientsDB = await prisma.patient.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      dni: true,
      id: true,
      firstName: true,
      lastName: true,
    },
    take: 10,
  });

  return patientsDB;
};

export const getPatientByIdService = async ({ id }: GetPatientByIdInput) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      ...includeCreatedPatient,
      district: {
        select: {
          id: true,
          name: true,
          province: {
            select: {
              id: true,
              name: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!patient) {
    throw new AppError("Paciente no encontrado", 404);
  }

  return formatPatientResponse(patient);
};

export const getPatientByAppointmentIdService = async ({
  appointmentId,
}: GetPatientByAppointmentIdInput) => {
  const patient = await prisma.appointment
    .findUnique({
      where: { id: appointmentId },
      select: {
        patient: true,
      },
    })
    .then((appointment) => appointment?.patient);

  if (!patient) {
    throw new AppError("Paciente no encontrado", 404);
  }
  return patient;
};

export const createPatientService = async (data: CreatePatientInput) => {
  const normalizedData = normalizePatientPayload(
    data,
    patientCreateFields
  ) as CreatePatientInput;

  try {
    const patientCreated = await prisma.$transaction(async (tx) => {
      const { districtId, psychologistId, intakeInfo, consents, ...restData } =
        normalizedData;

      const clinicalHistory = await tx.clinicalHistory.create({ data: {} });

      const patient = await tx.patient.create({
        data: {
          ...restData,
          district: {
            connect: { id: districtId },
          },
          psychologist: psychologistId
            ? { connect: { id: psychologistId } }
            : undefined,
          clinicalHistory: {
            connect: { id: clinicalHistory.id },
          },
        },
      });

      if (intakeInfo) {
        await validatePatientIntakeSelections(tx, intakeInfo.selections);

        await tx.patientIntakeInfo.create({
          data: buildPatientIntakeCreateData(patient.id, intakeInfo),
        });
      }

      if (consents && consents.length > 0) {
        await replacePatientConsents(tx, patient.id, consents);
      }

      const createdPatient = await tx.patient.findUnique({
        where: { id: patient.id },
        include: includeCreatedPatient,
      });

      if (!createdPatient) {
        throw new AppError("Error obteniendo el paciente creado", 500);
      }

      return formatPatientResponse(createdPatient);
    });

    return patientCreated;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Error creando el paciente", 400);
  }
};

export const updatePatientService = async (data: UpdatePatientInput) => {
  const { id } = data.params;
  const normalizedBody = normalizePatientPayload(
    data.body,
    patientUpdateFields
  ) as UpdatePatientInput["body"];

  const {
    districtId,
    psychologistId,
    birthDate,
    birthdate,
    intakeInfo,
    consents,
    ...restData
  } = normalizedBody;

  const patientExists = await prisma.patient.findUnique({
    where: { id },
  });
  if (!patientExists) {
    throw new AppError("Paciente no encontrado", 404);
  }

  const normalizedBirthdate = birthdate ?? birthDate;
  const dataToUpdate: Prisma.PatientUpdateInput = {
    ...restData,
    ...(normalizedBirthdate !== undefined && {
      birthdate: normalizedBirthdate,
    }),
    ...(districtId && {
      district: {
        connect: { id: districtId },
      },
    }),
    ...(psychologistId !== undefined && {
      ...(psychologistId
        ? { psychologist: { connect: { id: psychologistId } } }
        : { psychologist: { disconnect: true } }),
    }),
  };

  const updatedPatient = await prisma.$transaction(async (tx) => {
    if (Object.keys(dataToUpdate).length > 0) {
      await tx.patient.update({
        where: { id },
        data: dataToUpdate,
      });
    }

    if (intakeInfo !== undefined) {
      await validatePatientIntakeSelections(tx, intakeInfo.selections);
      await upsertPatientIntakeInfo(tx, id, intakeInfo);
    }

    if (consents !== undefined) {
      await replacePatientConsents(tx, id, consents);
    }

    const updatedPatient = await tx.patient.findUnique({
      where: { id },
      include: {
        district: { select: { name: true } },
        ...includeCreatedPatient,
      },
    });

    if (!updatedPatient) {
      throw new AppError("Error obteniendo el paciente actualizado", 500);
    }

    return formatPatientResponse(updatedPatient);
  });

  return updatedPatient;
};

export const getMyPatientListService = async ({
  params,
  query,
}: GetMyPatientListInput) => {
  const { page, take } = query;
  const { dni, firstname, lastname } = query;
  const { psychologistId } = params;

  const whereClause: Prisma.PatientWhereInput = {
    appointments: {
      some: {
        userId: psychologistId,
      },
    },
    ...buildPatientSearchWhere({
      dni,
      firstname,
      lastname,
    }),
  };

  const patientsDB = await prisma.patient.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      clinicalHistory: { select: { id: true } },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.patient.count({
      where: whereClause,
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    patients: patientsDB,
  };
};

export const getPatientsForExcelService = async () => {
  return prisma.patient.findMany({
    select: {
      firstName: true,
      lastName: true,
      dni: true,
      gender: true,
      birthdate: true,
      educationLevel: true,
      birthPlace: true,
      occupation: true,
      address: true,
      maritalStatus: true,
      religion: true,
      occupationLocation: true,
      phoneNumber: true,
      parentFullName: true,
      parentDni: true,
      parentPhoneNumber: true,
    },
    orderBy: {
      lastName: "asc",
    },
  });
};
