import ExcelJS from "exceljs";
import { PatientExcel } from "../../interfaces/Patient"

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

export const generatePatientExcel = async (patients: PatientExcel[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Pacientes");

  worksheet.columns = [
    { header: "Nombre", key: "firstName", width: 20 },
    { header: "Apellido", key: "lastName", width: 20 },
    { header: "DNI", key: "dni", width: 15 },
    { header: "Género", key: "gender", width: 15 },
    { header: "Fecha de nacimiento", key: "birthdate", width: 20 },
    { header: "Nivel educativo", key: "educationLevel", width: 20 },
    { header: "Lugar de nacimiento", key: "birthPlace", width: 20 },
    { header: "Ocupación", key: "occupation", width: 20 },
    { header: "Dirección", key: "address", width: 30 },
    { header: "Estado civil", key: "maritalStatus", width: 20 },
    { header: "Religión", key: "religion", width: 20 },
    { header: "Lugar de trabajo", key: "occupationLocation", width: 25 },
    { header: "Teléfono", key: "phoneNumber", width: 15 },
    { header: "Nombre del apoderado", key: "parentFullName", width: 25 },
    { header: "DNI del apoderado", key: "parentDni", width: 20 },
    { header: "Teléfono del apoderado", key: "parentPhoneNumber", width: 20 },
  ];

  patients.forEach((p: PatientExcel) => {
    worksheet.addRow({
      firstName: p.firstName,
      lastName: p.lastName,
      dni: p.dni,
      gender: genderMap[p.gender],
      birthdate: p.birthdate.toLocaleDateString("es-PE"),
      educationLevel: p.educationLevel,
      birthPlace: p.birthPlace,
      occupation: p.occupation,
      address: p.address,
      maritalStatus: maritalStatusMap[p.maritalStatus],
      religion: p.religion ?? "—",
      occupationLocation: p.occupationLocation,
      phoneNumber: p.phoneNumber,
      parentFullName: p.parentFullName ?? "—",
      parentDni: p.parentDni ?? "—",
      parentPhoneNumber: p.parentPhoneNumber ?? "—",
    });
  });

  // Encabezados en negrita
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0B2035' } };

  return workbook;
};