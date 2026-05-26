import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { DataTable } from "@/shared/components/DataTable";
import { SiteHeader } from "@/shared/components/SiteHeader";
import type { PatientsPaginatedResponse } from "@/shared/interfaces/apiResponses/getAllPatientsPaginatedResponse";
import type { PatientsListSchema } from "@/shared/interfaces/tables/PatientsListSchema";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { exportPatientsToExcelApi, getAllPatientsApi } from "../api/patientsApi";

export const PatientsList = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<"DNI" | "NAME_SURNAME">("DNI");
  const [dniSearch, setDniSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [lastNameSearch, setLastNameSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    dni: "",
    firstname: "",
    lastname: "",
  });

  const columns: ColumnDef<PatientsListSchema>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <div className="">{row.original.name}</div>,
    },
    {
      accessorKey: "dni",
      header: "DNI",
      cell: ({ row }) => <div className="">{row.original.dni}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Teléfono",
      cell: ({ row }) => <div className="">{row.original.phoneNumber}</div>,
    },
    {
      accessorKey: "adminButton",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="flex px-1.5 text-muted-foreground cursor-pointer"
            onClick={() => {
              navigate(`/patient/${row.original.id}`);
            }}
          >
            {row.original.adminButton}
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = useCallback(async ({ pageIndex = 0, pageSize = 10 }) => {
    const page = pageIndex + 1;
    const take = pageSize;
    const normalizedDni = appliedFilters.dni.trim();
    const normalizedFirstname = appliedFilters.firstname.trim();
    const normalizedLastname = appliedFilters.lastname.trim();

    const dataResponse =
      await queryClient.fetchQuery<PatientsPaginatedResponse>({
        queryKey: [
          "patients",
          page,
          take,
          normalizedDni,
          normalizedFirstname,
          normalizedLastname,
        ],
        queryFn: () =>
          getAllPatientsApi({
            page,
            take,
            ...(normalizedDni ? { dni: normalizedDni } : {}),
            ...(normalizedFirstname ? { firstname: normalizedFirstname } : {}),
            ...(normalizedLastname ? { lastname: normalizedLastname } : {}),
          }),
      });

    const data = dataResponse.patients.map(
      ({ id, firstName, lastName, dni, phoneNumber }) => ({
        id,
        name: `${firstName} ${lastName}`,
        dni,
        phoneNumber,
        adminButton: "Administrar",
      })
    );

    return {
      data,
      pageCount: dataResponse.totalPages,
    };
  }, [appliedFilters]);

  const downloadExcel = async () => {
    const blob = await exportPatientsToExcelApi();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "pacientes.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  const handleSearch = () => {
    if (searchType === "DNI") {
      setAppliedFilters({
        dni: dniSearch.trim(),
        firstname: "",
        lastname: "",
      });
      return;
    }

    setAppliedFilters({
      dni: "",
      firstname: nameSearch.trim(),
      lastname: lastNameSearch.trim(),
    });
  };

  const handleSearchTypeChange = (value: "DNI" | "NAME_SURNAME") => {
    setSearchType(value);
    setAppliedFilters({
      dni: "",
      firstname: "",
      lastname: "",
    });
    setDniSearch("");
    setNameSearch("");
    setLastNameSearch("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchType === "DNI") {
        setAppliedFilters({
          dni: dniSearch.trim(),
          firstname: "",
          lastname: "",
        });
        return;
      }

      setAppliedFilters({
        dni: "",
        firstname: nameSearch.trim(),
        lastname: lastNameSearch.trim(),
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchType, dniSearch, nameSearch, lastNameSearch]);

  return (
    <>
      <SiteHeader title="Pacientes" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex justify-end">
                <div className="flex w-full max-w-4xl items-center gap-2">
                  <Select
                    value={searchType}
                    onValueChange={(value) =>
                      handleSearchTypeChange(value as "DNI" | "NAME_SURNAME")
                    }
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="NAME_SURNAME">Nombre y Apellido</SelectItem>
                    </SelectContent>
                  </Select>

                  {searchType === "DNI" ? (
                    <Input
                      value={dniSearch}
                      onChange={(event) => setDniSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSearch();
                        }
                      }}
                      placeholder="Buscar por DNI..."
                      maxLength={8}
                      className="w-full"
                    />
                  ) : (
                    <>
                      <Input
                        value={nameSearch}
                        onChange={(event) => setNameSearch(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleSearch();
                          }
                        }}
                        placeholder="Nombre"
                        maxLength={40}
                        className="w-full"
                      />
                      <Input
                        value={lastNameSearch}
                        onChange={(event) => setLastNameSearch(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleSearch();
                          }
                        }}
                        placeholder="Apellido"
                        maxLength={40}
                        className="w-full"
                      />
                    </>
                  )}

                  <Button type="button" onClick={handleSearch}>
                    Buscar
                  </Button>
                </div>
              </div>
            </div>
            <DataTable
              fetchData={fetchData}
              columns={columns}
              addItem={{
                addItemLabel: "Agregar nuevo paciente",
                onClickAddItem: () => {
                  navigate("/patients/create");
                },
              }}
              optionalExtraButton={{
                optionalExtraButtonLabel: "Exportar pacientes",
                onClickOptionalExtraButton: downloadExcel,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
