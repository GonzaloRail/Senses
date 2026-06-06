import { useEffect, useState } from "react";
import {
  patientFormSchema,
  type PatientFormSchema,
} from "@/shared/interfaces/forms/PatientFormSchema";
import type {
  Patient,
  Province,
  District,
  Gender,
  MaritalStatus,
} from "@/shared/interfaces/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { InputWithHelper } from "../../systemUsers/components/InputWithHelper";
import { SelectWithHelper } from "../../systemUsers/components/SelectWithHelper";
import { CalendarWithHelper } from "./CalendarWithHelper";
import {
  useGetAllRegionsQuery,
  useProvincesByRegionIdQuery,
  // useGetProvinceByIdQuery,
  useDistrictsByProvinceIdQuery,
} from "@/shared/hooks";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, X, Edit, ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { SiteHeader } from "@/shared/components/SiteHeader";
import { Loading } from "@/shared/components/Loading";
import { useCreatePatient, useUpdatePatient } from "../hooks";

export type FormMode = "view" | "edit" | "create";

type patientFormData = Partial<Patient> & {
  districtId?: string;
  provinceId?: string;
  regionId?: string;
};

type PatientFormProps = {
  data?: patientFormData;
  patientId?: string;
};

const genderOptions = [
  { id: "MALE", name: "Masculino" },
  { id: "FEMALE", name: "Femenino" },
  { id: "LGBTQ", name: "LGBTQ+" },
  { id: "NOT_SPECIFIED", name: "No especificado" },
];
const maritalStatusOptions = [
  { id: "SINGLE", name: "Soltero/a" },
  { id: "MARRIED", name: "Casado/a" },
  { id: "WIDOWED", name: "Viudo/a" },
  { id: "DIVORCED", name: "Divorciado/a" },
  { id: "COHABITANT", name: "Conviviente" },
];

function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
      >
        <span className="font-medium text-[#0B2035]">{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-[#75B2C5] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 border-t border-gray-100">{children}</div>
      </div>
    </div>
  );
}

export const PatientForm = ({ data, patientId }: PatientFormProps) => {
  const navigate = useNavigate();
  const methods = useForm<PatientFormSchema>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dni: "",
      gender: "",
      birthdate: "",
      educationLevel: "",
      birthPlace: "",
      occupation: "",
      maritalStatus: "",
      religion: "",
      occupationLocation: "",
      phoneNumber: "",
      address: "",
      parentFullName: "",
      parentDni: "",
      parentPhoneNumber: "",
      districtId: "",
      provinceId: "",
      regionId: "",
      livesWith: "",
      numChildren: "",
      guardianName: "",
      guardianPhone: "",
      mainReason: "",
      howLong: "",
      previousTherapy: "",
      psychiatricMedication: "",
      urgencyLevel: "",
      preferredModality: "",
      preferredSchedule: "",
      requiredSpecialty: "",
      preferredContact: "",
      howFoundUs: "",
      whoReferred: "",
      whatAttractedAttention: "",
      comparedOtherCenters: "",
      acceptPromotions: "",
      employmentStatus: "",
      workSector: "",
      workMode: "",
      incomeRange: "",
      paymentMethods: "",
      acceptDataPolicy: false,
      acceptCommunications: false,
    },
  });

  const {
    handleSubmit,
    watch,
    register,
    reset,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = methods;

  const [mode, setMode] = useState<FormMode>(() => {
    if (!data) return "create";
    return "view";
  });

  useEffect(() => {
    if (data) {
      console.log("datainicial", data);
      reset({
        ...data,
        birthdate: data.birthdate
          ? data.birthdate.toString().split("T")[0]
          : "",

        districtId: data.districtId || "",
        provinceId: data.district?.province?.id || "",
        regionId: data.district?.province?.region?.id || "",
        isActive: data.isActive ?? true,
      });
    }
  }, [mode, data, reset]);

  const regionId = watch("regionId");
  const provinceId = watch("provinceId");

  const { data: allRegions } = useGetAllRegionsQuery();
  const { data: provincesByRegionId } = useProvincesByRegionIdQuery(
    regionId ?? ""
  );
  const { data: districtsByProvinceId } = useDistrictsByProvinceIdQuery(
    provinceId ?? ""
  );

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const [filteredProvinces, setFilteredProvinces] = useState<Province[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const isViewMode = mode === "view";
  const [loading, setLoading] = useState(false);
  const [showComplementary, setShowComplementary] = useState(false);
  const [openSections, setOpenSections] = useState({
    family: false,
    clinical: false,
    preferences: false,
    marketing: false,
    socioeconomic: false,
    consent: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Provincias por región
  useEffect(() => {
    if (regionId && provincesByRegionId) {
      setFilteredProvinces(provincesByRegionId);
      setFilteredDistricts([]);
      if (mode !== "view") {
        setValue("provinceId", "");
        setValue("districtId", "");
      }
    } else {
      setFilteredProvinces([]);
      setFilteredDistricts([]);
      if (mode !== "view") {
        setValue("provinceId", "");
        setValue("districtId", "");
      }
    }
  }, [regionId, provincesByRegionId]);

  // Distritos por provincia
  useEffect(() => {
    if (provinceId && districtsByProvinceId) {
      setFilteredDistricts(districtsByProvinceId || []);
      if (mode !== "view") {
        setValue("districtId", "");
      }
    } else {
      setFilteredDistricts([]);
      if (mode !== "view") {
        setValue("districtId", "");
      }
    }
  }, [provinceId, districtsByProvinceId]);

  const complementaryFieldKeys = [
    "livesWith", "numChildren", "guardianName", "guardianPhone",
    "mainReason", "howLong", "previousTherapy", "psychiatricMedication",
    "urgencyLevel", "preferredModality", "preferredSchedule",
    "requiredSpecialty", "preferredContact", "howFoundUs", "whoReferred",
    "whatAttractedAttention", "comparedOtherCenters", "acceptPromotions",
    "employmentStatus", "workSector", "workMode", "incomeRange",
    "paymentMethods", "acceptDataPolicy", "acceptCommunications",
  ];

  // Guardar paciente (simulado)
  const handleSave = async () => {
    if (showComplementary) {
      const acceptDataPolicy = getValues("acceptDataPolicy");
      if (!acceptDataPolicy) {
        setOpenSections((prev) => ({ ...prev, consent: true }));
        setError("acceptDataPolicy", {
          message:
            "Debes aceptar el tratamiento de datos personales para registrar al paciente.",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const stripComplementary = (
        data: Record<string, unknown>
      ): Record<string, unknown> => {
        return Object.fromEntries(
          Object.entries(data).filter(
            ([key]) => !complementaryFieldKeys.includes(key)
          )
        );
      };

      if (mode === "create") {
        console.log("valores", getValues());

        // Antes de enviar al backend:
        const values = getValues();
        const payload = {
          ...values,
          gender: values.gender as Gender,
          maritalStatus: values.maritalStatus as MaritalStatus,
          birthdate: new Date(`${values.birthdate}T00:00:00`),
          provinceId: "",
          regionId: "",
        };

        const cleaned = stripComplementary(payload);
        const normalizedData = Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(cleaned).filter(([_, value]) => value !== "")
        );
        createPatient.mutate(normalizedData, {
          onSuccess: () => {
            navigate("/patients");
          },
        });
      } else {
        console.log("llega aquí");
        const values = getValues();
        const payload = {
          ...values,
          gender: values.gender as Gender,
          maritalStatus: values.maritalStatus as MaritalStatus,
          birthdate: new Date(`${values.birthdate}T00:00:00`),
          provinceId: "",
          regionId: "",
          clinicalHistoryId: "",
        };

        const keysToIgnoreEmpty = ["provinceId", "regionId", "clinicalHistoryId"];

        const cleaned = stripComplementary(payload);
        const normalizedData = Object.fromEntries(
          Object.entries(cleaned).filter(([key, value]) => {
            if (value == null) return false;
            if (value === "" && keysToIgnoreEmpty.includes(key)) return false;
            return true;
          })
        );

        console.log("normalized", normalizedData);
        updatePatient.mutate(
          {
            id: patientId ?? "",
            patientToUpdate: normalizedData,
          },
          {
            onSuccess: () => {
              navigate("/patients");
            },
          }
        );

        console.log("fecha", payload.birthdate);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (mode === "create") {
      navigate("/patients");
    } else {
      setMode("view");
    }
  };

  const handleEdit = () => {
    setMode("edit");
  };

  // Función para calcular la edad
  function getAgeFromBirthdate(birthdate?: string) {
    if (!birthdate) return "";
    const today = new Date();
    const [date] = birthdate.split("T");
    const [year, month, day] = date.split("-").map(Number);
    console.log(year, month, day);
    if (!year || !month || !day) return "";
    let age = today.getFullYear() - year;
    const m = today.getMonth() + 1 - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }
    return age >= 0 ? String(age) : "";
  }

  if (loading) {
    return <Loading message="Cargando información de paciente..." />;
  }
  console.log(errors);

  return (
    <FormProvider {...methods}>
      <div className="h-screen flex flex-col">
        {mode === "create" ? (
          <SiteHeader title="Registrar paciente" />
        ) : (
          <SiteHeader title="Paciente" />
        )}
        <form
          onSubmit={handleSubmit(handleSave)}
          className="flex-1 flex flex-col"
        >
          <div className="flex flex-col p-2 gap-5 flex-1 self-center">
            <div className="grid grid-cols-1 md:grid-cols-2 p-2 md:p-6 items-center gap-2">
              {/* Datos personales */}
              <InputWithHelper
                id="firstName"
                label="Nombres"
                readOnly={isViewMode}
                //value={watch("firstName")}
                helper="Ingrese los nombres"
                {...register("firstName")}
                errors={errors.firstName}
              //register={register("firstName")}
              />
              <InputWithHelper
                id="lastName"
                label="Apellidos"
                readOnly={isViewMode}
                helper="Ingrese los apellidos"
                {...register("lastName")}
                errors={errors.lastName}
              //register={register("lastName")}
              />
              <InputWithHelper
                id="dni"
                label="DNI"
                readOnly={isViewMode}
                helper="Ingrese el DNI"
                {...register("dni")}
                errors={errors.dni}
              />
              <SelectWithHelper
                id="gender"
                label="Género"
                value={watch("gender")}
                onValueChange={(value) => setValue("gender", value)}
                options={genderOptions}
                readOnly={isViewMode}
                helper="Seleccione el género"
                {...register("gender")}
                errors={errors.gender}
              />
              <CalendarWithHelper
                id="birthdate"
                label="Fecha de nacimiento"
                value={watch("birthdate")}
                readOnly={isViewMode}
                helper="Se calculará la edad automáticamente"
                errors={errors.birthdate}
                onChange={(value) => setValue("birthdate", value)}
                register={register("birthdate")}
              />
              <InputWithHelper
                id="age"
                label="Edad"
                value={getAgeFromBirthdate(watch("birthdate"))}
                readOnly={true}
              />
              <InputWithHelper
                id="educationLevel"
                label="Nivel educativo"
                readOnly={isViewMode}
                helper="Ingrese el nivel educativo"
                {...register("educationLevel")}
                errors={errors.educationLevel}
              />
              <InputWithHelper
                id="birthPlace"
                label="Lugar de nacimiento"
                readOnly={isViewMode}
                helper="Ingrese el lugar de nacimiento"
                {...register("birthPlace")}
                errors={errors.birthPlace}
              />
              <InputWithHelper
                id="occupation"
                label="Ocupación"
                readOnly={isViewMode}
                helper="Ingrese la ocupación"
                {...register("occupation")}
                errors={errors.occupation}
              />
              <SelectWithHelper
                id="maritalStatus"
                label="Estado civil"
                value={watch("maritalStatus")}
                onValueChange={(value) => setValue("maritalStatus", value)}
                options={maritalStatusOptions}
                readOnly={isViewMode}
                helper="Seleccione el estado civil"
                {...register("maritalStatus")}
                errors={errors.maritalStatus}
              />
              <InputWithHelper
                id="religion"
                label="Religión"
                readOnly={isViewMode}
                helper="Ingrese la religión (opcional)"
                {...register("religion")}
                errors={errors.religion}
              />
              <InputWithHelper
                id="occupationLocation"
                label="Lugar de trabajo"
                readOnly={isViewMode}
                helper="Ingrese el lugar de trabajo"
                {...register("occupationLocation")}
                errors={errors.occupationLocation}
              />
              <InputWithHelper
                id="phoneNumber"
                label="Teléfono"
                readOnly={isViewMode}
                helper="Ingrese el teléfono"
                {...register("phoneNumber")}
                errors={errors.phoneNumber}
              />
              <InputWithHelper
                id="address"
                label="Dirección actual"
                readOnly={isViewMode}
                helper="Ingrese la dirección actual"
                {...register("address")}
                errors={errors.address}
              />
              {/* Datos del apoderado */}
              <InputWithHelper
                id="parentFullName"
                label="Nombre completo del apoderado"
                readOnly={isViewMode}
                helper="Ingrese el nombre del apoderado (opcional)"
                {...register("parentFullName")}
                errors={errors.parentFullName}
              />
              <InputWithHelper
                id="parentDni"
                label="DNI del apoderado"
                readOnly={isViewMode}
                helper="Ingrese el DNI del apoderado (opcional)"
                {...register("parentDni")}
                errors={errors.parentDni}
              />
              <InputWithHelper
                id="parentPhoneNumber"
                label="Teléfono del apoderado"
                value={watch("parentPhoneNumber")}
                readOnly={isViewMode}
                helper="Ingrese el teléfono del apoderado (opcional)"
                {...register("parentPhoneNumber")}
                errors={errors.parentPhoneNumber}
              />
              {/* Región, provincia, distrito */}
              <SelectWithHelper
                id="regionId"
                label="Región"
                value={watch("regionId")}
                onValueChange={(value) => setValue("regionId", value)}
                options={
                  allRegions?.map((region) => ({
                    id: region.id,
                    name: region.name,
                  })) ?? []
                }
                readOnly={isViewMode}
                helper="Seleccione la región"
                {...register("regionId")}
                errors={errors.regionId}
              />
              <SelectWithHelper
                id="provinceId"
                label="Provincia"
                value={watch("provinceId")}
                onValueChange={(value) => setValue("provinceId", value)}
                options={
                  filteredProvinces?.map((province) => ({
                    id: province.id,
                    name: province.name,
                  })) ?? []
                }
                readOnly={isViewMode || !regionId}
                helper="Seleccione la provincia"
                {...register("provinceId")}
                errors={errors.provinceId}
              />
              <SelectWithHelper
                id="districtId"
                label="Distrito"
                value={watch("districtId")}
                onValueChange={(value) => setValue("districtId", value)}
                options={
                  filteredDistricts?.map((district) => ({
                    id: district.id,
                    name: district.name,
                  })) ?? []
                }
                readOnly={isViewMode || !provinceId}
                helper="Seleccione el distrito"
                {...register("districtId")}
                errors={errors.districtId}
              />
            </div>
          </div>

          {/* Información complementaria del paciente */}
          {mode === "create" && (
            <div className="p-2 md:p-6">
              <button
                type="button"
                onClick={() => setShowComplementary(!showComplementary)}
                className="w-full flex items-center justify-center gap-3 p-5 bg-[#0B2035] text-white rounded-xl hover:bg-[#0B2035]/90 transition-all duration-300 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                <Plus
                  className={`h-6 w-6 transition-transform duration-300 ${
                    showComplementary ? "rotate-45" : ""
                  }`}
                />
                {showComplementary
                  ? "Ocultar información opcional del paciente"
                  : "+ Agregar información opcional del paciente"}
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showComplementary
                    ? "max-h-[10000px] opacity-100 mt-6"
                    : "max-h-0 opacity-0 mt-0"
                }`}
              >
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-[#0B2035] to-[#0B2035]/90">
                    <h2 className="text-xl font-bold text-white">
                      Información complementaria del paciente
                    </h2>
                    <p className="text-white/80 text-sm mt-2">
                      Estos datos ayudan a mejorar la atención clínica, la organización interna y el
                      seguimiento comercial. Puede completarlos ahora o después.
                    </p>
                  </div>

                  <div className="p-4 md:p-6 space-y-4">
                    {/* 1. Información Familiar */}
                    <AccordionSection
                      title="1. Información Familiar"
                      isOpen={openSections.family}
                      onToggle={() => toggleSection("family")}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputWithHelper
                          id="livesWith"
                          label="¿Con quién vive actualmente?"
                          helper="Indique con quién reside"
                          {...register("livesWith")}
                          errors={errors.livesWith}
                        />
                        <InputWithHelper
                          id="numChildren"
                          label="Número de hijos"
                          helper="Cantidad de hijos"
                          type="number"
                          {...register("numChildren")}
                          errors={errors.numChildren}
                        />
                        <InputWithHelper
                          id="guardianName"
                          label="Nombre del apoderado, si aplica"
                          helper="Nombre completo del apoderado"
                          {...register("guardianName")}
                          errors={errors.guardianName}
                        />
                        <InputWithHelper
                          id="guardianPhone"
                          label="Teléfono del apoderado, si aplica"
                          helper="Teléfono del apoderado"
                          {...register("guardianPhone")}
                          errors={errors.guardianPhone}
                        />
                      </div>
                    </AccordionSection>

                    {/* 2. Información Clínica */}
                    <AccordionSection
                      title="2. Información Clínica"
                      isOpen={openSections.clinical}
                      onToggle={() => toggleSection("clinical")}
                    >
                      <div className="space-y-4">
                        <div className="grid gap-2 my-2 w-full max-w-md">
                          <Label htmlFor="mainReason">Motivo principal de consulta</Label>
                          <textarea
                            id="mainReason"
                            {...register("mainReason")}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Describa el motivo de consulta"
                          />
                          {errors.mainReason?.message && (
                            <span className="text-red-500 text-sm">{errors.mainReason.message}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputWithHelper
                            id="howLong"
                            label="¿Hace cuánto presenta esta situación?"
                            helper="Ej: 3 meses, 1 año"
                            {...register("howLong")}
                            errors={errors.howLong}
                          />
                          <SelectWithHelper
                            id="previousTherapy"
                            label="¿Ha llevado terapia anteriormente?"
                            value={watch("previousTherapy") || ""}
                            onValueChange={(value) => setValue("previousTherapy", value)}
                            options={[
                              { id: "Sí", name: "Sí" },
                              { id: "No", name: "No" },
                            ]}
                            helper="Seleccione una opción"
                            {...register("previousTherapy")}
                            errors={errors.previousTherapy}
                          />
                        </div>

                        <SelectWithHelper
                          id="psychiatricMedication"
                          label="¿Actualmente toma medicación psiquiátrica?"
                          value={watch("psychiatricMedication") || ""}
                          onValueChange={(value) => setValue("psychiatricMedication", value)}
                          options={[
                            { id: "Sí", name: "Sí" },
                            { id: "No", name: "No" },
                            { id: "Prefiero no decirlo", name: "Prefiero no decirlo" },
                          ]}
                          helper="Seleccione una opción"
                          {...register("psychiatricMedication")}
                          errors={errors.psychiatricMedication}
                        />

                        <div>
                          <Label className="font-medium text-[#0B2035] mb-3 block">
                            Nivel de urgencia percibida
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              {
                                value: "Baja",
                                label: "Baja",
                                desc: "Puedo esperar algunos días o semanas para iniciar terapia.",
                                border: "border-green-300",
                                bg: "bg-green-50",
                                hover: "hover:bg-green-100",
                                selected: "border-green-500 bg-green-200",
                              },
                              {
                                value: "Media",
                                label: "Media",
                                desc: "Me gustaría recibir atención lo antes posible.",
                                border: "border-yellow-300",
                                bg: "bg-yellow-50",
                                hover: "hover:bg-yellow-100",
                                selected: "border-yellow-500 bg-yellow-200",
                              },
                              {
                                value: "Alta",
                                label: "Alta",
                                desc: "Siento mucho malestar emocional y necesito ayuda urgente.",
                                border: "border-orange-300",
                                bg: "bg-orange-50",
                                hover: "hover:bg-orange-100",
                                selected: "border-orange-500 bg-orange-200",
                              },
                              {
                                value: "Crítica",
                                label: "Crítica / Emergencia",
                                desc: "Estoy en crisis emocional o siento riesgo para mí o para otros.",
                                border: "border-red-300",
                                bg: "bg-red-50",
                                hover: "hover:bg-red-100",
                                selected: "border-red-500 bg-red-200",
                              },
                            ].map((option) => {
                              const isSelected = watch("urgencyLevel") === option.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() =>
                                    setValue(
                                      "urgencyLevel",
                                      isSelected ? "" : option.value
                                    )
                                  }
                                  className={`relative flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                                    isSelected
                                      ? `${option.border} ${option.selected}`
                                      : `${option.border} ${option.bg} ${option.hover}`
                                  }`}
                                >
                                  <span className="font-semibold text-sm">{option.label}</span>
                                  <span className="text-xs text-gray-600 mt-1">{option.desc}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </AccordionSection>

                    {/* 3. Preferencias de Atención */}
                    <AccordionSection
                      title="3. Preferencias de Atención"
                      isOpen={openSections.preferences}
                      onToggle={() => toggleSection("preferences")}
                    >
                      <div className="space-y-4">
                        <SelectWithHelper
                          id="preferredModality"
                          label="Modalidad preferida"
                          value={watch("preferredModality") || ""}
                          onValueChange={(value) => setValue("preferredModality", value)}
                          options={[
                            { id: "Virtual", name: "Virtual" },
                            { id: "Presencial", name: "Presencial" },
                            { id: "Mixta", name: "Mixta" },
                          ]}
                          helper="Seleccione la modalidad de su preferencia"
                          {...register("preferredModality")}
                          errors={errors.preferredModality}
                        />

                        <div>
                          <Label className="font-medium text-[#0B2035] mb-3 block">
                            Horario preferido
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {["Mañana", "Tarde", "Noche", "Fin de semana"].map(
                              (option) => {
                                const selected = (
                                  watch("preferredSchedule") || ""
                                )
                                  .split(", ")
                                  .filter(Boolean);
                                const isSelected = selected.includes(option);
                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                      const current = (
                                        getValues("preferredSchedule") || ""
                                      )
                                        .split(", ")
                                        .filter(Boolean);
                                      const updated = isSelected
                                        ? current.filter((s) => s !== option)
                                        : [...current, option];
                                      setValue(
                                        "preferredSchedule",
                                        updated.join(", ")
                                      );
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                                      isSelected
                                        ? "bg-[#0B2035] text-white border-[#0B2035]"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-[#75B2C5] hover:text-[#75B2C5]"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="font-medium text-[#0B2035] mb-3 block">
                            Especialidad requerida
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Ansiedad",
                              "Depresión",
                              "Terapia de pareja",
                              "Terapia familiar",
                              "Psicología infantil",
                              "Evaluación psicológica",
                              "Orientación vocacional",
                              "Otro",
                            ].map((option) => {
                              const selected = (
                                watch("requiredSpecialty") || ""
                              )
                                .split(", ")
                                .filter(Boolean);
                              const isSelected = selected.includes(option);
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    const current = (
                                      getValues("requiredSpecialty") || ""
                                    )
                                      .split(", ")
                                      .filter(Boolean);
                                    const updated = isSelected
                                      ? current.filter((s) => s !== option)
                                      : [...current, option];
                                    setValue(
                                      "requiredSpecialty",
                                      updated.join(", ")
                                    );
                                  }}
                                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                                    isSelected
                                      ? "bg-[#0B2035] text-white border-[#0B2035]"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-[#75B2C5] hover:text-[#75B2C5]"
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label className="font-medium text-[#0B2035] mb-3 block">
                            Medio preferido de contacto
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "WhatsApp",
                              "Llamada telefónica",
                              "Correo electrónico",
                            ].map((option) => {
                              const selected = (
                                watch("preferredContact") || ""
                              )
                                .split(", ")
                                .filter(Boolean);
                              const isSelected = selected.includes(option);
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    const current = (
                                      getValues("preferredContact") || ""
                                    )
                                      .split(", ")
                                      .filter(Boolean);
                                    const updated = isSelected
                                      ? current.filter((s) => s !== option)
                                      : [...current, option];
                                    setValue(
                                      "preferredContact",
                                      updated.join(", ")
                                    );
                                  }}
                                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                                    isSelected
                                      ? "bg-[#0B2035] text-white border-[#0B2035]"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-[#75B2C5] hover:text-[#75B2C5]"
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </AccordionSection>

                    {/* 4. Información Comercial y Marketing */}
                    <AccordionSection
                      title="4. Información Comercial y Marketing"
                      isOpen={openSections.marketing}
                      onToggle={() => toggleSection("marketing")}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label className="font-medium text-[#0B2035] mb-3 block">
                            ¿Cómo nos conoció?
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Facebook",
                              "Instagram",
                              "TikTok",
                              "Google",
                              "Recomendación",
                              "Volante",
                              "Convenio",
                              "Otro",
                            ].map((option) => {
                              const selected = (
                                watch("howFoundUs") || ""
                              )
                                .split(", ")
                                .filter(Boolean);
                              const isSelected = selected.includes(option);
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    const current = (
                                      getValues("howFoundUs") || ""
                                    )
                                      .split(", ")
                                      .filter(Boolean);
                                    const updated = isSelected
                                      ? current.filter((s) => s !== option)
                                      : [...current, option];
                                    setValue(
                                      "howFoundUs",
                                      updated.join(", ")
                                    );
                                  }}
                                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                                    isSelected
                                      ? "bg-[#0B2035] text-white border-[#0B2035]"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-[#75B2C5] hover:text-[#75B2C5]"
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputWithHelper
                            id="whoReferred"
                            label="¿Quién le recomendó el servicio?"
                            helper="Nombre de la persona que le recomendó"
                            {...register("whoReferred")}
                            errors={errors.whoReferred}
                          />
                          <SelectWithHelper
                            id="comparedOtherCenters"
                            label="¿Comparó otros centros antes de elegirnos?"
                            value={watch("comparedOtherCenters") || ""}
                            onValueChange={(value) =>
                              setValue("comparedOtherCenters", value)
                            }
                            options={[
                              { id: "Sí", name: "Sí" },
                              { id: "No", name: "No" },
                            ]}
                            helper="Seleccione una opción"
                            {...register("comparedOtherCenters")}
                            errors={errors.comparedOtherCenters}
                          />
                        </div>

                        <div className="grid gap-2 my-2 w-full max-w-md">
                          <Label htmlFor="whatAttractedAttention">
                            ¿Qué fue lo que más le llamó la atención?
                          </Label>
                          <textarea
                            id="whatAttractedAttention"
                            {...register("whatAttractedAttention")}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Describa qué le atrajo de nuestros servicios"
                          />
                          {errors.whatAttractedAttention?.message && (
                            <span className="text-red-500 text-sm">
                              {errors.whatAttractedAttention.message}
                            </span>
                          )}
                        </div>

                        <SelectWithHelper
                          id="acceptPromotions"
                          label="¿Acepta recibir contenido psicológico y promociones?"
                          value={watch("acceptPromotions") || ""}
                          onValueChange={(value) =>
                            setValue("acceptPromotions", value)
                          }
                          options={[
                            { id: "Sí", name: "Sí" },
                            { id: "No", name: "No" },
                          ]}
                          helper="Seleccione una opción"
                          {...register("acceptPromotions")}
                          errors={errors.acceptPromotions}
                        />
                      </div>
                    </AccordionSection>

                    {/* 5. Información Socioeconómica */}
                    <AccordionSection
                      title="5. Información Socioeconómica"
                      isOpen={openSections.socioeconomic}
                      onToggle={() => toggleSection("socioeconomic")}
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SelectWithHelper
                            id="employmentStatus"
                            label="Situación laboral"
                            value={watch("employmentStatus") || ""}
                            onValueChange={(value) =>
                              setValue("employmentStatus", value)
                            }
                            options={[
                              { id: "Sin trabajo", name: "Sin trabajo" },
                              { id: "Con trabajo", name: "Con trabajo" },
                              { id: "Independiente", name: "Independiente" },
                              { id: "Estudiante", name: "Estudiante" },
                              { id: "Jubilado/a", name: "Jubilado/a" },
                            ]}
                            helper="Seleccione su situación laboral"
                            {...register("employmentStatus")}
                            errors={errors.employmentStatus}
                          />
                          <InputWithHelper
                            id="workSector"
                            label="Sector laboral / rubro"
                            helper="Ej: Salud, Educación, Tecnología"
                            {...register("workSector")}
                            errors={errors.workSector}
                          />
                        </div>

                        <SelectWithHelper
                          id="workMode"
                          label="¿Trabaja remoto, presencial o mixto?"
                          value={watch("workMode") || ""}
                          onValueChange={(value) => setValue("workMode", value)}
                          options={[
                            { id: "Remoto", name: "Remoto" },
                            { id: "Presencial", name: "Presencial" },
                            { id: "Mixto", name: "Mixto" },
                            { id: "No aplica", name: "No aplica" },
                          ]}
                          helper="Seleccione su modalidad de trabajo"
                          {...register("workMode")}
                          errors={errors.workMode}
                        />

                        <SelectWithHelper
                          id="incomeRange"
                          label="Rango aproximado de ingresos"
                          value={watch("incomeRange") || ""}
                          onValueChange={(value) =>
                            setValue("incomeRange", value)
                          }
                          options={[
                            {
                              id: "Menos de S/ 1025",
                              name: "Menos de S/ 1025",
                            },
                            {
                              id: "S/ 1025 - S/ 1500",
                              name: "S/ 1025 - S/ 1500",
                            },
                            {
                              id: "S/ 1501 - S/ 2500",
                              name: "S/ 1501 - S/ 2500",
                            },
                            {
                              id: "S/ 2501 - S/ 4000",
                              name: "S/ 2501 - S/ 4000",
                            },
                            {
                              id: "Más de S/ 4000",
                              name: "Más de S/ 4000",
                            },
                            {
                              id: "Prefiero no decirlo",
                              name: "Prefiero no decirlo",
                            },
                          ]}
                          helper="Seleccione su rango de ingresos"
                          {...register("incomeRange")}
                          errors={errors.incomeRange}
                        />

                        <div>
                          <Label className="font-medium text-[#0B2035] mb-3 block">
                            Método de pago preferido
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Efectivo",
                              "Yape",
                              "Plin",
                              "Transferencia bancaria",
                              "Tarjeta",
                            ].map((option) => {
                              const selected = (
                                watch("paymentMethods") || ""
                              )
                                .split(", ")
                                .filter(Boolean);
                              const isSelected = selected.includes(option);
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    const current = (
                                      getValues("paymentMethods") || ""
                                    )
                                      .split(", ")
                                      .filter(Boolean);
                                    const updated = isSelected
                                      ? current.filter((s) => s !== option)
                                      : [...current, option];
                                    setValue(
                                      "paymentMethods",
                                      updated.join(", ")
                                    );
                                  }}
                                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                                    isSelected
                                      ? "bg-[#0B2035] text-white border-[#0B2035]"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-[#75B2C5] hover:text-[#75B2C5]"
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </AccordionSection>

                    {/* 6. Consentimiento */}
                    <AccordionSection
                      title="6. Consentimiento"
                      isOpen={openSections.consent}
                      onToggle={() => toggleSection("consent")}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <input
                            type="checkbox"
                            id="acceptDataPolicy"
                            {...register("acceptDataPolicy")}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0B2035] focus:ring-[#0B2035]"
                          />
                          <div>
                            <Label
                              htmlFor="acceptDataPolicy"
                              className="font-medium text-[#0B2035] cursor-pointer"
                            >
                              Acepto el tratamiento de mis datos personales conforme a la
                              política de privacidad.
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              * Este consentimiento es obligatorio para registrar al paciente.
                            </p>
                            {errors.acceptDataPolicy?.message && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.acceptDataPolicy.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <input
                            type="checkbox"
                            id="acceptCommunications"
                            {...register("acceptCommunications")}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0B2035] focus:ring-[#0B2035]"
                          />
                          <div>
                            <Label
                              htmlFor="acceptCommunications"
                              className="font-medium text-[#0B2035] cursor-pointer"
                            >
                              Acepto recibir información, contenido y promociones de Senses
                              Psicólogos.
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Este consentimiento es opcional.
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionSection>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col p-2 gap-3 pt-4 border-t w-full md:flex-row md:justify-end mt-auto">
            {isViewMode && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => navigate("/patients")}
                  className="flex items-center gap-2"
                  disabled={loading}
                  type="button"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                  disabled={loading}
                  type="button"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </>
            )}
            {(mode === "edit" || mode === "create") && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
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
                  {mode === "create" ? "Registrar paciente" : "Guardar"}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
};
