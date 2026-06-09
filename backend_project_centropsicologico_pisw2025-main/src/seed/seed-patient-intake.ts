import { IntakeSelectionType } from "@prisma/client";
import prisma from "../lib/prisma";

const incomeRanges = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    label: "Menos de S/ 1025",
    minAmount: null,
    maxAmount: 1025,
    sortOrder: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    label: "S/ 1025 - S/ 1500",
    minAmount: 1025,
    maxAmount: 1500,
    sortOrder: 2,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    label: "S/ 1501 - S/ 2500",
    minAmount: 1501,
    maxAmount: 2500,
    sortOrder: 3,
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    label: "S/ 2501 - S/ 4000",
    minAmount: 2501,
    maxAmount: 4000,
    sortOrder: 4,
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    label: "Mas de S/ 4000",
    minAmount: 4000,
    maxAmount: null,
    sortOrder: 5,
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    label: "Prefiere no decirlo",
    minAmount: null,
    maxAmount: null,
    sortOrder: 6,
  },
];

const optionGroups = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    code: "ACQUISITION_SOURCE",
    name: "Como nos conocio",
    selectionType: IntakeSelectionType.MULTIPLE,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    code: "PREFERRED_MODALITY",
    name: "Modalidad preferida",
    selectionType: IntakeSelectionType.SINGLE,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    code: "PREFERRED_SCHEDULE",
    name: "Horario preferido",
    selectionType: IntakeSelectionType.MULTIPLE,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    code: "PAYMENT_METHOD",
    name: "Metodo de pago preferido",
    selectionType: IntakeSelectionType.MULTIPLE,
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    code: "URGENCY_LEVEL",
    name: "Nivel de urgencia percibida",
    selectionType: IntakeSelectionType.SINGLE,
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    code: "CONTACT_METHOD",
    name: "Medio preferido de contacto",
    selectionType: IntakeSelectionType.MULTIPLE,
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    code: "EMPLOYMENT_STATUS",
    name: "Situacion laboral",
    selectionType: IntakeSelectionType.SINGLE,
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    code: "WORK_MODE",
    name: "Modo de trabajo",
    selectionType: IntakeSelectionType.SINGLE,
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    code: "REQUIRED_SPECIALTY",
    name: "Especialidad requerida",
    selectionType: IntakeSelectionType.MULTIPLE,
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    code: "CONSULTATION_REASON_CATEGORY",
    name: "Motivo de consulta categorizado",
    selectionType: IntakeSelectionType.MULTIPLE,
  },
];

const optionId = (order: number) =>
  `20000000-0000-4000-8000-${order.toString().padStart(12, "0")}`;

const options = [
  {
    id: optionId(1),
    groupId: optionGroups[0].id,
    code: "GOOGLE",
    name: "Google",
    category: "SEARCH_ENGINE",
    sortOrder: 1,
  },
  {
    id: optionId(2),
    groupId: optionGroups[0].id,
    code: "INSTAGRAM",
    name: "Instagram",
    category: "SOCIAL_MEDIA",
    sortOrder: 2,
  },
  {
    id: optionId(3),
    groupId: optionGroups[0].id,
    code: "FACEBOOK",
    name: "Facebook",
    category: "SOCIAL_MEDIA",
    sortOrder: 3,
  },
  {
    id: optionId(4),
    groupId: optionGroups[0].id,
    code: "TIKTOK",
    name: "TikTok",
    category: "SOCIAL_MEDIA",
    sortOrder: 4,
  },
  {
    id: optionId(5),
    groupId: optionGroups[0].id,
    code: "REFERRAL",
    name: "Recomendacion",
    category: "REFERRAL",
    sortOrder: 5,
  },
  {
    id: optionId(6),
    groupId: optionGroups[0].id,
    code: "FLYER",
    name: "Volante",
    category: "OFFLINE",
    sortOrder: 6,
  },
  {
    id: optionId(7),
    groupId: optionGroups[0].id,
    code: "AGREEMENT",
    name: "Convenio",
    category: "PARTNERSHIP",
    sortOrder: 7,
  },
  {
    id: optionId(8),
    groupId: optionGroups[0].id,
    code: "OTHER",
    name: "Otro",
    category: "OTHER",
    sortOrder: 99,
  },
  {
    id: optionId(9),
    groupId: optionGroups[1].id,
    code: "VIRTUAL",
    name: "Virtual",
    sortOrder: 1,
  },
  {
    id: optionId(10),
    groupId: optionGroups[1].id,
    code: "IN_PERSON",
    name: "Presencial",
    sortOrder: 2,
  },
  {
    id: optionId(11),
    groupId: optionGroups[1].id,
    code: "MIXED",
    name: "Mixta",
    sortOrder: 3,
  },
  {
    id: optionId(12),
    groupId: optionGroups[2].id,
    code: "MORNING",
    name: "Manana",
    sortOrder: 1,
  },
  {
    id: optionId(13),
    groupId: optionGroups[2].id,
    code: "AFTERNOON",
    name: "Tarde",
    sortOrder: 2,
  },
  {
    id: optionId(14),
    groupId: optionGroups[2].id,
    code: "NIGHT",
    name: "Noche",
    sortOrder: 3,
  },
  {
    id: optionId(15),
    groupId: optionGroups[2].id,
    code: "WEEKEND",
    name: "Fin de semana",
    sortOrder: 4,
  },
  {
    id: optionId(16),
    groupId: optionGroups[3].id,
    code: "CASH",
    name: "Efectivo",
    sortOrder: 1,
  },
  {
    id: optionId(17),
    groupId: optionGroups[3].id,
    code: "CARD",
    name: "Tarjeta",
    sortOrder: 2,
  },
  {
    id: optionId(18),
    groupId: optionGroups[3].id,
    code: "TRANSFER",
    name: "Transferencia bancaria",
    sortOrder: 3,
  },
  {
    id: optionId(19),
    groupId: optionGroups[3].id,
    code: "YAPE",
    name: "Yape",
    sortOrder: 4,
  },
  {
    id: optionId(20),
    groupId: optionGroups[3].id,
    code: "PLIN",
    name: "Plin",
    sortOrder: 5,
  },
  {
    id: optionId(21),
    groupId: optionGroups[4].id,
    code: "LOW",
    name: "Baja",
    sortOrder: 1,
  },
  {
    id: optionId(22),
    groupId: optionGroups[4].id,
    code: "MEDIUM",
    name: "Media",
    sortOrder: 2,
  },
  {
    id: optionId(23),
    groupId: optionGroups[4].id,
    code: "HIGH",
    name: "Alta",
    sortOrder: 3,
  },
  {
    id: optionId(24),
    groupId: optionGroups[4].id,
    code: "CRITICAL",
    name: "Critica / Emergencia",
    sortOrder: 4,
  },
  {
    id: optionId(25),
    groupId: optionGroups[5].id,
    code: "WHATSAPP",
    name: "WhatsApp",
    sortOrder: 1,
  },
  {
    id: optionId(26),
    groupId: optionGroups[5].id,
    code: "PHONE",
    name: "Llamada telefonica",
    sortOrder: 2,
  },
  {
    id: optionId(27),
    groupId: optionGroups[5].id,
    code: "EMAIL",
    name: "Correo electronico",
    sortOrder: 3,
  },
  {
    id: optionId(28),
    groupId: optionGroups[6].id,
    code: "UNEMPLOYED",
    name: "Sin trabajo",
    sortOrder: 1,
  },
  {
    id: optionId(29),
    groupId: optionGroups[6].id,
    code: "EMPLOYED",
    name: "Con trabajo",
    sortOrder: 2,
  },
  {
    id: optionId(30),
    groupId: optionGroups[6].id,
    code: "SELF_EMPLOYED",
    name: "Independiente",
    sortOrder: 3,
  },
  {
    id: optionId(31),
    groupId: optionGroups[6].id,
    code: "STUDENT",
    name: "Estudiante",
    sortOrder: 4,
  },
  {
    id: optionId(32),
    groupId: optionGroups[7].id,
    code: "REMOTE",
    name: "Remoto",
    sortOrder: 1,
  },
  {
    id: optionId(33),
    groupId: optionGroups[7].id,
    code: "IN_PERSON",
    name: "Presencial",
    sortOrder: 2,
  },
  {
    id: optionId(34),
    groupId: optionGroups[7].id,
    code: "MIXED",
    name: "Mixto",
    sortOrder: 3,
  },
  {
    id: optionId(35),
    groupId: optionGroups[8].id,
    code: "ANXIETY",
    name: "Ansiedad",
    sortOrder: 1,
  },
  {
    id: optionId(36),
    groupId: optionGroups[8].id,
    code: "DEPRESSION",
    name: "Depresion",
    sortOrder: 2,
  },
  {
    id: optionId(37),
    groupId: optionGroups[8].id,
    code: "COUPLES_THERAPY",
    name: "Terapia de pareja",
    sortOrder: 3,
  },
  {
    id: optionId(38),
    groupId: optionGroups[9].id,
    code: "ANXIETY",
    name: "Ansiedad",
    sortOrder: 1,
  },
  {
    id: optionId(39),
    groupId: optionGroups[9].id,
    code: "DEPRESSION",
    name: "Depresion",
    sortOrder: 2,
  },
  {
    id: optionId(40),
    groupId: optionGroups[9].id,
    code: "RELATIONSHIP",
    name: "Relaciones familiares o pareja",
    sortOrder: 3,
  },
  {
    id: optionId(41),
    groupId: optionGroups[8].id,
    code: "FAMILY_THERAPY",
    name: "Terapia familiar",
    sortOrder: 4,
  },
  {
    id: optionId(42),
    groupId: optionGroups[8].id,
    code: "CHILD_PSYCHOLOGY",
    name: "Psicologia infantil",
    sortOrder: 5,
  },
  {
    id: optionId(43),
    groupId: optionGroups[8].id,
    code: "PSYCHOLOGICAL_EVALUATION",
    name: "Evaluacion psicologica",
    sortOrder: 6,
  },
  {
    id: optionId(44),
    groupId: optionGroups[8].id,
    code: "VOCATIONAL_GUIDANCE",
    name: "Orientacion vocacional",
    sortOrder: 7,
  },
  {
    id: optionId(45),
    groupId: optionGroups[8].id,
    code: "OTHER",
    name: "Otro",
    sortOrder: 99,
  },
  {
    id: optionId(46),
    groupId: optionGroups[6].id,
    code: "RETIRED",
    name: "Jubilado/a",
    sortOrder: 5,
  },
  {
    id: optionId(47),
    groupId: optionGroups[7].id,
    code: "NOT_APPLICABLE",
    name: "No aplica",
    sortOrder: 4,
  },
];

const consentTypes = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    code: "PERSONAL_DATA",
    name: "Tratamiento de datos personales",
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    code: "MARKETING",
    name: "Contenido psicologico y promociones",
  },
];

export async function seedPatientIntakeCatalog() {
  for (const incomeRange of incomeRanges) {
    await prisma.incomeRange.upsert({
      where: { id: incomeRange.id },
      update: { ...incomeRange, isActive: true },
      create: { ...incomeRange, isActive: true },
    });
  }

  for (const group of optionGroups) {
    await prisma.intakeOptionGroup.upsert({
      where: { code: group.code },
      update: {
        name: group.name,
        selectionType: group.selectionType,
        isActive: true,
      },
      create: { ...group, isActive: true },
    });
  }

  for (const option of options) {
    await prisma.intakeOption.upsert({
      where: { id: option.id },
      update: {
        groupId: option.groupId,
        code: option.code,
        name: option.name,
        category: option.category,
        sortOrder: option.sortOrder,
        isActive: true,
      },
      create: { ...option, isActive: true },
    });
  }

  for (const consentType of consentTypes) {
    await prisma.consentType.upsert({
      where: { code: consentType.code },
      update: {
        name: consentType.name,
        isActive: true,
      },
      create: { ...consentType, isActive: true },
    });
  }
}

async function main() {
  await seedPatientIntakeCatalog();
  console.log("Patient intake catalog seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
