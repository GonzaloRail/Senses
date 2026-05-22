import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, PlusIcon, Save, X } from "lucide-react";
import { UploadedTest } from "./UploadedTest";
import { type UseFormReturn } from "react-hook-form";
import { type EvaluationFormSchema } from "@/shared/interfaces/forms/EvaluationFormSchema";
import { SiteHeader } from "@/shared/components/SiteHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { Loading } from "@/shared/components/Loading";

interface EvaluationBaseFormProps {
  onSubmit: (data: any) => void;
  onOpenTestModal?: () => void;
  onRemoveTest?: (index: number) => void;
  form: UseFormReturn<EvaluationFormSchema>;
  mode: "view" | "create" | "edit";
  handleCancel: () => void;
  handleEdit?: () => void;
  onStatusChange?: (isActive: boolean) => void;
  loading: boolean;
}

export const EvaluationBaseForm = ({
  onSubmit,
  onOpenTestModal,
  form,
  mode,
  handleCancel,
  onRemoveTest,
  handleEdit,
  onStatusChange,
  loading,
}: EvaluationBaseFormProps) => {
  const isViewMode = mode === "view";

  const {
    handleSubmit,
    watch,
    register,
    getValues,
    formState: { errors },
  } = form;

  const psychologicalTests = watch("psychologicalTests");

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Crear nueva evaluación";
      case "edit":
        return "Editar evaluación";
      default:
        return "Detalle de evaluación";
    }
  };

  if (loading) {
    return <Loading message="Cargando evaluación..." />;
  }
  console.log({ first: watch("openNewSection"), na: watch("name") });

  return (
    <div className="h-screen flex flex-col">
      <SiteHeader title={getTitle()} />
      <form onSubmit={handleSubmit(onSubmit)} className="h-full">
        <div className="h-full flex flex-col p-2 gap-5 flex-1">
          <div className="flex flex-col p-2 md:px-6 items-center ">
            <div className="grid gap-2 my-2 w-full max-w-md">
              <Label className="font-normal" htmlFor="name">
                Nombre de la evaluación
              </Label>
              <Input
                id="name"
                placeholder="Ingresa el nombre de la evaluación..."
                value={watch("name")}
                {...register("name")}
                readOnly={isViewMode}
              />
              {errors.name && (
                <Label
                  className={`font-light ${errors ? "text-red-500" : "text-slate-400"
                    }`}
                  htmlFor="name"
                >
                  {errors.name.message}
                </Label>
              )}
            </div>
            <div className="w-full max-w-md">
              <Label className="font-normal" htmlFor="description">
                Descripción
              </Label>
              <Textarea
                id="description"
                className="overflow-y-auto h-25 resize-none mt-3 max-w-md"
                value={watch("description")}
                placeholder="Ingresa una descripción..."
                {...register("description")}
                readOnly={isViewMode}
              />
            </div>
            {/* <div className="w-full max-w-md">
              <Label className="mt-4 ml-2 flex items-start gap-2">
                <input
                  type="checkbox"
                  className="accent-senses-primary"
                  {...register("openNewSection")}
                  disabled={isViewMode}
                  checked={watch("openNewSection")}
                />
                Crear una nueva sección
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <IoMdInformationCircleOutline />
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" className="ml-3">
                    <p className="max-w-xs bg-gray-600 rounded-md px-2 py-1 text-sm text-white">
                      Esto creará una nueva sección para esta evaluación en la
                      lista.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div> */}
          </div>
          <div className="flex flex-col w-full items-center px-2 gap-3">
            {!isViewMode && onOpenTestModal && (
              <>
                <div className="w-full md:w-8/10">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      onOpenTestModal();
                    }}
                    className="cursor-pointer bg-senses-primary text-white hover:bg-senses-primary hover:text-white"
                  >
                    <PlusIcon />
                    <span className="hidden lg:inline">
                      Agregar nueva prueba
                    </span>
                  </Button>
                </div>
              </>
            )}

            <div className="w-full md:w-8/10 grid gap-3 xl:grid-cols-2">
              {psychologicalTests.length === 0 ? (
                <div className="w-full col-span-2 justify-center items-center">
                  <EmptyState title="No se han agregado pruebas psicológicas" />
                </div>
              ) : (
                <>
                  {getValues().psychologicalTests?.map((test, index) => (
                    <UploadedTest
                      key={test.fileurl || index}
                      {...test}
                      isViewMode={isViewMode}
                      onRemove={
                        !isViewMode && onRemoveTest
                          ? () => onRemoveTest(index)
                          : undefined
                      }
                    />
                  ))}
                </>
              )}
            </div>
          </div>
          {/* Botones de acción */}
          <div className="flex flex-col p-2 gap-3 pt-4 border-t w-full md:flex-row md:justify-end mt-auto">
            {isViewMode && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                  disabled={loading}
                  type="button"
                >
                  Volver
                </Button>

                {onStatusChange && (
                  <Button
                    variant={getValues().isActive ? "destructive" : "default"}
                    onClick={() => onStatusChange(!getValues().isActive)}
                    className="flex items-center gap-2"
                    disabled={loading}
                    type="button"
                  >
                    {getValues().isActive ? "Deshabilitar" : "Habilitar"}
                  </Button>
                )}

                {handleEdit && (
                  <Button
                    onClick={handleEdit}
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
                  {mode === "create" ? "Crear evaluación" : "Guardar cambios"}
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
