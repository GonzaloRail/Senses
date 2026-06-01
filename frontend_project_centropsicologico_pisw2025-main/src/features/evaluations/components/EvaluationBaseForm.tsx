import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, PlusIcon, Save, X, LayoutGrid, Trash2, CheckCircle, Plus, ListPlus } from "lucide-react";
import { UploadedTest } from "./UploadedTest";
import { type UseFormReturn } from "react-hook-form";
import { type EvaluationFormSchema } from "@/shared/interfaces/forms/EvaluationFormSchema";
import { SiteHeader } from "@/shared/components/SiteHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { Loading } from "@/shared/components/Loading";
import { useState } from "react";
import { useAlert } from "@/shared/hooks/useAlert";

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

// PROTOTIPO HÍBRIDO: Interfaz para preguntas dinámicas con soporte para opción múltiple
interface FormQuestion {
  id: string;
  label: string;
  type: "number" | "text" | "checkbox" | "select";
  required: boolean;
  options?: string[]; // NUEVO: Opciones para selección múltiple
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
  const { showAlert } = useAlert();

  const {
    handleSubmit,
    watch,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = form;

  const psychologicalTests = watch("psychologicalTests");

  // PROTOTIPO HÍBRIDO: Estados locales del Form Builder Inline
  const [isDesigningForm, setIsDesigningForm] = useState(false);
  const [inlineTestName, setInlineTestName] = useState("");
  const [inlineTestDesc, setInlineTestDesc] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[]>([]);

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

  // PROTOTIPO HÍBRIDO: Funciones para gestionar el Form Builder Inline
  const addQuestionField = (type: "number" | "text" | "checkbox" | "select") => {
    const labels = {
      number: "Nueva Medida (Ej: Peso kg)",
      text: "Nueva Pregunta (Ej: Síntomas)",
      checkbox: "Opción Sí/No (Ej: ¿Es alérgico?)",
      select: "Nueva Opción Múltiple (Ej: Frecuencia de síntomas)"
    };
    
    const newQuestion: FormQuestion = {
      id: `campo_${Date.now()}`,
      label: labels[type],
      type,
      required: false,
      // Si es selección múltiple, inicializamos con dos opciones por defecto
      options: type === "select" ? ["Opción A", "Opción B"] : undefined
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const updateQuestionLabel = (id: string, newLabel: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, label: newLabel } : q))
    );
  };

  const updateQuestionRequired = (id: string, required: boolean) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, required } : q))
    );
  };

  const removeQuestionField = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // PROTOTIPO HÍBRIDO: Funciones especiales para Opción Múltiple
  const addOptionToQuestion = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: [...q.options, `Opción ${q.options.length + 1}`] };
        }
        return q;
      })
    );
  };

  const updateOptionValue = (questionId: string, optionIndex: number, newValue: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          const newOpts = [...q.options];
          newOpts[optionIndex] = newValue;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const removeOptionFromQuestion = (questionId: string, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: q.options.filter((_, idx) => idx !== optionIndex)
          };
        }
        return q;
      })
    );
  };

  const handleSaveInlineForm = () => {
    if (!inlineTestName.trim()) {
      showAlert("El nombre de la prueba es requerido", "error");
      return;
    }

    if (questions.length === 0) {
      showAlert("Debe agregar al menos una pregunta a su Formulario Digital", "error");
      return;
    }

    // Validar que las preguntas de opción múltiple tengan opciones
    const hasInvalidSelect = questions.some(q => q.type === 'select' && (!q.options || q.options.length === 0));
    if (hasInvalidSelect) {
      showAlert("Las preguntas de opción múltiple deben tener al menos una opción", "error");
      return;
    }

    const newTest = {
      name: inlineTestName,
      description: inlineTestDesc,
      filename: `${inlineTestName.toLowerCase().replace(/\s+/g, "_")}_form.pdf`,
      isNew: true,
      templateContent: JSON.stringify(questions), // Serializamos el esquema completo
    };

    const currentTests = getValues("psychologicalTests") || [];
    setValue("psychologicalTests", [...currentTests, newTest]);

    // Limpiar estados locales
    setInlineTestName("");
    setInlineTestDesc("");
    setQuestions([]);
    setIsDesigningForm(false);
    showAlert("Formulario digital agregado temporalmente con éxito. Guarda la evaluación para confirmar.", "success");
  };

  const handleCancelInlineForm = () => {
    setInlineTestName("");
    setInlineTestDesc("");
    setQuestions([]);
    setIsDesigningForm(false);
  };

  if (loading) {
    return <Loading message="Cargando evaluación..." />;
  }

  return (
    <div className="h-screen flex flex-col">
      <SiteHeader title={getTitle()} />
      <form onSubmit={handleSubmit(onSubmit)} className="h-full">
        <div className="h-full flex flex-col p-2 gap-5 flex-1 overflow-y-auto custom-scroll pb-16">
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
                  className={`font-light ${errors ? "text-red-500" : "text-slate-400"}`}
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
          </div>

          <div className="flex flex-col w-full items-center px-2 gap-3">
            {/* Botones de creación: Visibles solo si no estamos diseñando inline */}
            {!isViewMode && onOpenTestModal && !isDesigningForm && (
              <>
                <div className="w-full md:w-8/10 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      onOpenTestModal();
                    }}
                    className="cursor-pointer bg-senses-primary text-white hover:bg-senses-primary hover:text-white"
                  >
                    <PlusIcon className="w-4 h-4 mr-1.5" />
                    <span>Agregar Plantilla Word</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setIsDesigningForm(true);
                    }}
                    className="cursor-pointer bg-green-600 text-white hover:bg-green-700 hover:text-white border-green-600"
                  >
                    <LayoutGrid className="w-4 h-4 mr-1.5" />
                    <span>Crear Formulario Digital</span>
                  </Button>
                </div>
              </>
            )}

            {/* PROTOTIPO HÍBRIDO: Área de Trabajo de Diseño de Formulario Inline (Ampliado en página) */}
            {isDesigningForm && (
              <div className="w-full md:w-8/10 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="font-bold text-senses-primary text-base flex items-center gap-2 font-outfit">
                    <LayoutGrid className="text-senses-secondary w-5 h-5" />
                    Diseñador de Formulario Clínico Digital (Área de Trabajo Ampliada)
                  </h3>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Modo Inline Completo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                      Nombre de la Prueba / Formulario
                    </Label>
                    <Input
                      placeholder="Ej: Ficha de Triaje"
                      value={inlineTestName}
                      onChange={(e) => setInlineTestName(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                      Descripción de la Prueba
                    </Label>
                    <Input
                      placeholder="Ej: Medidas antropométricas iniciales"
                      value={inlineTestDesc}
                      onChange={(e) => setInlineTestDesc(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Preguntas dynamic builder */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 mt-2 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-200">
                    <Label className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                      Preguntas y Campos Clínicos del Formulario ({questions.length})
                    </Label>
                    
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestionField("number")}
                        className="h-7 text-[10px] font-bold px-2.5 cursor-pointer bg-white"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Número
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestionField("text")}
                        className="h-7 text-[10px] font-bold px-2.5 cursor-pointer bg-white"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Texto
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestionField("checkbox")}
                        className="h-7 text-[10px] font-bold px-2.5 cursor-pointer bg-white"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Sí/No
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestionField("select")}
                        className="h-7 text-[10px] font-bold px-2.5 cursor-pointer bg-white text-senses-primary border-senses-secondary"
                      >
                        <ListPlus className="w-3 h-3 mr-1 text-senses-secondary" /> Opción Múltiple
                      </Button>
                    </div>
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic">
                      Aún no has agregado preguntas clínicas. Usa los botones de arriba para construir tu formulario.
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-96 overflow-y-auto custom-scroll pr-1">
                      {questions.map((q, index) => (
                        <div key={q.id} className="flex flex-col gap-2.5 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-bold">{index + 1}</span>
                            
                            <Input
                              value={q.label}
                              onChange={(e) => updateQuestionLabel(q.id, e.target.value)}
                              className="h-8 text-xs flex-1 rounded font-semibold text-slate-700"
                              placeholder="Pregunta del Formulario (Ej: Frecuencia de síntomas)"
                            />

                            <span className={`text-[9px] px-2.5 py-1 rounded font-bold uppercase tracking-wider shrink-0 ${
                              q.type === "number" ? "bg-blue-50 text-blue-600" :
                              q.type === "checkbox" ? "bg-amber-50 text-amber-600" : 
                              q.type === "select" ? "bg-purple-50 text-purple-600" : "bg-slate-100 text-slate-500"
                            }`}>
                              {q.type === "number" ? "Num" : q.type === "checkbox" ? "Sí/No" : q.type === "select" ? "Opc. Múltiple" : "Txt"}
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <input
                                type="checkbox"
                                checked={q.required}
                                onChange={(e) => updateQuestionRequired(q.id, e.target.checked)}
                                className="w-3.5 h-3.5 text-senses-secondary rounded cursor-pointer"
                              />
                              <span className="text-[9px] text-slate-400 font-bold uppercase select-none">Oblig</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeQuestionField(q.id)}
                              className="text-slate-400 hover:text-senses-danger transition-all p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* PROTOTIPO HÍBRIDO: Panel de Opciones para Opción Múltiple (select) */}
                          {q.type === "select" && q.options && (
                            <div className="pl-6 border-l-2 border-purple-100 space-y-2 mt-1">
                              <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Opciones de Respuesta:</div>
                              <div className="flex flex-wrap gap-2">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-1 bg-purple-50/50 border border-purple-100 rounded-lg px-2 py-1">
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateOptionValue(q.id, optIdx, e.target.value)}
                                      className="bg-transparent text-xs text-purple-900 focus:outline-none w-24 font-medium"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeOptionFromQuestion(q.id, optIdx)}
                                      className="text-purple-400 hover:text-senses-danger transition-all"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addOptionToQuestion(q.id)}
                                  className="text-[10px] text-purple-600 hover:text-purple-800 font-bold flex items-center gap-0.5 border border-dashed border-purple-200 rounded-lg px-2.5 py-1 bg-white hover:bg-purple-50 transition-all cursor-pointer"
                                >
                                  + Opción
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleCancelInlineForm}
                    className="bg-senses-danger text-white hover:bg-senses-danger/80 hover:text-white"
                  >
                    Cancelar Diseño
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveInlineForm}
                    className="bg-senses-primary text-white hover:bg-senses-primary/80 hover:text-white"
                  >
                    Guardar Formulario
                  </Button>
                </div>
              </div>
            )}

            {/* Listado de Pruebas agregadas (Word o Formulario) */}
            {!isDesigningForm && (
              <div className="w-full md:w-8/10 grid gap-3 xl:grid-cols-2 mt-2">
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
            )}
          </div>

          {/* Botones de acción general de la Evaluación */}
          {!isDesigningForm && (
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
          )}
        </div>
      </form>
    </div>
  );
};
