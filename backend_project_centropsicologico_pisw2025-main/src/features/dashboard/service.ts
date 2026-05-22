import { RoleType, AppointmentStatus, AppointmentType } from "@prisma/client";
import prisma from "../../lib/prisma";
import { startOfMonth, endOfMonth, differenceInYears, startOfWeek, endOfWeek, getISODay } from "date-fns";

export const getTotalPsychologistsService = async () => {
  const count = await prisma.user.count({
    where: {
      isActive: true,
      roles: {
        some: {
          role: {
            name: RoleType.PSYCHOLOGIST,
          },
        },
      },
    },
  });
  console.log("consulta psicologos: ", count)
  return { count };
};

export const getTotalPatientsService = async () => {
  const count = await prisma.patient.count({
    where: { isActive: true },
  });
  return { count };
};

export const getTotalHoursThisMonthService = async () => {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  const appointments = await prisma.appointment.findMany({
    where: {
      status: { not: AppointmentStatus.CANCELED },
      startDate: { gte: start, lte: end },
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  // Sumar duraciones en horas (float)
  const totalMs = appointments.reduce((acc, a) => {
    const s = a.startDate.getTime();
    const e = a.endDate.getTime();
    // proteger contra end < start
    const dur = Math.max(0, e - s);
    return acc + dur;
  }, 0);

  const totalHours = Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100; // 2 decimales
  return { hours: totalHours, appointmentsCount: appointments.length };
};

export const getTotalSocialCasesThisMonthService = async () => {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  const count = await prisma.appointment.count({
    where: {
      type: AppointmentType.SOCIAL,
      status: { not: AppointmentStatus.CANCELED },
      startDate: {
        gte: start,
        lte: end,
      },
    },
  });

  return { count };
};

export const getTotalActiveInternalsService = async () => {
  const count = await prisma.user.count({
    where: {
      isActive: true,
      roles: {
        some: {
          role: {
            name: RoleType.INTERNAL,
          },
        },
      },
    },
  });

  return { count };
};


export const getTotalSocialCasesService = async () => {

  const count = await prisma.appointment.count({
    where: {
      type: AppointmentType.SOCIAL,
      status: { not: AppointmentStatus.CANCELED },
    },
  });

  return { count };
};

export const getTotalParticularCasesService = async () => {
  const count = await prisma.appointment.count({
    where: {
      type: AppointmentType.PARTICULAR,
      status: { not: AppointmentStatus.CANCELED },
    },
  });

  return { count };
};

export const getPatientsCountByAgeGroupsService = async () => {
  const patients = await prisma.patient.findMany({
    where: { isActive: true },
    select: { birthdate: true },
  });

  const groups = [
    { label: "0-15", min: 0, max: 15, value: 0 },
    { label: "16-30", min: 16, max: 30, value: 0 },
    { label: "31-45", min: 31, max: 45, value: 0 },
    { label: "46-60", min: 46, max: 60, value: 0 },
    { label: "61-75", min: 61, max: 75, value: 0 },
    { label: "76-90", min: 76, max: 90, value: 0 },
  ];

  const today = new Date();

  for (const p of patients) {
    if (!p.birthdate) continue;
    const age = differenceInYears(today, p.birthdate);
    const g = groups.find((grp) => age >= grp.min && age <= grp.max);
    if (g) g.value += 1;
  }

  return groups.map((g) => ({ range: g.label, value: g.value }));
};

// Lista de psicólogos con la cantidad de pacientes distintos atendidos en el periodo indicado (por defecto: mes actual) 
export const getPsychologistsWithPatientCountService = async ({
  from,
  to,
}: { from?: Date; to?: Date } = {}) => {
  const start = from ?? startOfMonth(new Date());
  const end = to ?? endOfMonth(new Date());

  // Traer citas no canceladas en el periodo y su psicólogo + patientId
  const appointments = await prisma.appointment.findMany({
    where: {
      status: { not: AppointmentStatus.CANCELED },
      startDate: { gte: start, lte: end },
    },
    select: {
      userId: true,
      patientId: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const map = new Map<string, Set<string>>();
  const usersInfo = new Map<string, { id: string; firstName: string; lastName: string }>();

  for (const a of appointments) {
    usersInfo.set(a.user.id, {
      id: a.user.id,
      firstName: a.user.firstName,
      lastName: a.user.lastName,
    });
    if (!map.has(a.userId)) map.set(a.userId, new Set());
    map.get(a.userId)!.add(a.patientId);
  }

  const result = Array.from(usersInfo.values()).map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    patientNumber: map.get(u.id)?.size ?? 0,
  }));

  // ordenar por patientNumber descendente
  result.sort((a, b) => b.patientNumber - a.patientNumber);
  console.log("result", result)

  return result;
};

// Cantidad de citas por día de la semana para la semana actual. Devuelve array en orden Lunes -> Domingo con nombres en español
export const getAppointmentsCountByWeekdayService = async ({
  from,
  to,
}: { from?: Date; to?: Date } = {}) => {
  const start = from ?? startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = to ?? endOfWeek(new Date(), { weekStartsOn: 1 });

  const appointments = await prisma.appointment.findMany({
    where: {
      status: { not: AppointmentStatus.CANCELED },
      startDate: { gte: start, lte: end },
    },
    select: {
      startDate: true,
    },
  });

  // Inicializar conteo para cada día ISO (1..7)
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

  for (const a of appointments) {
    const isoDay = getISODay(a.startDate); // 1=Mon .. 7=Sun
    counts[isoDay] = (counts[isoDay] ?? 0) + 1;
  }

  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const result = [1, 2, 3, 4, 5, 6, 7].map((d, idx) => ({
    day: dayNames[idx],
    appointments: counts[d] ?? 0,
  }));

  return result;
};