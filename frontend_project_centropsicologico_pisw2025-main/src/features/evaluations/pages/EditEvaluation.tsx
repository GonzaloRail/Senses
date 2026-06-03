import { Loading } from "@/shared/components/Loading";
import { AddTestModal } from "../components/AddTestModal";
import { EvaluationBaseForm } from "../components/EvaluationBaseForm";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  evaluationFormSchema,
  type EvaluationFormSchema,
} from "@/shared/interfaces/forms/EvaluationFormSchema";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Evaluation } from "@/shared/interfaces/models";
import { getEvaluationByIdApi } from "../api/evaluationsApi";
import {
  useCreateTestBatch,
  useUpdateEvaluation,
  useUpdateTestStatus,
} from "../hooks/useEvaluationsMutations";
import { useAlert } from "@/shared/hooks/useAlert";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/store/auth/auth.store";
import { uploadFileToCloudStorage } from "@/shared/utils/uploadFileToCloudStorage";
import { createFormTemplateApi } from "../api/formTemplatesApi";

const mapFormQuestionsToFieldsSchema = (questionsJsonStr: string) => {
  try {
    const questions = JSON.parse(questionsJsonStr);
    return questions.map((q: any, idx: number) => {
      let type: "TEXT" | "TEXTAREA" | "NUMBER" | "DATE" | "SELECT" | "RADIO" | "CHECKBOX" | "SCALE" = "TEXTAREA";
      if (q.type === "number") type = "NUMBER";
      else if (q.type === "checkbox") type = "CHECKBOX";
      else if (q.type === "select") type = "SELECT";

      return {
        label: q.label,
        type: type,
        required: q.required || false,
        order: idx,
        options: q.options || undefined,
        placeholder: q.placeholder || `Ingrese ${q.label.toLowerCase()}...`,
      };
    });
  } catch (e) {
    console.error("Error parsing templateContent", e);
    return [];
  }
};

const mapFieldsSchemaToFormQuestions = (fieldsSchema: any): string => {
  if (!fieldsSchema) return "[]";
  try {
    const list = Array.isArray(fieldsSchema) ? fieldsSchema : JSON.parse(fieldsSchema);
    const mapped = list.map((field: any, index: number) => {
      let type: "number" | "text" | "checkbox" | "select" = "text";
      if (field.type === "NUMBER") type = "number";
      else if (field.type === "CHECKBOX") type = "checkbox";
      else if (field.type === "SELECT") type = "select";

      return {
        id: field.id || `campo_${Date.now()}_${index}`,
        label: field.label,
        type: type,
        required: field.required || false,
        options: field.options,
      };
    });
    return JSON.stringify(mapped);
  } catch (e) {
    console.error("Error parsing fieldsSchema", e);
    return "[]";
  }
};

export const EditEvaluation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // PROTOTIPO HÍBRIDO: Un solo modal para carga de Word (el formulario se diseña inline)
  const [isAddTestModalOpen, setIsAddTestModalOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { showAlert } = useAlert();
  const [deactivatedTestIds, setDeactivatedTestIds] = useState<string[]>([]);

  const form = useForm<EvaluationFormSchema>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      psychologicalTests: [],
    },
  });

  const { data: evaluationData } = useQuery<Evaluation>({
    queryKey: ["evaluation", id],
    queryFn: () => getEvaluationByIdApi(id!),
    enabled: !!id,
  });

  const { mutate: updateEvaluation } = useUpdateEvaluation();
  const { mutate: createTestsBatch } = useCreateTestBatch();
  const { mutate: updateTestStatus } = useUpdateTestStatus();

  useEffect(() => {
    if (!evaluationData || !evaluationData.tests) return;

    form.reset({
      name: evaluationData.name,
      description: evaluationData.description,
      isActive: evaluationData.isActive,
      openNewSection: evaluationData.openNewSection,
      psychologicalTests: evaluationData.tests?.map((test: any) => ({
        id: test.id,
        name: test.name,
        description: test.description,
        filename: test.document?.name || (test.formTemplate ? "Formulario digital" : "Documento sin nombre"),
        fileurl: test.document?.fileUrl || "",
        isNew: false,
        templateContent: test.formTemplate ? mapFieldsSchemaToFormQuestions(test.formTemplate.fieldsSchema) : undefined,
      })),
    });
  }, [form, evaluationData]);

  const handleAddTest = (test: {
    name: string;
    description: string;
    filename: string;
    testFile?: File;
    isNew: boolean;
    templateContent?: string;
  }) => {
    const currentTests = form.getValues("psychologicalTests");
    form.setValue("psychologicalTests", [...currentTests, test]);
  };

  const handleRemoveTest = (index: number) => {
    const currentTests = form.getValues("psychologicalTests");
    const testToRemove = currentTests[index];

    form.setValue(
      "psychologicalTests",
      currentTests.filter((_, i) => i !== index)
    );

    if (!testToRemove.isNew && testToRemove.id) {
      setDeactivatedTestIds((prev) => [...prev, testToRemove.id!]);
    }

    showAlert("Prueba eliminada", "success");
  };

  const uploadFile = async (
    file: File,
    customName: string
  ): Promise<string> => {
    return uploadFileToCloudStorage(file, user?.dni ?? "Unknown", customName);
  };

  const onSubmit: SubmitHandler<EvaluationFormSchema> = async (data) => {
    if (!evaluationData) return;

    setLoading(true);
    try {
      // 1. Desactivar pruebas eliminadas en la base de datos
      if (deactivatedTestIds.length > 0) {
        await Promise.all(
          deactivatedTestIds.map((testId) => {
            return new Promise<void>((resolve, reject) => {
              updateTestStatus(
                { id: testId, isActive: false },
                {
                  onSuccess: () => resolve(),
                  onError: (err) => reject(err),
                }
              );
            });
          })
        );
      }

      // 2. Actualizar la evaluación
      const updateData = {
        name: data.name || evaluationData.name,
        description: data.description || evaluationData.description,
        isActive: data.isActive ?? evaluationData.isActive,
      };

      await new Promise<void>((resolve) => {
        updateEvaluation(
          {
            id: evaluationData.id,
            evaluationToUpdate: updateData,
          },
          {
            onSuccess: () => resolve(),
          }
        );
      });

      // 3. Procesar nuevas pruebas
      const newTests = data.psychologicalTests.filter((test) => test.isNew);

      if (newTests.length > 0) {
        showAlert("Procesando nuevas pruebas...", "info");

        // Subir archivos y crear tests (híbrido)
        const testsWithUrls = await Promise.all(
          newTests.map(async (test) => {
            let filePath = "";
            if (test.testFile) {
              filePath = await uploadFile(test.testFile, test.filename);
            }
            return {
              name: test.name,
              description: test.description || "",
              filename: test.filename,
              filePath: filePath || null,
              evaluationId: evaluationData.id,
              createdById: user?.id || "",
              templateContent: (test as any).templateContent || null,
            };
          })
        );

        console.log("Nuevos tests a crear en Base de Datos:", testsWithUrls);

        await new Promise<void>((resolve, reject) => {
          createTestsBatch(
            { testsToCreate: testsWithUrls },
            {
              onSuccess: async (batchResponse) => {
                const createdTests = (batchResponse as any).tests || [];
                
                await Promise.all(
                  createdTests.map(async (createdTest: any, index: number) => {
                    const originalTest = newTests[index];

                    if (originalTest && (originalTest as any).templateContent) {
                      const fieldsSchema = mapFormQuestionsToFieldsSchema((originalTest as any).templateContent);
                      if (fieldsSchema.length > 0) {
                        try {
                          await createFormTemplateApi({
                            formTemplate: {
                              name: createdTest.name,
                              description: createdTest.description || "",
                              isDefault: false,
                              fieldsSchema,
                              createdById: user?.id || "",
                              testId: createdTest.id,
                            }
                          });
                        } catch (err) {
                          console.error("Error al registrar la plantilla digital de la prueba: " + createdTest.name, err);
                        }
                      }
                    }
                  })
                );

                console.log("Pruebas creadas exitosamente");
                showAlert(
                  `Evaluación actualizada con ${testsWithUrls.length} nueva(s) prueba(s)`,
                  "success"
                );
                resolve();
              },
              onError: (err) => {
                console.error("Error al crear pruebas:", err);
                reject(err);
              }
            }
          );
        });
      } else {
        showAlert("Evaluación actualizada correctamente", "success");
      }

      navigate(`/evaluations/${evaluationData.id}`);
    } catch (error) {
      console.error("Error updating evaluation:", error);
      showAlert("Error al actualizar la evaluación", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/evaluations/${id}`);
  };

  if (loading) {
    return <Loading message="Editando evaluación..." />;
  }
  return (
    <>
      <EvaluationBaseForm
        form={form}
        onSubmit={onSubmit}
        onOpenTestModal={() => setIsAddTestModalOpen(true)}
        onRemoveTest={handleRemoveTest}
        mode="edit"
        handleCancel={handleCancel}
        loading={loading}
      />
      {/* Modal: Carga de Word clásica */}
      <AddTestModal
        isOpen={isAddTestModalOpen}
        onClose={() => setIsAddTestModalOpen(false)}
        onSave={handleAddTest}
      />
    </>
  );
};
