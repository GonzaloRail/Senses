import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  createPatientTestDocumentApi,
  createPatientTestApi,
} from "@/features/my-appointments/api/myAppointmentsApi";
import {
  useCreatePatientTest,
  useUpdatePatientTest,
} from "@/features/my-appointments/hooks/usePatientTestMutations";
import { useAlert } from "@/shared/hooks/useAlert";
import { useSpinner } from "@/shared/hooks/useSpinner";
import type {
  ClinicalHistory,
  Evaluation,
  Section,
  Test,
} from "@/shared/interfaces/models";
import { uploadFileToCloudStorage } from "@/shared/utils/uploadFileToCloudStorage";
import { useAuth } from "@/store/auth/auth.store";
import { Download, FileText, Upload, Pencil, ClipboardList } from "lucide-react";
import { useRef, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { getFormTemplateByTestIdApi } from "@/features/evaluations/api/formTemplatesApi";
import { createFormSubmissionApi, updateFormSubmissionApi } from "@/features/evaluations/api/formSubmissionsApi";
import { FormFillerModal } from "../../my-appointments/components/FormFillerModal";

// Components
const TestActions = ({
  test,
  hasPatientTest,
  clinicalHistory,
  setIsDataLoading,
}: {
  test: Test;
  hasPatientTest: boolean;
  clinicalHistory: ClinicalHistory;
  setIsDataLoading: (isLoading: boolean) => void;
}) => {
  const hasTemplate = !!test.document;
  const { user, roleSelected } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputUpdatedRef = useRef<HTMLInputElement>(null);

  const { mutate: createPatientTest } = useCreatePatientTest();
  const { mutate: updatePatientTest } = useUpdatePatientTest();

  const { showAlert } = useAlert();

  // Dynamic form state
  const [isFormFillerOpen, setIsFormFillerOpen] = useState(false);
  const [formTemplateData, setFormTemplateData] = useState<{
    id: string;
    name: string;
    fieldsSchema: any[];
  } | null>(null);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(true);

  const handleUploadPatientTest = () => {
    fileInputRef.current?.click(); // Abre el selector de archivos
  };

  const handleUploadUpdatedPatientTest = () => {
    fileInputUpdatedRef.current?.click(); // Abre el selector de archivos
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsDataLoading(true);
    const file = event.target.files?.[0];
    if (!file) return;
    const filePath = await uploadFileToCloudStorage(
      file,
      clinicalHistory.patient?.dni ?? "Unknown",
      test.name
    );

    if (!filePath) {
      showAlert("Error al subir el archivo", "error");
      return;
    }

    const document = await createPatientTestDocumentApi({
      name: file.name,
      type: "EVALUATION_TEST",
      filePath,
      userId: user?.id || "",
    });

    createPatientTest(
      {
        clinicalHistoryId: clinicalHistory.id,
        testId: test.id,
        documentId: document.id,
        completedById: user?.id || "",
        isGeneralDoc: false,
      },
      {
        onSuccess: () => {
          showAlert("Archivo subido correctamente", "success");
        },
      }
    );

    event.target.value = "";
    setIsDataLoading(false);
  };

  const handleUpdatePatientTest = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsDataLoading(true);

    const file = event.target.files?.[0];
    if (!file) return;

    const filePath = await uploadFileToCloudStorage(
      file,
      clinicalHistory.patient?.dni ?? "Unknown",
      test.name
    );

    if (!filePath) {
      showAlert("Error al subir el archivo", "error");
      return;
    }

    const document = await createPatientTestDocumentApi({
      name: file.name,
      type: "EVALUATION_TEST",
      filePath,
      userId: user?.id || "",
    });

    if (!document) {
      showAlert("Error al crear el documento", "error");
      return;
    }

    console.log({ test });
    updatePatientTest(
      {
        id: test.patientTests[0].id,
        dataToUpdate: {
          documentId: document.id,
        },
      },
      {
        onSuccess: () => {
          showAlert("Archivo actualizado correctamente", "success");
        },
      }
    );

    event.target.value = "";
    setIsDataLoading(false);
  };

  const isForm = test.patientTests[0]?.submissionMode === "FORM" || !!test.formTemplate;

  const handleOpenForm = async (readOnly: boolean) => {
    setIsReadOnlyMode(readOnly);
    let template = test.formTemplate;

    if (!template) {
      setIsDataLoading(true);
      try {
        const fetchedTemplate = await getFormTemplateByTestIdApi(test.id);
        if (fetchedTemplate) {
          template = fetchedTemplate;
        }
      } catch (err) {
        console.error("Error al obtener la plantilla del formulario:", err);
        showAlert("Esta prueba no tiene un formulario digital configurado.", "error");
        setIsDataLoading(false);
        return;
      }
      setIsDataLoading(false);
    }

    if (template) {
      setFormTemplateData(template);
      setIsFormFillerOpen(true);
    }
  };

  const handleSaveFormAnswers = async (answers: Record<string, any>) => {
    if (!formTemplateData) return;
    setIsDataLoading(true);

    try {
      let patientTestId = test.patientTests[0]?.id;

      if (!patientTestId) {
        const newPatientTest = await createPatientTestApi({
          testId: test.id,
          clinicalHistoryId: clinicalHistory.id,
          completedById: user?.id || "",
          isGeneralDoc: false,
          submissionMode: "FORM" as any,
          documentId: "",
        });

        if (!newPatientTest) {
          showAlert("Error al iniciar el registro de la prueba.", "error");
          setIsDataLoading(false);
          return;
        }
        patientTestId = newPatientTest.id;
      }

      if (test.patientTests[0]?.formSubmission) {
        await updateFormSubmissionApi(
          test.patientTests[0].formSubmission.id,
          {
            responseData: answers,
            patientTestId,
          }
        );
        showAlert("Respuestas del formulario actualizadas correctamente", "success");
      } else {
        await createFormSubmissionApi({
          formTemplateId: formTemplateData.id,
          responseData: answers,
          completedById: user?.id || "",
          patientTestId,
        });
        showAlert("Formulario guardado correctamente", "success");
      }

      queryClient.invalidateQueries({ queryKey: ["clinical-history-sorted"] });
      queryClient.invalidateQueries({ queryKey: ["clinical-history"] });
    } catch (err) {
      console.error("Error al guardar respuestas:", err);
      showAlert("Error al guardar el formulario.", "error");
    } finally {
      setIsDataLoading(false);
    }
  };

  return (
    <div className="flex gap-2 ml-auto">
      {isForm ? (
        <>
          {hasPatientTest && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenForm(true)}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Ver Respuestas
            </Button>
          )}

          {!hasPatientTest && roleSelected === "PSYCHOLOGIST" && (
            <Button
              size="sm"
              variant="default"
              className="bg-senses-primary text-white hover:bg-senses-primary/90"
              onClick={() => handleOpenForm(false)}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Llenar Formulario
            </Button>
          )}
        </>
      ) : (
        <>
          {hasPatientTest && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.open(test.patientTests[0].document?.fileUrl, "_blank")
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          )}

          {hasTemplate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                window.open(test.document?.fileUrl, "_blank");
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Descargar Plantilla
            </Button>
          )}

          {!hasPatientTest && roleSelected === "PSYCHOLOGIST" && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                size="sm"
                variant="default"
                onClick={() => handleUploadPatientTest()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Archivo
              </Button>
            </>
          )}
        </>
      )}

      {isFormFillerOpen && formTemplateData && (
        <FormFillerModal
          isOpen={isFormFillerOpen}
          handleClose={() => {
            setIsFormFillerOpen(false);
            setFormTemplateData(null);
          }}
          formTemplateName={formTemplateData.name}
          fieldsSchema={formTemplateData.fieldsSchema}
          existingResponseData={test.patientTests[0]?.formSubmission?.responseData}
          isReadOnly={isReadOnlyMode}
          onSave={handleSaveFormAnswers}
        />
      )}
    </div>
  );
};

const DocumentLink = ({ name, url }: { name: string; url: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 p-3 rounded-md hover:bg-accent transition-colors"
  >
    <FileText className="w-4 h-4 text-muted-foreground" />
    <span className="text-sm">{name}</span>
  </a>
);

const CustomSectionContent = ({
  evaluation,
  clinicalHistory,
  setIsDataLoading,
}: {
  evaluation: Evaluation;
  clinicalHistory: ClinicalHistory;
  setIsDataLoading: (isLoading: boolean) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      {evaluation.tests.map((test) => {
        const hasPatientTest = test.patientTests.length > 0;

        return (
          <div
            key={test.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{test.name}</p>
                {hasPatientTest && (
                  <p className="text-xs text-muted-foreground">
                    {test.patientTests[0].submissionMode === "FORM"
                      ? "Respuestas registradas (Formulario digital)"
                      : test.patientTests[0].document?.name}
                  </p>
                )}
              </div>
            </div>
            <TestActions
              test={test}
              hasPatientTest={hasPatientTest}
              clinicalHistory={clinicalHistory}
              setIsDataLoading={setIsDataLoading}
            />
          </div>
        );
      })}
    </div>
  );
};

const DefaultSectionContent = ({ evaluation }: { evaluation: Evaluation }) => {
  const testsWithDocuments = evaluation.tests.filter(
    (test) => test.patientTests.length > 0
  );

  if (testsWithDocuments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground p-4">
        No hay documentos subidos para esta evaluación
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {testsWithDocuments.map((test) =>
        test.patientTests.map((patientTest) => {
          if (!patientTest.document) return;
          return (
            <DocumentLink
              key={patientTest.id}
              name={test.name}
              url={patientTest.document.fileUrl}
            />
          );
        })
      )}
    </div>
  );
};

const EvaluationAccordion = ({
  evaluation,
  isCustomSection,
  clinicalHistory,
  setIsDataLoading,
}: {
  evaluation: Evaluation;
  isCustomSection: boolean;
  clinicalHistory: ClinicalHistory;
  setIsDataLoading: (isLoading: boolean) => void;
}) => {
  return (
    <AccordionItem value={evaluation.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-col items-start">
          <span className="font-semibold">{evaluation.name}</span>
          {evaluation.description && (
            <span className="text-xs text-muted-foreground">
              {evaluation.description}
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {isCustomSection ? (
          <CustomSectionContent
            evaluation={evaluation}
            clinicalHistory={clinicalHistory}
            setIsDataLoading={setIsDataLoading}
          />
        ) : (
          <DefaultSectionContent evaluation={evaluation} />
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const SectionCard = ({
  section,
  clinicalHistory,
  setIsDataLoading,
}: {
  section: Section;
  clinicalHistory: ClinicalHistory;
  setIsDataLoading: (isLoading: boolean) => void;
}) => {
  const isCustomSection = !section.isDefault;

  // Para secciones custom, mostrar directamente el contenido sin accordion adicional
  if (isCustomSection && section.evaluations.length === 1) {
    const evaluation = section.evaluations[0];

    return (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{section.name}</h3>
          {evaluation.description && (
            <p className="text-sm text-muted-foreground">
              {evaluation.description}
            </p>
          )}
        </div>
        <CustomSectionContent
          evaluation={evaluation}
          clinicalHistory={clinicalHistory}
          setIsDataLoading={setIsDataLoading}
        />
      </div>
    );
  }

  // Para secciones default o custom con múltiples evaluaciones
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
      <Accordion type="multiple" className="w-full">
        {section.evaluations.map((evaluation) => (
          <EvaluationAccordion
            key={evaluation.id}
            evaluation={evaluation}
            isCustomSection={isCustomSection}
            clinicalHistory={clinicalHistory}
            setIsDataLoading={setIsDataLoading}
          />
        ))}
      </Accordion>
    </div>
  );
};

// Main Component
export const ClinicalHistorySections = ({
  sections,
  isLoading,
  clinicalHistory,
}: {
  sections: Section[] | undefined;
  isLoading: boolean;
  clinicalHistory: ClinicalHistory;
}) => {
  const { Spinner, loading, setLoading } = useSpinner({
    initialLoading: isLoading,
  });
  if (loading) {
    return <Spinner />;
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            No hay secciones disponibles
          </h2>
          <p className="text-sm text-muted-foreground">
            No se encontraron secciones para esta historia clínica
          </p>
        </div>
      </div>
    );
  }

  // Ordenar secciones por order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className=" w-full">
      <div className="space-y-4">
        {sortedSections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            clinicalHistory={clinicalHistory}
            setIsDataLoading={setLoading}
          />
        ))}
      </div>
    </div>
  );
};
