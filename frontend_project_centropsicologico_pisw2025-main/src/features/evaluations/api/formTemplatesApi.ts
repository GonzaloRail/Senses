import api from "@/api/api";

export interface FormFieldPayload {
  id?: string;
  label: string;
  type: "TEXT" | "TEXTAREA" | "NUMBER" | "DATE" | "SELECT" | "RADIO" | "CHECKBOX" | "SCALE";
  required: boolean;
  order: number;
  placeholder?: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  helpText?: string;
}

export interface CreateFormTemplatePayload {
  name: string;
  description?: string;
  isDefault?: boolean;
  fieldsSchema: FormFieldPayload[];
  createdById: string;
  testId?: string;
}

export interface UpdateFormTemplatePayload {
  name?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  fieldsSchema?: FormFieldPayload[];
  testId?: string | null;
}

export const createFormTemplateApi = async ({
  formTemplate,
}: {
  formTemplate: CreateFormTemplatePayload;
}) => {
  const response = await api.post(`/api/v1/form-templates`, formTemplate);
  return response.data;
};

export const getFormTemplateByTestIdApi = async (testId: string) => {
  const response = await api.get(`/api/v1/form-templates/test/${testId}`);
  return response.data;
};

export const updateFormTemplateApi = async ({
  id,
  formTemplate,
}: {
  id: string;
  formTemplate: UpdateFormTemplatePayload;
}) => {
  const response = await api.put(`/api/v1/form-templates/${id}`, formTemplate);
  return response.data;
};

export const deleteFormTemplateApi = async (id: string) => {
  const response = await api.delete(`/api/v1/form-templates/${id}`);
  return response.data;
};
