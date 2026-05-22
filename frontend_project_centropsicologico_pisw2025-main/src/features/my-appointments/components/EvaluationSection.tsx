import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TestCard } from "./TestCard";
import { Button } from "@/components/ui/button";

interface EvaluationSectionProps {
  id: string;
  name: string;
  tests: Array<{
    id: string;
    testId: string;
    name: string;
    templateUrl: string;
    uploadedFileName?: string;
    uploadedFile?: File;
  }>;
  openAddTestModal: () => void;
  onOverrideFile: () => Promise<boolean>;
  setSelectedEvaluationId: (evaluationId: string) => void;
  handleCreatePatientTest: ({
    patientTestId,
    templateTestId,
    file,
  }: {
    patientTestId: string;
    templateTestId: string;
    file: File;
  }) => Promise<void>;
}

export const EvaluationSection = ({
  id,
  name,
  tests,
  openAddTestModal,
  onOverrideFile,
  setSelectedEvaluationId,
  handleCreatePatientTest,
}: EvaluationSectionProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="text-lg font-semibold">{name}</div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => {
              setSelectedEvaluationId(id);
              openAddTestModal();
            }}
            className="cursor-pointer bg-senses-primary text-white hover:bg-senses-primary hover:text-white"
          >
            Añadir prueba
          </Button>
        </CardTitle>
        <CardDescription>
          {tests.map((test) => (
            <TestCard
              key={test.id}
              patientTestId={test.id}
              templateTestId={test.testId}
              name={test.name}
              templateUrl={test.templateUrl}
              uploadedFileName={test.uploadedFileName}
              uploadedFile={test.uploadedFile}
              onOverrideFile={onOverrideFile}
              handleCreatePatientTest={handleCreatePatientTest}
            />
          ))}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
