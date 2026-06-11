import { useQuery } from "@tanstack/react-query";
import {
  getPatientByIdApi,
  searchPatientsByDniOrName,
  type PatientByIdQuery,
  type PatientsPaginatedQuery,
} from "../api/patientsApi";
import { getAllUsersPaginatedApi } from "@/features/systemUsers/api/systemUsersApi";
import type { Patient, PatientMinimal } from "@/shared/interfaces/models";
import { useState } from "react";

export const usePatientsPaginatedQuery = ({
  page,
  take,
}: PatientsPaginatedQuery) => {
  return useQuery<PatientsPaginatedQuery>({
    queryKey: ["patients", page],
    queryFn: () => getAllUsersPaginatedApi({ page, take }),
  });
};

export const usePatientByIdQuery = ({ id }: PatientByIdQuery) => {
  return useQuery<Partial<Patient>>({
    queryKey: ["patient", id],
    queryFn: () => {
      if (!id) throw new Error("Missing patient ID");
      return getPatientByIdApi({ id });
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id, // Only run the query if id is provided
  });
};

export const usePatientSearchQuery = () => {
  const [searchDni, setDniQuery] = useState<string>("");
  const [searchFirstname, setFirstnameQuery] = useState<string>("");
  const [searchLastname, setLastnameQuery] = useState<string>("");

  const {
    data: patients = [],
    isLoading,
    error,
  } = useQuery<PatientMinimal[]>({
    queryKey: ["patients", searchDni, searchFirstname, searchLastname],
    queryFn: () => searchPatientsByDniOrName(searchDni, searchFirstname, searchLastname),
    enabled: searchDni.trim().length > 0 || searchFirstname.trim().length > 0 || searchLastname.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    patients,
    isLoading,
    error,
    setDniQuery,
    setFirstnameQuery,
    setLastnameQuery,
  };
};
