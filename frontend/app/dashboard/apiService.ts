import axios, { AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to log requests
apiClient.interceptors.request.use((config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
    headers: config.headers,
  });
  return config;
}, (error) => {
  console.error("[API Request Error]", error);
  return Promise.reject(error);
});

// Add response interceptor to log responses
apiClient.interceptors.response.use((response) => {
  console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
  return response;
}, (error) => {
  console.error("[API Response Error]", {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    code: error.code,
    fullError: error.toString(),
  });
  return Promise.reject(error);
});

export function setTokenHeader(token: string) {
  console.log("Setting token header");
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export interface UserRepresentation {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  attributes: { [key: string]: string[] };
}

export interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
}

export interface MayanDocument {
  id: number;
  uuid: string;
  label: string;
  description: string;
  language: string;
  url: string;
  datetime_created: string;
  document_type: {
    id: number;
    label: string;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DocumentUploadParams {
  label: string;
  description: string;
  document_type_id: number;
}

export interface AiSummarizeResponse {
  summary: string;
  keywords: string[];
}

export interface GetDocumentsQueryParams {
  ordering?: string;
  page?: number;
  pageSize?: number;
}

export const getUserById = (
  userId: string
): Promise<AxiosResponse<UserRepresentation>> => {
  const url = `/users/${userId}`;
  return apiClient.get(url);
};

export const updateUser = (
  userId: string,
  data: Partial<UserRepresentation>
): Promise<AxiosResponse> => {
  const url = `/users/${userId}`;
  return apiClient.put(url, data);
};

export const deleteUser = (userId: string): Promise<AxiosResponse> => {
  const url = `/users/${userId}`;
  return apiClient.delete(url);
};

export const getAllUsers = (): Promise<AxiosResponse<UserRepresentation[]>> => {
  const url = `/users`;
  return apiClient.get(url);
};

export const createUser = (data: UserCreatePayload): Promise<AxiosResponse> => {
  const url = `/users`;
  return apiClient.post(url, null, { params: data });
};

export const getUserByUsername = (username: string): Promise<AxiosResponse> => {
  const url = `/users/username/${username}`;
  return apiClient.get(url);
};

export const uploadMayanDocument = (
  params: DocumentUploadParams,
  file: File
): Promise<AxiosResponse<MayanDocument>> => {
  const url = `/documents/mayan/upload`;

  const formData = new FormData();
  formData.append("file", file);

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: params,
  };

  return apiClient.post(url, formData, config);
};

export const summarizeDocumentPage = (
  documentId: string,
  documentVersionId: string,
  documentVersionPageId: string,
  userId: string
): Promise<AxiosResponse<AiSummarizeResponse>> => {
  const url = `/documents/Summrize/${documentId}/versions/${documentVersionId}/pages/${documentVersionPageId}/user/${userId}`;
  return apiClient.post(url);
};

export const getMayanDocuments = (
  queryParams?: GetDocumentsQueryParams
): Promise<AxiosResponse<PaginatedResponse<MayanDocument>>> => {
  const url = `/documents/mayan`;
  return apiClient.get(url, { params: queryParams });
};

export const deleteMayanDocument = (
  documentId: string
): Promise<AxiosResponse> => {
  const url = `/documents/mayan/${documentId}`;
  return apiClient.delete(url);
};
