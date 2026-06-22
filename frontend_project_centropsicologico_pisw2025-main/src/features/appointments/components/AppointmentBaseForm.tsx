import type { UseFormReturn } from "react-hook-form";
import { Edit, Save, X, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { SiteHeader } from "@/shared/components/SiteHeader";
import type { AppointmentFormSchema } from "@/shared/interfaces/forms/AppointmentFormSchema";
import { InputWithHelper } from "@/features/systemUsers/components/InputWithHelper";
import type {
  AppointmentStatus,
  UserMinimal,
} from "@/shared/interfaces/models";
import { TextareaWithHelper } from "@/shared/components/TextareaWithHelper";
import RadioGroupWithHelper from "@/shared/components/RadioGroupWithHelper";

export type FormMode = "view" | "edit" | "create";
export interface BaseFormProps {
  mode: FormMode;
  form: UseFormReturn<AppointmentFormSchema>;
  onSave: () => void;
  onCancel: () => void;
  onEdit?: () => void;
  onDisable?: () => void;
  loading: boolean;

  // Search handlers
  onPatientSearch?: (query: string) => void;
  onPatientDniSearch?: (dni: string) => void;
  onPatientNameSearch?: (firstname: string, lastname: string) => void;
  onPsychologistSearch?: (query: string) => void;
  onPsychologistDniSearch?: (dni: string) => void;
  onPsychologistNameSearch?: (firstname: string, lastname: string) => void;

  // Date/Time handlers for psychologist search
  onPsychologistDateChange?: (date: string) => void;
  onPsychologistStartTimeChange?: (time: string) => void;
  onPsychologistEndTimeChange?: (time: string) => void;

  // Search options
  patientOptions: Array<{ id: string; name: string; dni?: string }>;
  psychologistOptions: UserMinimal[];
  officeOptions: Array<{ id: string; name: string; location?: string }>;
  assignedOffice?: { id: string; name: string; location?: string } | null;

  // Loading states for searches
  patientSearchLoading?: boolean;
  psychologistSearchLoading?: boolean;
  officeSearchLoading?: boolean;
  appointmentStatus?: AppointmentStatus;
}

export const AppointmentBaseForm = ({
  mode,
  form,
  onSave,
  onCancel,
  onEdit,
  onDisable,
  loading,
  onPatientSearch,
  onPatientDniSearch,
  onPatientNameSearch,
  onPsychologistSearch,
  onPsychologistDniSearch,
  onPsychologistNameSearch,
  onPsychologistDateChange,
  onPsychologistStartTimeChange,
  onPsychologistEndTimeChange,
  patientOptions,
  psychologistOptions,
  assignedOffice,
  patientSearchLoading = false,
  psychologistSearchLoading = false,
  appointmentStatus,
}: BaseFormProps) => {
  const [patientSearchType, setPatientSearchType] = useState<"DNI" | "NAME">("NAME");
  const [psychologistSearchType, setPsychologistSearchType] = useState<"DNI" | "NAME">("NAME");

  // Patient 2-field NAME search state
  const [patientFirstname, setPatientFirstname] = useState("");
  const [patientLastname, setPatientLastname] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [selectedPatientLabel, setSelectedPatientLabel] = useState("");
  const patientSearchRef = useRef<HTMLDivElement>(null);

  // Psychologist 2-field NAME search state
  const [psychologistFirstname, setPsychologistFirstname] = useState("");
  const [psychologistLastname, setPsychologistLastname] = useState("");
  const [psychologistDropdownOpen, setPsychologistDropdownOpen] = useState(false);
  const [selectedPsychologistLabel, setSelectedPsychologistLabel] = useState("");
  const psychologistSearchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (patientSearchRef.current && !patientSearchRef.current.contains(e.target as Node)) {
        setPatientDropdownOpen(false);
      }
      if (psychologistSearchRef.current && !psychologistSearchRef.current.contains(e.target as Node)) {
        setPsychologistDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced patient NAME search
  useEffect(() => {
    if (patientSearchType !== "NAME") return;
    const timer = setTimeout(() => {
      if (patientFirstname.trim() || patientLastname.trim()) {
        onPatientNameSearch?.(patientFirstname.trim(), patientLastname.trim());
        setPatientDropdownOpen(true);
      } else {
        setPatientDropdownOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientFirstname, patientLastname, patientSearchType, onPatientNameSearch]);

  // Debounced psychologist NAME search
  useEffect(() => {
    if (psychologistSearchType !== "NAME") return;
    const timer = setTimeout(() => {
      if (psychologistFirstname.trim() || psychologistLastname.trim()) {
        onPsychologistNameSearch?.(psychologistFirstname.trim(), psychologistLastname.trim());
        setPsychologistDropdownOpen(true);
      } else {
        setPsychologistDropdownOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [psychologistFirstname, psychologistLastname, psychologistSearchType, onPsychologistNameSearch]);

  // Reset inputs when search type changes
  useEffect(() => {
    setPatientFirstname("");
    setPatientLastname("");
    setPatientDropdownOpen(false);
  }, [patientSearchType]);

  useEffect(() => {
    setPsychologistFirstname("");
    setPsychologistLastname("");
    setPsychologistDropdownOpen(false);
  }, [psychologistSearchType]);

  const {
    handleSubmit,
    watch,
    register,
    setValue,
    formState: { errors },
  } = form;

  const isViewMode = mode === "view";

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Crear nueva cita";
      case "edit":
        return "Editar cita";
      default:
        return "Detalle de cita";
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <SiteHeader title={getTitle()} />

      <form onSubmit={handleSubmit(onSave)} className="flex-1 flex flex-col">
        <div className="flex flex-col p-2 gap-5 flex-1">
          <div className="flex flex-col p-2 md:p-6 items-center gap-4">
            {/* Búsqueda de Paciente */}
            {!isViewMode && mode !== "edit" && (
              <div className="grid gap-2 my-2 w-full max-w-md">
                <Select
                  value={patientSearchType}
                  onValueChange={(v) => setPatientSearchType(v as "DNI" | "NAME")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAME">Buscar paciente por Nombre</SelectItem>
                    <SelectItem value="DNI">Buscar paciente por DNI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isViewMode && mode !== "edit" && patientSearchType === "NAME" ? (
              <div className="grid gap-2 my-2 w-full max-w-md" ref={patientSearchRef}>
                <Label className="font-normal">Paciente</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre"
                    value={patientFirstname}
                    onChange={(e) => setPatientFirstname(e.target.value)}
                    maxLength={40}
                  />
                  <Input
                    placeholder="Apellido"
                    value={patientLastname}
                    onChange={(e) => setPatientLastname(e.target.value)}
                    maxLength={40}
                  />
                </div>
                {patientDropdownOpen && (
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {patientSearchLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                        </div>
                      ) : patientOptions.length > 0 ? (
                        patientOptions.map((patient) => (
                          <div
                            key={patient.id}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setValue("patientId", patient.id);
                              setSelectedPatientLabel(patient.dni ? `${patient.name} - ${patient.dni}` : patient.name);
                              setPatientDropdownOpen(false);
                              setPatientFirstname("");
                              setPatientLastname("");
                            }}
                          >
                            {patient.dni ? `${patient.name} - ${patient.dni}` : patient.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No se encontraron resultados</div>
                      )}
                    </div>
                  </div>
                )}
                {watch("patientId") && selectedPatientLabel && (
                  <div className="p-2 border rounded-md bg-gray-50 text-sm">{selectedPatientLabel}</div>
                )}
                {errors.patientId && (
                  <Label className="font-light text-red-500">{errors.patientId.message}</Label>
                )}
                <Label className="font-light text-slate-400">Busque y seleccione el paciente para la cita</Label>
              </div>
            ) : (
              <SearchableSelect
                id="patientId"
                label="Paciente"
                placeholder="Ingrese el DNI del paciente..."
                value={watch("patientId")}
                onValueChange={(value) => setValue("patientId", value)}
                onSearch={onPatientDniSearch ?? onPatientSearch}
                options={patientOptions.map((patient) => ({
                  value: patient.id,
                  label: patient.dni ? `${patient.name} - ${patient.dni}` : patient.name,
                }))}
                loading={patientSearchLoading}
                readOnly={isViewMode || mode === "edit"}
                helper="Busque y seleccione el paciente para la cita"
                error={errors.patientId?.message}
              />
            )}

            {/* Búsqueda de Psicólogo */}
            {!isViewMode && (
              <div className="grid gap-2 my-2 w-full max-w-md">
                <Select
                  value={psychologistSearchType}
                  onValueChange={(v) => setPsychologistSearchType(v as "DNI" | "NAME")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAME">Buscar psicólogo por Nombre</SelectItem>
                    <SelectItem value="DNI">Buscar psicólogo por DNI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isViewMode && psychologistSearchType === "NAME" ? (
              <div className="grid gap-2 my-2 w-full max-w-md" ref={psychologistSearchRef}>
                <Label className="font-normal">Psicólogo a cargo</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre"
                    value={psychologistFirstname}
                    onChange={(e) => setPsychologistFirstname(e.target.value)}
                    maxLength={40}
                  />
                  <Input
                    placeholder="Apellido"
                    value={psychologistLastname}
                    onChange={(e) => setPsychologistLastname(e.target.value)}
                    maxLength={40}
                  />
                </div>
                {psychologistDropdownOpen && (
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {psychologistSearchLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                        </div>
                      ) : psychologistOptions.length > 0 ? (
                        psychologistOptions.map(({ id, firstName, lastName, dni }) => (
                          <div
                            key={id}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setValue("psychologistId", id);
                              setSelectedPsychologistLabel(`${firstName} ${lastName} - DNI: ${dni}`);
                              setPsychologistDropdownOpen(false);
                              setPsychologistFirstname("");
                              setPsychologistLastname("");
                            }}
                          >
                            {`${firstName} ${lastName} - DNI: ${dni}`}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No se encontraron resultados</div>
                      )}
                    </div>
                  </div>
                )}
                {watch("psychologistId") && selectedPsychologistLabel && (
                  <div className="p-2 border rounded-md bg-gray-50 text-sm">{selectedPsychologistLabel}</div>
                )}
                {errors.psychologistId && (
                  <Label className="font-light text-red-500">{errors.psychologistId.message}</Label>
                )}
                <Label className="font-light text-slate-400">Busque y seleccione el psicólogo para la cita</Label>
              </div>
            ) : (
              <SearchableSelect
                id="psychologistId"
                label="Psicólogo a cargo"
                placeholder="Ingrese el DNI del psicólogo..."
                value={watch("psychologistId")}
                onValueChange={(value) => setValue("psychologistId", value)}
                onSearch={onPsychologistDniSearch ?? onPsychologistSearch}
                options={psychologistOptions.map(({ dni, firstName, id, lastName }) => ({
                  value: id,
                  label: `${firstName} ${lastName} - DNI: ${dni}`,
                }))}
                loading={psychologistSearchLoading}
                readOnly={isViewMode}
                helper="Busque y seleccione el psicólogo para la cita"
                error={errors.psychologistId?.message}
              />
            )}
            {/* Ver horario de psicólogo - Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full max-w-md flex items-center gap-2"
              onClick={() => {
                window.open(
                  `/schedules/psychologist/${watch("psychologistId")}`,
                  "_blank"
                );
              }}
              disabled={!watch("psychologistId")}
            >
              <Calendar className="h-4 w-4" />
              Ver horario de psicólogo
            </Button>

            {/* Fecha */}
            <InputWithHelper
              id="date"
              label="Fecha"
              type="date"
              value={watch("date")}
              readOnly={isViewMode}
              helper="Seleccione la fecha de la cita"
              {...register("date")}
              errors={errors.date}
              onChange={(e) => {
                setValue("date", e.target.value);
                onPsychologistDateChange?.(e.target.value);
              }}
            />

            {/* Hora de inicio y fin */}
            <div className="grid gap-2 my-2 w-full max-w-md md:grid-cols-2">
              <InputWithHelper
                id="startTime"
                label="Hora de inicio"
                type="time"
                value={watch("startTime")}
                readOnly={isViewMode}
                helper="Hora de inicio"
                {...register("startTime")}
                errors={errors.startTime}
                onChange={(e) => {
                  setValue("startTime", e.target.value);
                  if (e.target.value && !watch("endTime")) {
                    const start = new Date(`2000-01-01T${e.target.value}`);
                    const end = new Date(start.getTime() + 60 * 60 * 1000);
                    const endTimeString = end.toTimeString().slice(0, 5);
                    setValue("endTime", endTimeString);
                    onPsychologistEndTimeChange?.(endTimeString);
                  }
                  onPsychologistStartTimeChange?.(e.target.value);
                }}
              />

              <InputWithHelper
                id="endTime"
                label="Hora de fin"
                type="time"
                value={watch("endTime")}
                readOnly={isViewMode}
                helper="Hora de fin"
                {...register("endTime")}
                errors={errors.endTime}
                onChange={(e) => {
                  setValue("endTime", e.target.value);
                  onPsychologistEndTimeChange?.(e.target.value);
                }}
              />
            </div>

            <InputWithHelper
              id="officeId"
              label="Consultorio"
              helper={!isViewMode ? "Consultorio se asigna automáticamente" : undefined}
              value={
                assignedOffice
                  ? `${assignedOffice.name}${
                      assignedOffice.location
                        ? " - " + assignedOffice.location
                        : ""
                    }`
                  : "No disponible"
              }
              // mantener officeId en el form aunque sea readonly
              {...{ register: undefined }}
              disabled={true}
              errors={errors.officeId}
            />

            {/* Motivo */}
            <TextareaWithHelper
              id="reason"
              label="Motivo"
              value={watch("reason")}
              placeholder="Ingrese el motivo..."
              readOnly={isViewMode}
              helper="Ingrese el motivo de la consulta"
              errors={errors.reason}
              rows={3}
              {...register("reason")}
            />

            {/* Tipo */}
            <RadioGroupWithHelper
              id="type"
              label="Tipo"
              options={[
                { id: "PARTICULAR", label: "Particular" },
                { id: "SOCIAL", label: "Caso Social/Convenio" },
              ]}
              direction="row"
              disabled={isViewMode}
              helper={!isViewMode ? "Seleccione el tipo de cita" : undefined}
              register={register("typeId")}
              value={watch("typeId")}
              onChange={(v: string) => setValue("typeId", v)}
              errors={errors.typeId}
            />

          </div>

          {/* Botones de acción */}
          <div className="flex flex-col p-2 gap-3 pt-4 border-t w-full md:flex-row md:justify-end mt-auto">
            {isViewMode && (
              <>
                <Button
                  variant="destructive"
                  onClick={onCancel}
                  className="flex items-center gap-2"
                  disabled={loading}
                  type="button"
                >
                  Volver
                </Button>

                {onDisable && appointmentStatus === "PENDING" && (
                  <Button
                    variant={"destructive"}
                    onClick={onDisable}
                    className="flex items-center gap-2"
                    disabled={loading}
                    type="button"
                  >
                    {"Cancelar cita"}
                  </Button>
                )}

                {onEdit && appointmentStatus === "PENDING" && (
                  <Button
                    onClick={onEdit}
                    className="flex items-center gap-2"
                    disabled={loading}
                    type="button"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                )}
              </>
            )}

            {(mode === "edit" || mode === "create") && (
              <>
                <Button
                  variant="destructive"
                  onClick={onCancel}
                  className="flex items-center gap-2"
                  disabled={loading}
                  type="button"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  className="flex items-center gap-2"
                  disabled={loading}
                  type="submit"
                >
                  <Save className="h-4 w-4" />
                  {mode === "create" ? "Crear cita" : "Guardar cambios"}
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
