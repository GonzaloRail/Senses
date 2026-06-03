import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TestCardProps {
  patientTestId: string;
  templateTestId: string;
  name: string;
  templateUrl: string;
  uploadedFileName?: string;
  uploadedFile?: File;
  onOverrideFile: () => Promise<boolean>;
  handleCreatePatientTest: ({
    patientTestId,
    templateTestId,
    file,
  }: {
    patientTestId: string;
    templateTestId: string;
    file: File;
  }) => Promise<void>;
  submissionMode?: "DOCUMENT" | "FORM";
  formTemplate?: {
    id: string;
    name: string;
    fieldsSchema: any[];
  } | null;
  formSubmission?: {
    id: string;
    responseData: Record<string, any>;
  } | null;
  onFillForm?: (params: {
    patientTestId: string;
    templateTestId: string;
    formTemplateId: string;
    formTemplateName: string;
    fieldsSchema: any[];
    existingSubmission: any;
  }) => void;
}

export const TestCard = ({
  patientTestId,
  templateTestId,
  name,
  templateUrl,
  uploadedFileName,
  uploadedFile,
  onOverrideFile,
  handleCreatePatientTest,
  submissionMode,
  formTemplate,
  formSubmission,
  onFillForm,
}: TestCardProps) => {
  const isForm = submissionMode === "FORM" || !!formTemplate;

  return (
    <Card className="w-full my-2">
      <div className="flex flex-col xl:grid xl:grid-cols-10 justify-between items-center px-4 py-0 w-full">
        <CardHeader className="xl:col-span-6 w-full px-0 pb-4">
          <CardTitle className="w-full">
            <div className="text-lg font-semibold w-full">{name}</div>
          </CardTitle>
          <CardDescription>
            {isForm ? (
              formSubmission ? (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  ✓ Formulario completado
                </span>
              ) : (
                <span className="text-amber-600 font-semibold">
                  ⚡ Formulario pendiente
                </span>
              )
            ) : uploadedFileName ? (
              `Se ha cargado el siguiente archivo: ${uploadedFileName}`
            ) : (
              "Ningún archivo cargado"
            )}
          </CardDescription>
        </CardHeader>
        <div className="xl:col-span-4 w-full flex flex-col sm:flex-row xl:flex-row gap-2 justify-end">
          {isForm ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (onFillForm) {
                  onFillForm({
                    patientTestId,
                    templateTestId,
                    formTemplateId: formTemplate?.id || "",
                    formTemplateName: formTemplate?.name || name,
                    fieldsSchema: formTemplate?.fieldsSchema || [],
                    existingSubmission: formSubmission,
                  });
                }
              }}
              className="cursor-pointer bg-senses-primary text-white hover:bg-senses-primary/90 hover:text-white"
            >
              {formSubmission ? "Editar respuestas" : "Llenar formulario"}
            </Button>
          ) : (
            <>
              {uploadedFile && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    const fileUrl = URL.createObjectURL(uploadedFile);
                    window.open(fileUrl, "_blank");
                  }}
                  className="cursor-pointer bg-senses-primary text-white hover:bg-senses-primary/90 hover:text-white"
                >
                  Ver archivo
                </Button>
              )}

              <Button
                variant="outline"
                type="button"
                onClick={async () => {
                  try {
                    if (uploadedFile) {
                      const confirmed = await onOverrideFile();
                      if (!confirmed) return;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const [fileHandle] = await (window as any).showOpenFilePicker({
                      multiple: false,
                    });
                    const file = await fileHandle.getFile();
                    console.log("Archivo seleccionado:", file.name);

                    handleCreatePatientTest({
                      file,
                      patientTestId,
                      templateTestId,
                    });
                  } catch (err) {
                    console.error("Error al seleccionar o subir el archivo:", err);
                  }
                }}
                className="cursor-pointer bg-senses-primary text-white hover:bg-senses-primary/90 hover:text-white"
              >
                Subir archivo
              </Button>
              <Button
                variant="outline"
                type="button"
                asChild
                className="cursor-pointer bg-white text-senses-primary hover:bg-gray-100 hover:text-senses-primary border-1 border-senses-primary"
              >
                <a href={templateUrl} download>
                  Descargar plantilla
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
