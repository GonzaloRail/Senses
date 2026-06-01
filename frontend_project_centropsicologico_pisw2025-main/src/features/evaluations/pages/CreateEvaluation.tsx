import { Loading } from "@/shared/components/Loading";
import {
  evaluationFormSchema,
  type EvaluationFormSchema,
} from "@/shared/interfaces/forms/EvaluationFormSchema";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { AddTestModal } from "../components/AddTestModal";
import { EvaluationBaseForm } from "../components/EvaluationBaseForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAlert } from "@/shared/hooks/useAlert";
import {
  useCreateEvaluation,
  useCreateTestBatch,
} from "../hooks/useEvaluationsMutations";
import { useAuth } from "@/store/auth/auth.store";
import { uploadFileToCloudStorage } from "@/shared/utils/uploadFileToCloudStorage";

export const CreateEvaluation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // PROTOTIPO HÍBRIDO: Un solo modal para carga de Word (el formulario se diseña inline)
  const [isAddTestModalOpen, setIsAddTestModalOpen] = useState(false);
  const { showAlert } = useAlert();

  const form = useForm<EvaluationFormSchema>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      openNewSection: false,
      psychologicalTests: [],
    },
  });

  const { mutate: createEvaluation } = useCreateEvaluation();
  const { mutate: createTestsBatch } = useCreateTestBatch();

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
    form.setValue(
      "psychologicalTests",
      currentTests.filter((_, i) => i !== index)
    );
    showAlert("Prueba eliminada", "success");
  };

  const uploadFile = async (
    file: File,
    customName: string
  ): Promise<string> => {
    return uploadFileToCloudStorage(file, user?.dni ?? "Unknown", customName);
  };

  const onSubmit: SubmitHandler<EvaluationFormSchema> = async (data) => {
    setLoading(true);
    try {
      // 1. Primero crear la evaluación
      const evaluationData = {
        name: data.name,
        description: data.description,
        createdById: user?.id || "",
        openNewSection: true,
      };

      // Crear la evaluación y obtener su ID
      const createdEvaluation = await new Promise<{ id: string }>((resolve) => {
        createEvaluation(
          { evaluationToCreate: evaluationData },
          {
            onSuccess: (evaluation) => {
              resolve(evaluation);
            },
          }
        );
      });

      // 2. Si hay pruebas, procesarlas (híbrido) y cargarlas al backend
      if (data.psychologicalTests && data.psychologicalTests.length > 0) {
        showAlert("Procesando pruebas e informes...", "info");

        // Procesar todos los tests por separado
        const testsWithUrls = await Promise.all(
          data.psychologicalTests.map(async (test) => {
            let filePath = "";
            // Si tiene plantilla de Word adjunta, la subimos a Supabase/Local
            if (test.testFile) {
              filePath = await uploadFile(test.testFile, test.filename);
            }
            
            return {
              name: test.name,
              description: test.description || "",
              filename: test.filename,
              filePath: filePath || null,
              evaluationId: createdEvaluation.id,
              createdById: user?.id,
              // PROTOTIPO HÍBRIDO: Agregamos el JSON de las preguntas que se guardará en Test.templateContent
              templateContent: (test as any).templateContent || null, 
            };
          })
        );

        console.log("Tests a crear en Base de Datos:", testsWithUrls);

        createTestsBatch(
          { testsToCreate: testsWithUrls },
          {
            onSuccess: () => {
              showAlert(
                `Evaluación creada con ${testsWithUrls.length} prueba(s)`,
                "success"
              );
            },
          }
        );
      } else {
        showAlert("Evaluación creada correctamente", "success");
      }

      navigate(`/evaluations/${createdEvaluation.id}`);
    } catch (error) {
      console.error("Error creating evaluation:", error);
      showAlert("Error al crear la evaluación", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/evaluations");
  };

  if (loading) {
    return <Loading message="Creando evaluación..." />;
  }

  return (
    <>
      <EvaluationBaseForm
        form={form}
        onSubmit={onSubmit}
        onOpenTestModal={() => setIsAddTestModalOpen(true)}
        onRemoveTest={handleRemoveTest}
        mode="create"
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
