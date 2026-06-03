import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useMemo } from "react";
import type { FormFieldPayload } from "@/features/evaluations/api/formTemplatesApi";

interface FormFillerModalProps {
  isOpen: boolean;
  handleClose: () => void;
  formTemplateName: string;
  fieldsSchema: FormFieldPayload[] | string;
  existingResponseData?: Record<string, any> | string;
  isReadOnly?: boolean;
  onSave: (answers: Record<string, any>) => Promise<void>;
}

export const FormFillerModal = ({
  isOpen,
  handleClose,
  formTemplateName,
  fieldsSchema,
  existingResponseData = {},
  isReadOnly = false,
  onSave,
}: FormFillerModalProps) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Analizar con seguridad el esquema de campos
  const parsedFieldsSchema = useMemo<FormFieldPayload[]>(() => {
    if (!fieldsSchema) return [];
    if (Array.isArray(fieldsSchema)) return fieldsSchema;
    if (typeof fieldsSchema === "string") {
      try {
        return JSON.parse(fieldsSchema);
      } catch (e) {
        console.error("Error parsing fieldsSchema in FormFillerModal:", e);
        return [];
      }
    }
    return [];
  }, [fieldsSchema]);

  // Analizar con seguridad los datos de respuestas existentes
  const parsedExistingResponseData = useMemo<Record<string, any>>(() => {
    if (!existingResponseData) return {};
    if (typeof existingResponseData === "string") {
      try {
        return JSON.parse(existingResponseData);
      } catch (e) {
        console.error("Error parsing existingResponseData in FormFillerModal:", e);
        return {};
      }
    }
    return existingResponseData;
  }, [existingResponseData]);

  // Inicializar respuestas
  useEffect(() => {
    if (isOpen && parsedFieldsSchema.length > 0) {
      const initialAnswers: Record<string, any> = {};
      parsedFieldsSchema.forEach((field, index) => {
        const fieldKey = field.id || `field_${index}`;
        if (parsedExistingResponseData && parsedExistingResponseData[fieldKey] !== undefined) {
          initialAnswers[fieldKey] = parsedExistingResponseData[fieldKey];
        } else {
          // Valores por defecto
          if (field.type === "CHECKBOX") {
            initialAnswers[fieldKey] = [];
          } else {
            initialAnswers[fieldKey] = "";
          }
        }
      });
      setAnswers(initialAnswers);
      setErrors({});
      setSaving(false);
    }
  }, [isOpen, parsedFieldsSchema, parsedExistingResponseData]);

  const handleChange = (fieldKey: string, value: any) => {
    if (isReadOnly) return;
    setAnswers((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
    // Limpiar error al modificar
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  };

  const handleCheckboxChange = (fieldKey: string, option: string, checked: boolean) => {
    if (isReadOnly) return;
    const currentValues = Array.isArray(answers[fieldKey]) ? answers[fieldKey] : [];
    let newValues: string[];
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter((v: string) => v !== option);
    }
    handleChange(fieldKey, newValues);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    parsedFieldsSchema.forEach((field, index) => {
      const fieldKey = field.id || `field_${index}`;
      const val = answers[fieldKey];
      if (field.required) {
        if (field.type === "CHECKBOX") {
          if (!val || val.length === 0) {
            newErrors[fieldKey] = "Este campo es obligatorio. Seleccione al menos una opción.";
          }
        } else {
          if (val === undefined || val === null || String(val).trim() === "") {
            newErrors[fieldKey] = "Este campo es obligatorio.";
          }
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      handleClose();
      return;
    }
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave(answers);
      handleClose();
    } catch (err) {
      console.error("Error saving form answers:", err);
    } finally {
      setSaving(false);
    }
  };

  // Ordenar los campos por su propiedad order
  const sortedFields = useMemo(() => {
    return [...parsedFieldsSchema].sort((a, b) => a.order - b.order);
  }, [parsedFieldsSchema]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-senses-primary">
            {formTemplateName} {isReadOnly && <span className="text-xs font-normal text-muted-foreground ml-2">(Solo lectura)</span>}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Responda las preguntas de la prueba en formato digital.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-6 py-2">
              {sortedFields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Este formulario no contiene preguntas definidas.
                </p>
              ) : (
                sortedFields.map((field, index) => {
                  const fieldKey = field.id || `field_${index}`;
                  const hasError = !!errors[fieldKey];

                  // Analizar opciones con seguridad
                  const rawOptions = field.options;
                  let optionsList: string[] = [];
                  if (rawOptions) {
                    if (Array.isArray(rawOptions)) {
                      optionsList = rawOptions;
                    } else if (typeof rawOptions === "string") {
                      try {
                        optionsList = JSON.parse(rawOptions);
                      } catch (e) {
                        optionsList = [rawOptions];
                      }
                    }
                  }

                  return (
                    <div key={fieldKey} className="flex flex-col gap-2">
                      <Label htmlFor={fieldKey} className="font-semibold text-sm flex items-center gap-1">
                        {field.label}
                        {field.required && !isReadOnly && <span className="text-red-500">*</span>}
                      </Label>

                      {field.helpText && (
                        <span className="text-xs text-muted-foreground -mt-1">
                          {field.helpText}
                        </span>
                      )}

                      {/* TEXT */}
                      {field.type === "TEXT" && (
                        <Input
                          id={fieldKey}
                          placeholder={field.placeholder || ""}
                          value={answers[fieldKey] || ""}
                          disabled={isReadOnly}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      )}

                      {/* TEXTAREA */}
                      {field.type === "TEXTAREA" && (
                        <Textarea
                          id={fieldKey}
                          placeholder={field.placeholder || ""}
                          value={answers[fieldKey] || ""}
                          disabled={isReadOnly}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          rows={4}
                          className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      )}

                      {/* NUMBER */}
                      {field.type === "NUMBER" && (
                        <Input
                          id={fieldKey}
                          type="number"
                          placeholder={field.placeholder || ""}
                          value={answers[fieldKey] !== undefined ? answers[fieldKey] : ""}
                          disabled={isReadOnly}
                          onChange={(e) => handleChange(fieldKey, e.target.value === "" ? "" : Number(e.target.value))}
                          className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      )}

                      {/* DATE */}
                      {field.type === "DATE" && (
                        <Input
                          id={fieldKey}
                          type="date"
                          value={answers[fieldKey] || ""}
                          disabled={isReadOnly}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      )}

                      {/* SELECT */}
                      {field.type === "SELECT" && (
                        <select
                          id={fieldKey}
                          value={answers[fieldKey] || ""}
                          disabled={isReadOnly}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                            hasError ? "border-red-500 ring-red-500" : ""
                          }`}
                        >
                          <option value="">{field.placeholder || "Seleccione una opción..."}</option>
                          {optionsList.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* RADIO */}
                      {field.type === "RADIO" && (
                        <div className="flex flex-col gap-2 mt-1">
                          {optionsList.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="radio"
                                name={fieldKey}
                                value={opt}
                                checked={answers[fieldKey] === opt}
                                disabled={isReadOnly}
                                onChange={() => handleChange(fieldKey, opt)}
                                className="w-4 h-4 text-senses-primary focus:ring-senses-primary border-gray-300"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* CHECKBOX */}
                      {field.type === "CHECKBOX" && (
                        <div className="flex flex-col gap-2 mt-1">
                          {optionsList.map((opt) => {
                            const isChecked = Array.isArray(answers[fieldKey]) && answers[fieldKey].includes(opt);
                            return (
                              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isReadOnly}
                                  onChange={(e) => handleCheckboxChange(fieldKey, opt, e.target.checked)}
                                  className="w-4 h-4 text-senses-primary focus:ring-senses-primary border-gray-300 rounded-sm"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* SCALE */}
                      {field.type === "SCALE" && (
                        <div className="flex flex-col gap-2 mt-1">
                          <div className="flex items-center justify-between gap-1 max-w-md bg-gray-50 p-3 rounded-lg border">
                            {Array.from(
                              { length: (field.scaleMax || 5) - (field.scaleMin || 1) + 1 },
                              (_, i) => (field.scaleMin || 1) + i
                            ).map((val) => {
                              const isSelected = Number(answers[fieldKey]) === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  disabled={isReadOnly}
                                  onClick={() => handleChange(fieldKey, val)}
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                    isSelected
                                      ? "bg-senses-primary text-white shadow-md transform scale-110"
                                      : "bg-white text-gray-700 border hover:bg-gray-100 disabled:hover:bg-white"
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex justify-between max-w-md px-1 text-xs text-muted-foreground">
                            <span>Mínimo: {field.scaleMin || 1}</span>
                            <span>Máximo: {field.scaleMax || 5}</span>
                          </div>
                        </div>
                      )}

                      {hasError && (
                        <span className="text-xs text-red-500 font-medium">
                          {errors[fieldKey]}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4 pt-4 border-t flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              className="bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={handleClose}
            >
              {isReadOnly ? "Cerrar" : "Cancelar"}
            </Button>
            {!isReadOnly && (
              <Button
                type="submit"
                disabled={saving}
                className="bg-senses-primary text-white hover:bg-senses-primary/95 cursor-pointer"
              >
                {saving ? "Guardando..." : "Guardar Respuestas"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
