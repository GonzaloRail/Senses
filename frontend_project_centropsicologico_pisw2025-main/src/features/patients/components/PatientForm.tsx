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
import { Button } from "@/components/ui/button";
import { Save, X, Edit } from "lucide-react";
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
    },
  });

  const {
    handleSubmit,
    watch,
    register,
    reset,
    setValue,
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
        const payload = {
          ...values,
          gender: values.gender as Gender,
          maritalStatus: values.maritalStatus as MaritalStatus,
          // esto es importante para que no se altere la fecha
          // birthdate: values.birthdate ? new Date(values.birthdate) : null,
          birthdate: new Date(`${values.birthdate}T00:00:00`),
          provinceId: "",
          regionId: "",
        };
        // const dataToSendToBack =
        // Normalizar datos para la API
        const normalizedData = Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(payload).filter(([_, value]) => value !== "")
        );
        createPatient.mutate(normalizedData, {
          onSuccess: () => {
            navigate("/patients");
          },
        });

        // enviar payload al backend
        //navigate("/patients");
      } else {
        console.log("llega aquí");
        const values = getValues();
        //const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;
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

        const normalizedData = Object.fromEntries(
          Object.entries(payload).filter(([key, value]) => {
            if (value == null) return false;
            if (value === "" && keysToIgnoreEmpty.includes(key)) return false; // ignorar estos vacíos
            return true; // incluir strings vacíos
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
              // setMode("view");
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
          </div>

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
