import { useEffect, useState, type ReactNode } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGetAllRegionsQuery,
  useProvincesByRegionIdQuery,
  // useGetProvinceByIdQuery,
  useDistrictsByProvinceIdQuery,
} from "@/shared/hooks";
import { Button } from "@/components/ui/button";
import { Save, X, Edit, Plus, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router";
import { SiteHeader } from "@/shared/components/SiteHeader";
import { Loading } from "@/shared/components/Loading";
import { useCreatePatient, useUpdatePatient } from "../hooks";

export type FormMode = "view" | "edit" | "create";

type patientFormData = Partial<Patient> & {
  districtId?: string;
  provinceId?: string;
  regionId?: string;
  intakeInfo?: Record<string, any> | null;
  patientConsents?: Array<Record<string, any>>;
};

type PatientFormProps = {
  data?: patientFormData;
  patientId?: string;
};

type ComplementarySection =
  | "family"
  | "clinical"
  | "preferences"
  | "marketing"
  | "socioeconomic"
  | "consent";

type AccordionSectionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

const AccordionSection = ({
  title,
  isOpen,
  onToggle,
  children,
}: AccordionSectionProps) => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left font-semibold text-[#0B2035] transition-colors hover:bg-gray-100 md:px-5"
    >
      <span>{title}</span>
      <ChevronDown
        className={`h-5 w-5 text-[#75B2C5] transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-[1800px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="p-4 md:p-5">{children}</div>
    </div>
  </div>
);

type TextareaFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
};

const TextareaField = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}: TextareaFieldProps) => (
  <div className="grid gap-2 my-2 w-full max-w-md">
    <Label className="font-normal" htmlFor={id}>
      {label}
    </Label>
    <Textarea
      id={id}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-28 resize-none"
    />
  </div>
);

const toSelectionArray = (value?: string) =>
  value ? value.split(", ").filter(Boolean) : [];

const toggleCommaValue = (current: string | undefined, option: string) => {
  const selected = toSelectionArray(current);
  const next = selected.includes(option)
    ? selected.filter((item) => item !== option)
    : [...selected, option];

  return next.join(", ");
};

type ChipGroupProps = {
  label: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
};

const ChipGroup = ({ label, options, value, onChange }: ChipGroupProps) => (
  <div className="grid gap-3 md:col-span-2">
    <Label className="font-normal text-[#0B2035]">{label}</Label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = toSelectionArray(value).includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(toggleCommaValue(value, option))}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              selected
                ? "border-[#0B2035] bg-[#0B2035] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#75B2C5] hover:text-[#0B2035]"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

const urgencyOptions = [
  {
    value: "Baja",
    description: "Puedo esperar algunos días o semanas para iniciar terapia.",
    color: "border-green-200 bg-green-50 text-green-800",
    selectedColor: "border-green-500 bg-green-100 text-green-900",
  },
  {
    value: "Media",
    description: "Me gustaría recibir atención lo antes posible.",
    color: "border-yellow-200 bg-yellow-50 text-yellow-800",
    selectedColor: "border-yellow-500 bg-yellow-100 text-yellow-900",
  },
  {
    value: "Alta",
    description: "Siento mucho malestar emocional y necesito ayuda urgente.",
    color: "border-orange-200 bg-orange-50 text-orange-800",
    selectedColor: "border-orange-500 bg-orange-100 text-orange-900",
  },
  {
    value: "Crítica / Emergencia",
    description: "Estoy en crisis emocional o siento riesgo para mí o para otros.",
    color: "border-red-200 bg-red-50 text-red-800",
    selectedColor: "border-red-500 bg-red-100 text-red-900",
  },
];

type UrgencyCardsProps = {
  value?: string;
  onChange: (value: string) => void;
};

const UrgencyCards = ({ value, onChange }: UrgencyCardsProps) => (
  <div className="grid gap-3 md:col-span-2">
    <Label className="font-normal text-[#0B2035]">Nivel de urgencia</Label>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {urgencyOptions.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(selected ? "" : option.value)}
            className={`rounded-xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              selected ? option.selectedColor : option.color
            }`}
          >
            <p className="font-semibold">{option.value}</p>
            <p className="mt-1 text-sm leading-relaxed">{option.description}</p>
          </button>
        );
      })}
    </div>
  </div>
);

type CheckboxFieldProps = {
  id: string;
  label: string;
  note: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

const CheckboxField = ({
  id,
  label,
  note,
  checked,
  onChange,
  error,
}: CheckboxFieldProps) => (
  <div className="rounded-xl border border-gray-200 p-4">
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked ?? false}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-1"
      />
      <div className="grid gap-1">
        <Label htmlFor={id} className="font-normal leading-relaxed text-[#0B2035]">
          {label}
        </Label>
        <p className="text-sm text-gray-500">{note}</p>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  </div>
);

const complementaryFields = [
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
  "whatAttractedAttention",
  "comparedOtherCenters",
  "acceptPromotions",
  "employmentStatus",
  "workSector",
  "workMode",
  "incomeRange",
  "paymentMethods",
  "acceptDataPolicy",
  "acceptCommunications",
] as const;

const selectedOptionNames = (
  intakeInfo: Record<string, any> | null | undefined,
  groupCode: string
) => {
  const selectedOptions = intakeInfo?.selectionsByGroup?.[groupCode]?.selectedOptions;
  if (!Array.isArray(selectedOptions)) return "";

  return selectedOptions
    .map((option) => option?.name)
    .filter((name): name is string => typeof name === "string" && name !== "")
    .join(", ");
};

const booleanToSpanish = (value: unknown) => {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "";
};

const getConsentValue = (
  consents: Array<Record<string, any>> | undefined,
  code: string
) => {
  const consent = consents?.find(
    (item) => item?.consentType?.code === code || item?.code === code
  );

  return consent ? consent.accepted === true : undefined;
};

const hasComplementaryData = (values: Partial<PatientFormSchema>) =>
  complementaryFields.some((field) => {
    const value = values[field];
    return typeof value === "boolean" ? value : value !== undefined && value !== "";
  });

const mapComplementaryData = (
  patient?: patientFormData
): Partial<PatientFormSchema> => {
  const intakeInfo = patient?.intakeInfo;
  const frontendExtraData = intakeInfo?.extraData?.frontend ?? {};
  const patientConsents = patient?.patientConsents;
  const personalDataConsent = getConsentValue(patientConsents, "PERSONAL_DATA");
  const marketingConsent = getConsentValue(patientConsents, "MARKETING");

  return {
    livesWith: frontendExtraData.livesWith ?? intakeInfo?.livesWithText ?? "",
    numChildren:
      frontendExtraData.numChildren ??
      (intakeInfo?.childrenCount != null ? String(intakeInfo.childrenCount) : ""),
    guardianName: frontendExtraData.guardianName ?? intakeInfo?.guardianName ?? "",
    guardianPhone: frontendExtraData.guardianPhone ?? intakeInfo?.guardianPhone ?? "",
    mainReason:
      frontendExtraData.mainReason ?? intakeInfo?.mainConsultationReason ?? "",
    howLong: frontendExtraData.howLong ?? intakeInfo?.situationDurationText ?? "",
    previousTherapy:
      frontendExtraData.previousTherapy ??
      booleanToSpanish(intakeInfo?.hadPreviousTherapy),
    psychiatricMedication:
      frontendExtraData.psychiatricMedication ??
      booleanToSpanish(intakeInfo?.takesPsychiatricMedication),
    urgencyLevel:
      frontendExtraData.urgencyLevel ??
      selectedOptionNames(intakeInfo, "URGENCY_LEVEL"),
    preferredModality:
      frontendExtraData.preferredModality ??
      selectedOptionNames(intakeInfo, "PREFERRED_MODALITY"),
    preferredSchedule:
      frontendExtraData.preferredSchedule ??
      selectedOptionNames(intakeInfo, "PREFERRED_SCHEDULE"),
    requiredSpecialty:
      frontendExtraData.requiredSpecialty ??
      selectedOptionNames(intakeInfo, "REQUIRED_SPECIALTY"),
    preferredContact:
      frontendExtraData.preferredContact ??
      selectedOptionNames(intakeInfo, "CONTACT_METHOD"),
    howFoundUs:
      frontendExtraData.howFoundUs ??
      selectedOptionNames(intakeInfo, "ACQUISITION_SOURCE"),
    whoReferred: frontendExtraData.whoReferred ?? intakeInfo?.referredByName ?? "",
    comparedOtherCenters:
      frontendExtraData.comparedOtherCenters ??
      booleanToSpanish(intakeInfo?.comparedOtherCenters),
    whatAttractedAttention:
      frontendExtraData.whatAttractedAttention ?? intakeInfo?.attractionNote ?? "",
    acceptPromotions:
      frontendExtraData.acceptPromotions ?? booleanToSpanish(marketingConsent),
    employmentStatus:
      frontendExtraData.employmentStatus ??
      selectedOptionNames(intakeInfo, "EMPLOYMENT_STATUS"),
    workSector: frontendExtraData.workSector ?? "",
    workMode:
      frontendExtraData.workMode ?? selectedOptionNames(intakeInfo, "WORK_MODE"),
    incomeRange: frontendExtraData.incomeRange ?? intakeInfo?.incomeRange?.label ?? "",
    paymentMethods:
      frontendExtraData.paymentMethods ??
      selectedOptionNames(intakeInfo, "PAYMENT_METHOD"),
    acceptDataPolicy: frontendExtraData.acceptDataPolicy ?? personalDataConsent ?? false,
    acceptCommunications:
      frontendExtraData.acceptCommunications ?? marketingConsent ?? false,
  };
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
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = methods;

  const [mode, setMode] = useState<FormMode>(() => {
    if (!data) return "create";
    return "view";
  });

  useEffect(() => {
    if (data) {
      console.log("datainicial", data);
      const complementaryData = mapComplementaryData(data);
      reset({
        ...data,
        ...complementaryData,
        birthdate: data.birthdate
          ? data.birthdate.toString().split("T")[0]
          : "",

        districtId: data.districtId || "",
        provinceId: data.district?.province?.id || "",
        regionId: data.district?.province?.region?.id || "",
        isActive: data.isActive ?? true,
      });
      setShowComplementary(hasComplementaryData(complementaryData));
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
  const isSubmitting =
    loading || createPatient.isPending || updatePatient.isPending;
  const [showComplementary, setShowComplementary] = useState(false);
  const [openSections, setOpenSections] = useState<
    Record<ComplementarySection, boolean>
  >({
    family: true,
    clinical: false,
    preferences: false,
    marketing: false,
    socioeconomic: false,
    consent: false,
  });

  const toggleSection = (section: ComplementarySection) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
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

  // Guardar paciente (simulado)
  const handleSave = async () => {
    setLoading(true);
    try {
      if (mode === "create") {
        console.log("valores", getValues());

        // Antes de enviar al backend:
        const values = getValues();
        if (showComplementary && !values.acceptDataPolicy) {
          setOpenSections((current) => ({ ...current, consent: true }));
          setError("acceptDataPolicy", {
            type: "manual",
            message:
              "Debes aceptar el tratamiento de datos personales para registrar al paciente.",
          });
          return;
        }

        const payload = {
          ...values,
          gender: values.gender as Gender,
          maritalStatus: values.maritalStatus as MaritalStatus,
          // esto es importante para que no se altere la fecha
          // birthdate: values.birthdate ? new Date(values.birthdate) : null,
          birthdate: new Date(`${values.birthdate}T00:00:00`).toISOString(),
          provinceId: "",
          regionId: "",
        };
        if (!showComplementary) {
          complementaryFields.forEach((field) => {
            delete payload[field];
          });
        }
        // const dataToSendToBack =
        // Normalizar datos para la API
        const normalizedData = Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(payload).filter(([_, value]) => value !== "")
        );
        await createPatient.mutateAsync(normalizedData);
        navigate("/patients");

        // enviar payload al backend
        //navigate("/patients");
      } else {
        console.log("llega aquí");
        const values = getValues();
        if (showComplementary && !values.acceptDataPolicy) {
          setOpenSections((current) => ({ ...current, consent: true }));
          setError("acceptDataPolicy", {
            type: "manual",
            message:
              "Debes aceptar el tratamiento de datos personales para registrar al paciente.",
          });
          return;
        }

        //const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;
        const payload = {
          ...values,
          gender: values.gender as Gender,
          maritalStatus: values.maritalStatus as MaritalStatus,
          birthdate: new Date(`${values.birthdate}T00:00:00`).toISOString(),
          provinceId: "",
          regionId: "",
          clinicalHistoryId: "",
        };

        if (!showComplementary) {
          complementaryFields.forEach((field) => {
            delete payload[field];
          });
        }

        const keysToIgnoreEmpty = ["provinceId", "regionId", "clinicalHistoryId"];

        const normalizedData = Object.fromEntries(
          Object.entries(payload).filter(([key, value]) => {
            if (value == null) return false;
            if (value === "" && keysToIgnoreEmpty.includes(key)) return false; // ignorar estos vacíos
            return true; // incluir strings vacíos
          })
        );

        console.log("normalized", normalizedData);
        await updatePatient.mutateAsync({
          id: patientId ?? "",
          patientToUpdate: normalizedData,
        });
        navigate("/patients");

        console.log("fecha", payload.birthdate);
      }
    } catch (error) {
      console.error(error);
    } finally {
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
                label="Dirección"
                readOnly={isViewMode}
                helper="Ingrese la dirección"
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

            {(mode === "create" || mode === "edit") && (
              <div className="w-full px-2 pb-6 md:px-6">
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={() => setShowComplementary((current) => !current)}
                    className="w-full max-w-2xl rounded-xl bg-[#0B2035] px-6 py-6 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#12304f] hover:shadow-xl md:w-auto md:min-w-[520px]"
                  >
                    <Plus
                      className={`h-5 w-5 transition-transform duration-300 ${
                        showComplementary ? "rotate-45" : ""
                      }`}
                    />
                    {showComplementary
                      ? "Ocultar información opcional del paciente"
                      : "+ Agregar información opcional del paciente"}
                  </Button>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    showComplementary
                      ? "mt-6 max-h-[6000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-[#0B2035] to-[#0B2035]/90 px-5 py-5 text-white md:px-6">
                      <h2 className="text-lg font-semibold md:text-xl">
                        Información complementaria del paciente
                      </h2>
                      <p className="mt-2 max-w-4xl text-sm leading-relaxed text-white/80">
                        Estos datos ayudan a mejorar la atención clínica, la organización interna y el seguimiento comercial. Puede completarlos ahora o después.
                      </p>
                    </div>

                    <div className="space-y-4 p-4 md:p-6">
                      <AccordionSection
                        title="Información Familiar"
                        isOpen={openSections.family}
                        onToggle={() => toggleSection("family")}
                      >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                            type="number"
                            helper="Cantidad de hijos"
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

                      <AccordionSection
                        title="Información Clínica"
                        isOpen={openSections.clinical}
                        onToggle={() => toggleSection("clinical")}
                      >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <TextareaField
                            id="mainReason"
                            label="Motivo principal de consulta"
                            placeholder="Describa el motivo de consulta"
                            value={watch("mainReason")}
                            onChange={(value) => setValue("mainReason", value)}
                          />
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
                            value={watch("previousTherapy")}
                            onValueChange={(value) => setValue("previousTherapy", value)}
                            options={["Sí", "No"]}
                            helper="Seleccione una opción"
                            {...register("previousTherapy")}
                            errors={errors.previousTherapy}
                          />
                          <SelectWithHelper
                            id="psychiatricMedication"
                            label="¿Actualmente toma medicación psiquiátrica?"
                            value={watch("psychiatricMedication")}
                            onValueChange={(value) =>
                              setValue("psychiatricMedication", value)
                            }
                            options={["Sí", "No", "Prefiero no decirlo"]}
                            helper="Seleccione una opción"
                            {...register("psychiatricMedication")}
                            errors={errors.psychiatricMedication}
                          />
                          <UrgencyCards
                            value={watch("urgencyLevel")}
                            onChange={(value) => setValue("urgencyLevel", value)}
                          />
                        </div>
                      </AccordionSection>

                      <AccordionSection
                        title="Preferencias de Atención"
                        isOpen={openSections.preferences}
                        onToggle={() => toggleSection("preferences")}
                      >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <SelectWithHelper
                            id="preferredModality"
                            label="Modalidad preferida"
                            value={watch("preferredModality")}
                            onValueChange={(value) => setValue("preferredModality", value)}
                            options={["Virtual", "Presencial", "Mixta"]}
                            helper="Seleccione una modalidad"
                            {...register("preferredModality")}
                            errors={errors.preferredModality}
                          />
                          <ChipGroup
                            label="Horario preferido"
                            options={["Mañana", "Tarde", "Noche", "Fin de semana"]}
                            value={watch("preferredSchedule")}
                            onChange={(value) => setValue("preferredSchedule", value)}
                          />
                          <ChipGroup
                            label="Especialidad requerida"
                            options={[
                              "Ansiedad",
                              "Depresión",
                              "Terapia de pareja",
                              "Terapia familiar",
                              "Psicología infantil",
                              "Evaluación psicológica",
                              "Orientación vocacional",
                              "Otro",
                            ]}
                            value={watch("requiredSpecialty")}
                            onChange={(value) => setValue("requiredSpecialty", value)}
                          />
                          <ChipGroup
                            label="Medio preferido de contacto"
                            options={[
                              "WhatsApp",
                              "Llamada telefónica",
                              "Correo electrónico",
                            ]}
                            value={watch("preferredContact")}
                            onChange={(value) => setValue("preferredContact", value)}
                          />
                        </div>
                      </AccordionSection>

                      <AccordionSection
                        title="Información Comercial y Marketing"
                        isOpen={openSections.marketing}
                        onToggle={() => toggleSection("marketing")}
                      >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <ChipGroup
                            label="¿Cómo nos encontró?"
                            options={[
                              "Facebook",
                              "Instagram",
                              "TikTok",
                              "Google",
                              "Recomendación",
                              "Volante",
                              "Convenio",
                              "Otro",
                            ]}
                            value={watch("howFoundUs")}
                            onChange={(value) => setValue("howFoundUs", value)}
                          />
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
                            value={watch("comparedOtherCenters")}
                            onValueChange={(value) =>
                              setValue("comparedOtherCenters", value)
                            }
                            options={["Sí", "No"]}
                            helper="Seleccione una opción"
                            {...register("comparedOtherCenters")}
                            errors={errors.comparedOtherCenters}
                          />
                          <TextareaField
                            id="whatAttractedAttention"
                            label="¿Qué fue lo que más le llamó la atención?"
                            placeholder="Describa qué le atrajo de nuestros servicios"
                            value={watch("whatAttractedAttention")}
                            onChange={(value) =>
                              setValue("whatAttractedAttention", value)
                            }
                          />
                          <SelectWithHelper
                            id="acceptPromotions"
                            label="¿Acepta recibir contenido psicológico y promociones?"
                            value={watch("acceptPromotions")}
                            onValueChange={(value) => setValue("acceptPromotions", value)}
                            options={["Sí", "No"]}
                            helper="Seleccione una opción"
                            {...register("acceptPromotions")}
                            errors={errors.acceptPromotions}
                          />
                        </div>
                      </AccordionSection>

                      <AccordionSection
                        title="Información Socioeconómica"
                        isOpen={openSections.socioeconomic}
                        onToggle={() => toggleSection("socioeconomic")}
                      >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <SelectWithHelper
                            id="employmentStatus"
                            label="Situación laboral"
                            value={watch("employmentStatus")}
                            onValueChange={(value) => setValue("employmentStatus", value)}
                            options={[
                              "Sin trabajo",
                              "Con trabajo",
                              "Independiente",
                              "Estudiante",
                              "Jubilado/a",
                            ]}
                            helper="Seleccione una situación"
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
                          <SelectWithHelper
                            id="workMode"
                            label="¿Trabaja remoto, presencial o mixto?"
                            value={watch("workMode")}
                            onValueChange={(value) => setValue("workMode", value)}
                            options={["Remoto", "Presencial", "Mixto", "No aplica"]}
                            helper="Seleccione una opción"
                            {...register("workMode")}
                            errors={errors.workMode}
                          />
                          <SelectWithHelper
                            id="incomeRange"
                            label="Rango aproximado de ingresos"
                            value={watch("incomeRange")}
                            onValueChange={(value) => setValue("incomeRange", value)}
                            options={[
                              "Menos de S/ 1025",
                              "S/ 1025 - S/ 1500",
                              "S/ 1501 - S/ 2500",
                              "S/ 2501 - S/ 4000",
                              "Más de S/ 4000",
                              "Prefiero no decirlo",
                            ]}
                            helper="Seleccione un rango"
                            {...register("incomeRange")}
                            errors={errors.incomeRange}
                          />
                          <ChipGroup
                            label="Métodos de pago preferidos"
                            options={[
                              "Efectivo",
                              "Yape",
                              "Plin",
                              "Transferencia bancaria",
                              "Tarjeta",
                            ]}
                            value={watch("paymentMethods")}
                            onChange={(value) => setValue("paymentMethods", value)}
                          />
                        </div>
                      </AccordionSection>

                      <AccordionSection
                        title="Consentimiento"
                        isOpen={openSections.consent}
                        onToggle={() => toggleSection("consent")}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <CheckboxField
                            id="acceptDataPolicy"
                            label="Acepto el tratamiento de mis datos personales conforme a la política de privacidad."
                            note="* Este consentimiento es obligatorio para registrar al paciente."
                            checked={watch("acceptDataPolicy")}
                            onChange={(value) => {
                              setValue("acceptDataPolicy", value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              if (value) clearErrors("acceptDataPolicy");
                            }}
                            error={errors.acceptDataPolicy?.message}
                          />
                          <CheckboxField
                            id="acceptCommunications"
                            label="Acepto recibir información, contenido y promociones de Senses Psicólogos."
                            note="Este consentimiento es opcional."
                            checked={watch("acceptCommunications")}
                            onChange={(value) =>
                              setValue("acceptCommunications", value, {
                                shouldDirty: true,
                              })
                            }
                          />
                        </div>
                      </AccordionSection>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col p-2 gap-3 pt-4 border-t w-full md:flex-row md:justify-end mt-auto">
            {isViewMode && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => navigate("/patients")}
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                  type="button"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  type="button"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
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
