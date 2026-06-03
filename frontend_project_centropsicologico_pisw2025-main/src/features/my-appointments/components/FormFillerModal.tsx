import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
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
    return existingResponseData as Record<string, any>;
  }, [existingResponseData]);

  // Inicializar respuestas cuando se abre
  useEffect(() => {
    if (isOpen && parsedFieldsSchema.length > 0) {
      const initialAnswers: Record<string, any> = {};
      parsedFieldsSchema.forEach((field, index) => {
        const fieldKey = field.id || `field_${index}`;
        if (parsedExistingResponseData && parsedExistingResponseData[fieldKey] !== undefined) {
          initialAnswers[fieldKey] = parsedExistingResponseData[fieldKey];
        } else {
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
  }, [isOpen]); // solo reacciona al abrir/cerrar, no a dependencias que cambian

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const handleChange = useCallback((fieldKey: string, value: any) => {
    if (isReadOnly) return;
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
    setErrors((prev) => {
      if (!prev[fieldKey]) return prev;
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  }, [isReadOnly]);

  const handleCheckboxChange = useCallback((fieldKey: string, option: string, checked: boolean) => {
    if (isReadOnly) return;
    setAnswers((prev) => {
      const currentValues = Array.isArray(prev[fieldKey]) ? prev[fieldKey] : [];
      const newValues = checked
        ? [...currentValues, option]
        : currentValues.filter((v: string) => v !== option);
      return { ...prev, [fieldKey]: newValues };
    });
  }, [isReadOnly]);

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

  if (!isOpen) return null;

  const modalContent = (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      aria-modal="true"
      role="dialog"
      aria-label={formTemplateName}
    >
      {/* Overlay */}
      <div
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(680px, calc(100vw - 2rem))",
          maxHeight: "85vh",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              margin: 0,
              color: "var(--senses-primary, #4f46e5)",
            }}
          >
            {formTemplateName}
            {isReadOnly && (
              <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#6b7280", marginLeft: "0.5rem" }}>
                (Solo lectura)
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              fontSize: "1.25rem",
              color: "#6b7280",
              lineHeight: 1,
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem 1.5rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {sortedFields.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6b7280", padding: "2rem 0" }}>
                  Este formulario no contiene preguntas definidas.
                </p>
              ) : (
                sortedFields.map((field, index) => {
                  const fieldKey = field.id || `field_${index}`;
                  const hasError = !!errors[fieldKey];

                  const rawOptions = field.options;
                  let optionsList: string[] = [];
                  if (rawOptions) {
                    if (Array.isArray(rawOptions)) {
                      optionsList = rawOptions;
                    } else if (typeof rawOptions === "string") {
                      try {
                        optionsList = JSON.parse(rawOptions);
                      } catch {
                        optionsList = [rawOptions];
                      }
                    }
                  }

                  return (
                    <div key={fieldKey} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <Label htmlFor={fieldKey} className="font-semibold text-sm flex items-center gap-1">
                        {field.label}
                        {field.required && !isReadOnly && <span style={{ color: "#ef4444" }}>*</span>}
                      </Label>

                      {field.helpText && (
                        <span style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "-0.25rem" }}>
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
                          onChange={(e) =>
                            handleChange(fieldKey, e.target.value === "" ? "" : Number(e.target.value))
                          }
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
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                          {optionsList.map((opt) => (
                            <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                              <input
                                type="radio"
                                name={fieldKey}
                                value={opt}
                                checked={answers[fieldKey] === opt}
                                disabled={isReadOnly}
                                onChange={() => handleChange(fieldKey, opt)}
                                style={{ width: "1rem", height: "1rem" }}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* CHECKBOX */}
                      {field.type === "CHECKBOX" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                          {optionsList.map((opt) => {
                            const isChecked = Array.isArray(answers[fieldKey]) && answers[fieldKey].includes(opt);
                            return (
                              <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isReadOnly}
                                  onChange={(e) => handleCheckboxChange(fieldKey, opt, e.target.checked)}
                                  style={{ width: "1rem", height: "1rem" }}
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* SCALE */}
                      {field.type === "SCALE" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "0.25rem",
                              maxWidth: "28rem",
                              background: "#f9fafb",
                              padding: "0.75rem",
                              borderRadius: "0.5rem",
                              border: "1px solid #e5e7eb",
                            }}
                          >
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
                                  style={{
                                    width: "2.5rem",
                                    height: "2.5rem",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: "0.875rem",
                                    cursor: isReadOnly ? "not-allowed" : "pointer",
                                    border: isSelected ? "none" : "1px solid #d1d5db",
                                    background: isSelected ? "var(--senses-primary, #4f46e5)" : "white",
                                    color: isSelected ? "white" : "#374151",
                                    transition: "all 0.15s",
                                    transform: isSelected ? "scale(1.1)" : "none",
                                  }}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              maxWidth: "28rem",
                              padding: "0 0.25rem",
                              fontSize: "0.75rem",
                              color: "#6b7280",
                            }}
                          >
                            <span>Mínimo: {field.scaleMin || 1}</span>
                            <span>Máximo: {field.scaleMax || 5}</span>
                          </div>
                        </div>
                      )}

                      {hasError && (
                        <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 500 }}>
                          {errors[fieldKey]}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              flexShrink: 0,
            }}
          >
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
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
