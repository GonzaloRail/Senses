import prisma from "../lib/prisma";
import { encryptPassword } from "../common/utils";
import {
  RoleType,
  DocumentType,
  WeekDay,
  Gender,
  MaritalStatus,
  AppointmentStatus,
} from "@prisma/client";

//Crear EmployeeLeave con documentos
async function createLeaveWithDocument(
  userId: string,
  reason: string,
  documentName: string,
  fileUrl: string,
  startDate: Date,
  endDate: Date
) {
  const leave = await prisma.employeeLeave.create({
    data: {
      userId,
      startDate,
      endDate,
      reason,
    },
  });

  await prisma.document.create({
    data: {
      name: documentName,
      type: DocumentType.USER_DOCS,
      fileUrl,
      employeeLeaveId: leave.id,
    },
  });
}

async function main() {
  console.log("Starting full database seed...");

  // LIMPIEZA INICIAL (deleteMany)
  await prisma.formSubmission.deleteMany();
  await prisma.formTemplate.deleteMany();
  await prisma.patientTest.deleteMany();
  await prisma.test.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.clinicalHistory.deleteMany();
  await prisma.employeeLeave.deleteMany();
  await prisma.document.deleteMany(); // ahora sí se puede borrar todo completo
  await prisma.workSchedule.deleteMany();
  await prisma.itemInstance.deleteMany();
  await prisma.item.deleteMany();
  await prisma.office.deleteMany();
  await prisma.location.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // ARRAYS DE DATOS ESTÁTICOS (tipado correcto con RoleType)
  const roles: { name: RoleType }[] = [
    { name: RoleType.ADMIN },
    { name: RoleType.ADMISSION },
    { name: RoleType.PSYCHOLOGIST },
    { name: RoleType.INTERNAL },
  ];

  await prisma.role.createMany({ data: roles });

  // Consultar roles creados para obtener sus IDs
  const rolesInDb = await prisma.role.findMany();

  const roleAdmin = rolesInDb.find((role) => role.name === RoleType.ADMIN);
  const roleAdmission = rolesInDb.find(
    (role) => role.name === RoleType.ADMISSION
  );
  const rolePsychologist = rolesInDb.find(
    (role) => role.name === RoleType.PSYCHOLOGIST
  );
  const roleInternal = rolesInDb.find(
    (role) => role.name === RoleType.INTERNAL
  );

  // Crear usuarios (con la contraseña encriptada)
  const password = await encryptPassword("sensespass");

  const userAdmin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      dni: "00000001",
      email: "admin@gmail.com",
      password: password,
      isActive: true,
    },
  });

  const userAdmission = await prisma.user.create({
    data: {
      firstName: "Admission",
      lastName: "User",
      dni: "00000002",
      email: "admission@gmail.com",
      password: password,
      isActive: true,
    },
  });

  const userPsychologist = await prisma.user.create({
    data: {
      firstName: "Psychologist",
      lastName: "User",
      dni: "00000003",
      email: "psychologist@gmail.com",
      password: password,
      isActive: true,
    },
  });

  const userInternal = await prisma.user.create({
    data: {
      firstName: "Internal",
      lastName: "User",
      dni: "00000004",
      email: "internal@gmail.com",
      password: password,
      psychologistId: userPsychologist.id,
      isActive: true,
    },
  });

  //vincular
  await prisma.userRole.createMany({
    data: [
      { userId: userAdmin.id, roleId: roleAdmin!.id },
      { userId: userAdmission.id, roleId: roleAdmission!.id },
      { userId: userPsychologist.id, roleId: rolePsychologist!.id },
      { userId: userInternal.id, roleId: roleInternal!.id },
    ],
  });
  console.log("Seed User,Role,UserRol completado correctamente");

  // Crear Evaluations
  const evaluation1 = await prisma.evaluation.create({
    data: {
      name: "Evaluación tipo 1",
      description: "Evaluación general de ansiedad",
      createdById: userAdmin.id,
    },
  });

  const evaluation2 = await prisma.evaluation.create({
    data: {
      name: "Evaluación tipo 2",
      description: "Evaluación general de estrés",
      createdById: userAdmin.id,
    },
  });

  // Crear los documentos tipo TEMPLATE
  const document1 = await prisma.document.create({
    data: {
      name: "template1.pdf",
      type: DocumentType.TEMPLATE,
      fileUrl: "https://example.com/template1.pdf",
    },
  });

  const document2 = await prisma.document.create({
    data: {
      name: "template2.pdf",
      type: DocumentType.TEMPLATE,
      fileUrl: "https://example.com/template2.pdf",
    },
  });

  const document3 = await prisma.document.create({
    data: {
      name: "template3.pdf",
      type: DocumentType.TEMPLATE,
      fileUrl: "https://example.com/template3.pdf",
    },
  });

  const document4 = await prisma.document.create({
    data: {
      name: "template4.pdf",
      type: DocumentType.TEMPLATE,
      fileUrl: "https://example.com/template4.pdf",
    },
  });

  const test1 = await prisma.test.create({
    data: {
      name: "Test tipo 1",
      description: "Test plantilla tipo 1",
      evaluationId: evaluation1.id,
      document: { connect: { id: document1.id } },
      createdById: userAdmin.id,
    },
  });

  const test2 = await prisma.test.create({
    data: {
      name: "Test tipo 2",
      description: "Test plantilla tipo 2",
      evaluationId: evaluation1.id,
      document: { connect: { id: document2.id } },
      createdById: userAdmin.id,
    },
  });

  const test3 = await prisma.test.create({
    data: {
      name: "Test tipo 3",
      description: "Test plantilla tipo 3",
      evaluationId: evaluation2.id,
      document: { connect: { id: document3.id } },
      createdById: userAdmin.id,
    },
  });

  const test4 = await prisma.test.create({
    data: {
      name: "Test tipo 4",
      description: "Test plantilla tipo 4",
      evaluationId: evaluation2.id,
      document: { connect: { id: document4.id } },
      createdById: userAdmin.id,
    },
  });

  // EMPLOYEELEAVE — crear 2 licencias para cada usuario

  await prisma.employeeLeave.createMany({
    data: [
      {
        userId: userAdmin.id,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-10"),
        reason: "Vacaciones Admin 1",
      },
      {
        userId: userAdmin.id,
        startDate: new Date("2024-01-20"),
        endDate: new Date("2024-01-30"),
        reason: "Vacaciones Admin 2",
      },

      {
        userId: userAdmission.id,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-10"),
        reason: "Vacaciones Admission 1",
      },
      {
        userId: userAdmission.id,
        startDate: new Date("2024-02-20"),
        endDate: new Date("2024-02-28"),
        reason: "Vacaciones Admission 2",
      },

      {
        userId: userPsychologist.id,
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-03-10"),
        reason: "Vacaciones Psychologist 1",
      },
      {
        userId: userPsychologist.id,
        startDate: new Date("2024-03-20"),
        endDate: new Date("2024-03-30"),
        reason: "Vacaciones Psychologist 2",
      },

      {
        userId: userInternal.id,
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-04-10"),
        reason: "Vacaciones Internal 1",
      },
      {
        userId: userInternal.id,
        startDate: new Date("2024-04-20"),
        endDate: new Date("2024-04-30"),
        reason: "Vacaciones Internal 2",
      },
    ],
  });

  console.log("EmployeeLeaves creados correctamente");

  // DOCUMENTS — crear 2 documentos por cada usuario

  await prisma.document.createMany({
    data: [
      // Admin
      {
        userId: userAdmin.id,
        name: "Documento Admin 1",
        type: DocumentType.USER_DOCS,
        fileUrl: "https://example.com/admin-doc1.pdf",
      },
      {
        userId: userAdmin.id,
        name: "Documento Admin 2",
        type: DocumentType.USER_DOCS,
        fileUrl: "https://example.com/admin-doc2.pdf",
      },

      // Admission
      {
        userId: userAdmission.id,
        name: "Documento Admission 1",
        type: DocumentType.USER_DOCS,
        fileUrl: "https://example.com/admission-doc1.pdf",
      },
      {
        userId: userAdmission.id,
        name: "Documento Admission 2",
        type: DocumentType.USER_DOCS,
        fileUrl: "https://example.com/admission-doc2.pdf",
      },

      // Psychologist
      {
        userId: userPsychologist.id,
        name: "Documento Psychologist 1",
        type: DocumentType.USER_DOCS,
        fileUrl: "https://example.com/psychologist-doc1.pdf",
      },
      {
        userId: userPsychologist.id,
        name: "Documento Psychologist 2",
        type: DocumentType.USER_DOCS,
        fileUrl: "https://example.com/psychologist-doc2.pdf",
      },

      // Internal
      {
        userId: userInternal.id,
        name: "Documento Internal 1",
        type: DocumentType.USER_DOCS,
        fileUrl: "https://example.com/internal-doc1.pdf",
      },
      {
        userId: userInternal.id,
        name: "Documento Internal 2",
        type: DocumentType.USER_DOCS,
        fileUrl: "https://example.com/internal-doc2.pdf",
      },
    ],
  });

  console.log("Documents creados correctamente");

  // Licencia con documentos
  await createLeaveWithDocument(
    userPsychologist.id,
    "Licencia adicional Psychologist",
    "Documento licencia Psychologist",
    "https://example.com/licencia-psychologist.pdf",
    new Date("2024-06-01"),
    new Date("2024-06-10")
  );

  await createLeaveWithDocument(
    userAdmin.id,
    "Licencia adicional Admin",
    "Documento licencia Admin",
    "https://example.com/licencia-admin.pdf",
    new Date("2024-07-01"),
    new Date("2024-07-10")
  );

  // LOCATIONS — Crear sedes asociadas a distritos existentes

  // Obtenemos 2 distritos de prueba (tú puedes cambiar la cantidad si quieres)
  const districts = await prisma.district.findMany({ take: 2 });

  if (districts.length < 2) {
    throw new Error(
      "No hay suficientes distritos en la base de datos para crear Locations."
    );
  }

  const location1 = await prisma.location.create({
    data: {
      name: "Sede Central",
      address: "Av. Principal 123",
      isActive: true,
      districtId: districts[0].id,
    },
  });

  const location2 = await prisma.location.create({
    data: {
      name: "Sede Secundaria",
      address: "Av. Secundaria 456",
      isActive: true,
      districtId: districts[1].id,
    },
  });

  console.log("Locations creadas correctamente");

  // OFFICES — Crear oficinas para cada Location

  const office1_loc1 = await prisma.office.create({
    data: {
      name: "Consultorio 101",
      type: "Psicología",
      capacity: 5,
      isActive: true,
      locationId: location1.id,
    },
  });

  const office2_loc1 = await prisma.office.create({
    data: {
      name: "Consultorio 102",
      type: "Admisión",
      capacity: 3,
      isActive: true,
      locationId: location1.id,
    },
  });

  const office1_loc2 = await prisma.office.create({
    data: {
      name: "Consultorio 201",
      type: "Psicología",
      capacity: 6,
      isActive: true,
      locationId: location2.id,
    },
  });

  const office2_loc2 = await prisma.office.create({
    data: {
      name: "Consultorio 202",
      type: "Admisión",
      capacity: 4,
      isActive: true,
      locationId: location2.id,
    },
  });

  console.log("Offices creadas correctamente");

  // ITEMS — Crear items generales (ajustado a Computadora y Escritorio)

  const item1 = await prisma.item.create({
    data: {
      name: "Computadora",
      quantity: 2,
      description: "Computadoras de escritorio básicas",
      isActive: true,
    },
  });

  const item2 = await prisma.item.create({
    data: {
      name: "Escritorio",
      quantity: 1,
      description: "Escritorio 120x60 cm",
      isActive: true,
    },
  });

  console.log("Items creados correctamente");

  // ITEMINSTANCES — Crear instancias de los items en cada oficina

  const offices = [office1_loc1, office2_loc1, office1_loc2, office2_loc2];

  const itemInstances = await prisma.itemInstance.createMany({
    data: [
      {
        itemId: item1.id,
      },
      {
        itemId: item1.id,
      },
      {
        itemId: item2.id,
      },
    ],
  });

  console.log("ItemInstances creados correctamente");

  // WORKSCHEDULE — Crear horarios de trabajo por usuario y oficina

  await prisma.workSchedule.createMany({
    data: [
      // Admin
      {
        userId: userAdmin.id,
        officeId: office1_loc1.id,
        day: WeekDay.MONDAY,
        startTime: new Date("2024-06-03T08:00:00"),
        endTime: new Date("2024-06-03T12:00:00"),
      },
      {
        userId: userAdmin.id,
        officeId: office2_loc1.id,
        day: WeekDay.WEDNESDAY,
        startTime: new Date("2024-06-05T13:00:00"),
        endTime: new Date("2024-06-05T17:00:00"),
      },

      // Admission
      {
        userId: userAdmission.id,
        officeId: office1_loc2.id,
        day: WeekDay.TUESDAY,
        startTime: new Date("2024-06-04T08:00:00"),
        endTime: new Date("2024-06-04T12:00:00"),
      },
      {
        userId: userAdmission.id,
        officeId: office2_loc2.id,
        day: WeekDay.THURSDAY,
        startTime: new Date("2024-06-06T13:00:00"),
        endTime: new Date("2024-06-06T17:00:00"),
      },

      // Psychologist
      {
        userId: userPsychologist.id,
        officeId: office1_loc1.id,
        day: WeekDay.FRIDAY,
        startTime: new Date("2024-06-07T06:00:00"),
        endTime: new Date("2024-06-07T23:00:00"),
      },
      {
        userId: userPsychologist.id,
        officeId: office2_loc2.id,
        day: WeekDay.MONDAY,
        startTime: new Date("2024-06-03T06:00:00"),
        endTime: new Date("2024-06-03T23:00:00"),
      },

      // Internal
      {
        userId: userInternal.id,
        officeId: office1_loc2.id,
        day: WeekDay.TUESDAY,
        startTime: new Date("2024-06-04T08:00:00"),
        endTime: new Date("2024-06-04T12:00:00"),
      },
      {
        userId: userInternal.id,
        officeId: office2_loc1.id,
        day: WeekDay.WEDNESDAY,
        startTime: new Date("2024-06-05T13:00:00"),
        endTime: new Date("2024-06-05T17:00:00"),
      },
    ],
  });

  console.log("WorkSchedules creados correctamente");

  // CLINICALHISTORY — Crear historias clínicas

  const clinicalHistory1 = await prisma.clinicalHistory.create({
    data: {},
  });

  const clinicalHistory2 = await prisma.clinicalHistory.create({
    data: {},
  });

  const clinicalHistory3 = await prisma.clinicalHistory.create({
    data: {},
  });

  const clinicalHistory4 = await prisma.clinicalHistory.create({
    data: {},
  });

  console.log("ClinicalHistories creadas correctamente");

  // PATIENTS — Crear pacientes

  const patient1 = await prisma.patient.create({
    data: {
      firstName: "Juan",
      lastName: "Pérez",
      dni: "11111111",
      gender: Gender.MALE,
      birthdate: new Date("1990-05-15"),
      educationLevel: "Universitario",
      birthPlace: "Lima",
      occupation: "Ingeniero",
      maritalStatus: MaritalStatus.SINGLE,
      religion: "Católico",
      occupationLocation: "San Isidro",
      phoneNumber: "999111111",
      parentFullName: "Pedro Pérez",
      parentDni: "22222222",
      parentPhoneNumber: "999222222",
      districtId: districts[0].id,
      psychologistId: userPsychologist.id,
      clinicalHistoryId: clinicalHistory1.id,
      address: "Av. Independencia 001",
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      firstName: "María",
      lastName: "Gómez",
      dni: "33333333",
      gender: Gender.FEMALE,
      birthdate: new Date("1985-08-22"),
      educationLevel: "Maestría",
      birthPlace: "Arequipa",
      occupation: "Abogada",
      maritalStatus: MaritalStatus.MARRIED,
      religion: "Cristiana",
      occupationLocation: "Miraflores",
      phoneNumber: "999333333",
      parentFullName: "Josefa Gómez",
      parentDni: "44444444",
      parentPhoneNumber: "999444444",
      districtId: districts[1].id,
      psychologistId: userPsychologist.id,
      clinicalHistoryId: clinicalHistory2.id,
      address: "Av. Independencia 002",
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      firstName: "Luis",
      lastName: "Ramírez",
      dni: "55555555",
      gender: Gender.MALE,
      birthdate: new Date("1995-02-10"),
      educationLevel: "Secundaria",
      birthPlace: "Cusco",
      occupation: "Estudiante",
      maritalStatus: MaritalStatus.SINGLE,
      religion: null,
      occupationLocation: "Surco",
      phoneNumber: "999555555",
      parentFullName: "Carlos Ramírez",
      parentDni: "66666666",
      parentPhoneNumber: "999666666",
      districtId: districts[0].id,
      psychologistId: userPsychologist.id,
      clinicalHistoryId: clinicalHistory3.id,
      address: "Av. Independencia 003",
    },
  });

  const patient4 = await prisma.patient.create({
    data: {
      firstName: "Ana",
      lastName: "Lopez",
      dni: "77777777",
      gender: Gender.FEMALE,
      birthdate: new Date("1992-11-03"),
      educationLevel: "Doctorado",
      birthPlace: "Piura",
      occupation: "Docente",
      maritalStatus: MaritalStatus.SINGLE,
      religion: "Católica",
      occupationLocation: "San Borja",
      phoneNumber: "999777777",
      parentFullName: "Luis Lopez",
      parentDni: "88888888",
      parentPhoneNumber: "999888888",
      districtId: districts[1].id,
      psychologistId: userPsychologist.id,
      clinicalHistoryId: clinicalHistory4.id,
      address: "Av. Independencia 004",
    },
  });

  console.log("Patients creados correctamente");

  //Crear PatientTests
  const patients = [patient1, patient2, patient3, patient4];
  // Paciente 1 (dos tests)
  await prisma.patientTest.create({
    data: {
      testId: test1.id,
      clinicalHistoryId: patients[0].clinicalHistoryId,
      completedById: userPsychologist.id,
      isGeneralDoc: true,
      document: {
        create: {
          name: "Evaluación Aplicada Tipo 1",
          type: DocumentType.EVALUATION_TEST,
          fileUrl: "https://example.com/patienttest1.pdf",
        },
      },
    },
  });

  await prisma.patientTest.create({
    data: {
      testId: test2.id,
      clinicalHistoryId: patients[0].clinicalHistoryId,
      completedById: userPsychologist.id,
      document: {
        create: {
          name: "Evaluación Aplicada Tipo 2",
          type: DocumentType.EVALUATION_TEST,
          fileUrl: "https://example.com/patienttest2.pdf",
        },
      },
    },
  });

  // Paciente 2 (dos tests)
  await prisma.patientTest.create({
    data: {
      testId: test1.id,
      clinicalHistoryId: patients[1].clinicalHistoryId,
      completedById: userPsychologist.id,
      document: {
        create: {
          name: "Evaluación Aplicada Tipo 1",
          type: DocumentType.EVALUATION_TEST,
          fileUrl: "https://example.com/patienttest3.pdf",
        },
      },
    },
  });

  await prisma.patientTest.create({
    data: {
      testId: test2.id,
      clinicalHistoryId: patients[1].clinicalHistoryId,
      completedById: userPsychologist.id,
      isGeneralDoc: true,
      document: {
        create: {
          name: "Evaluación Aplicada Tipo 2",
          type: DocumentType.EVALUATION_TEST,
          fileUrl: "https://example.com/patienttest4.pdf",
        },
      },
    },
  });

  // Paciente 3 (dos tests)
  await prisma.patientTest.create({
    data: {
      testId: test3.id,
      clinicalHistoryId: patients[2].clinicalHistoryId,
      completedById: userPsychologist.id,
      document: {
        create: {
          name: "Evaluación Aplicada Tipo 3",
          type: DocumentType.EVALUATION_TEST,
          fileUrl: "https://example.com/patienttest5.pdf",
        },
      },
    },
  });

  // APPOINTMENTS — Crear citas para los pacientes

  await prisma.appointment.createMany({
    data: [
      // Paciente 1
      {
        patientId: patient1.id,
        userId: userPsychologist.id,
        officeId: office1_loc1.id,
        startDate: new Date("2024-06-10T08:00:00"),
        endDate: new Date("2024-06-10T09:00:00"),
        reason: "Consulta inicial",
        status: AppointmentStatus.PENDING,
      },
      {
        patientId: patient1.id,
        userId: userPsychologist.id,
        officeId: office2_loc1.id,
        startDate: new Date("2024-06-17T08:00:00"),
        endDate: new Date("2024-06-17T09:00:00"),
        reason: "Seguimiento mensual",
        status: AppointmentStatus.PENDING,
      },

      // Paciente 2
      {
        patientId: patient2.id,
        userId: userPsychologist.id,
        officeId: office1_loc2.id,
        startDate: new Date("2024-06-11T08:00:00"),
        endDate: new Date("2024-06-11T09:00:00"),
        reason: "Consulta inicial",
        status: AppointmentStatus.PENDING,
      },
      {
        patientId: patient2.id,
        userId: userPsychologist.id,
        officeId: office2_loc2.id,
        startDate: new Date("2024-06-18T08:00:00"),
        endDate: new Date("2024-06-18T09:00:00"),
        reason: "Seguimiento mensual",
        status: AppointmentStatus.PENDING,
      },

      // Paciente 3
      {
        patientId: patient3.id,
        userId: userPsychologist.id,
        officeId: office1_loc1.id,
        startDate: new Date("2024-06-12T08:00:00"),
        endDate: new Date("2024-06-12T09:00:00"),
        reason: "Consulta inicial",
        status: AppointmentStatus.PENDING,
      },
      {
        patientId: patient3.id,
        userId: userPsychologist.id,
        officeId: office2_loc1.id,
        startDate: new Date("2024-06-19T08:00:00"),
        endDate: new Date("2024-06-19T09:00:00"),
        reason: "Seguimiento mensual",
        status: AppointmentStatus.PENDING,
      },

      // Paciente 4
      {
        patientId: patient4.id,
        userId: userPsychologist.id,
        officeId: office1_loc2.id,
        startDate: new Date("2024-06-13T08:00:00"),
        endDate: new Date("2024-06-13T09:00:00"),
        reason: "Consulta inicial",
        status: AppointmentStatus.PENDING,
      },
      {
        patientId: patient4.id,
        userId: userPsychologist.id,
        officeId: office2_loc2.id,
        startDate: new Date("2024-06-20T08:00:00"),
        endDate: new Date("2024-06-20T09:00:00"),
        reason: "Seguimiento mensual",
        status: AppointmentStatus.PENDING,
      },
    ],
  });

  console.log("Appointments creados correctamente");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
