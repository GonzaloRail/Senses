import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { DataTable } from "@/shared/components/DataTable";
import { SiteHeader } from "@/shared/components/SiteHeader";
import type { PatientsPaginatedResponse } from "@/shared/interfaces/apiResponses/getAllPatientsPaginatedResponse";
import type { PatientsListSchema } from "@/shared/interfaces/tables/PatientsListSchema";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { exportPatientsToExcelApi, getAllPatientsApi } from "../api/patientsApi";

export const PatientsList = () => {
  const navigate = useNavigate();
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

  const fetchDataSearch = async ({
    pageIndex = 0,
    pageSize = 10,
    search = "",
  }) => {
    const page = pageIndex + 1;
    const take = pageSize;

    const dataResponse =
      await queryClient.fetchQuery<PatientsPaginatedResponse>({
        queryKey: ["patients", page, take],
        queryFn: () => getAllPatientsApi({ page, take, search }),
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
      data: data,
      pageCount: dataResponse.totalPages,
    };
  };

  const fetchData = async ({ pageIndex = 0, pageSize = 10 }) => {
    const page = pageIndex + 1;
    const take = pageSize;
    console.log(page, take);

    const dataResponse =
      await queryClient.fetchQuery<PatientsPaginatedResponse>({
        queryKey: ["patients", page, take],
        queryFn: () => getAllPatientsApi({ page, take }),
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
  };

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

  return (
    <>
      <SiteHeader title="Pacientes" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DataTable
              fetchData={fetchData}
              columns={columns}
              searchItem={{
                searchLabel: "Buscar por DNI",
                fetchDataSearch: fetchDataSearch,
              }}
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
