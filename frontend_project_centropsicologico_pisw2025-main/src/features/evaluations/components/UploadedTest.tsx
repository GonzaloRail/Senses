import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface UploadedTestProps {
  name: string;
  filename: string;
  fileurl?: string;
  description?: string;
  isViewMode?: boolean;
  onRemove?: () => void;
}

export const UploadedTest = ({ name, filename, fileurl, description, isViewMode = false, onRemove }: UploadedTestProps) => {
  const handleShowDocument = () => {
    window.open(fileurl, "_blank")?.focus();
  }

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          Se ha cargado el siguiente archivo: <strong>{filename}</strong>

        </CardDescription>
      </CardHeader>
      {
        description && (
          <CardContent className="text-sm text-gray-600">
            {description}
          </CardContent>
        )
      }
      <CardFooter className="flex flex-row gap-1 justify-end">
        <Button
          onClick={handleShowDocument}
          type="button"
          className="bg-white border-gray-400 border text-senses-primary hover:cursor-pointer hover:bg-senses-primary/20 hover:text-senses-primary">
          Ver documento
        </Button>
        {
          !isViewMode && onRemove && (
            <Button
              variant="outline"
              type="button"
              onClick={onRemove}
              className="bg-senses-danger text-white hover:cursor-pointer hover:bg-senses-danger/80 hover:text-white">
              Eliminar
            </Button>
          )
        }

      </CardFooter>
    </Card>
  )
}
