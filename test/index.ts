import axios, { type AxiosResponse } from "axios";
import * as fs from "fs";
import * as path from "path";

interface DocumentUploadResponse {
  id: number;
  description: string;
  document_type: {
    id: number;
    label: string;
  };
  label: string;
  language: string;
  file_latest?: {
    comment: string;
    filename: string;
  };
}

async function uploadDocumentWithAxios(
  apiBaseUrl: string,
  username: string,
  password: string,
  filePath: string,
  documentTypeId: number,
  documentDescription: string = "",
  label: string = ""
): Promise<AxiosResponse<DocumentUploadResponse>> {
  // Dynamically import form-data (CommonJS module)
  const FormData = (await import("form-data")).default;

  // Ensure the base URL ends without trailing slash
  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  const uploadUrl = `${baseUrl}/api/v4/documents/`;

  const formData = new FormData();

  // Read the file and append it
  const fileStream = fs.createReadStream(filePath);
  const fileName = path.basename(filePath);

  // Append metadata fields before file; cast to string for form-data
  formData.append("document_type_id", documentTypeId.toString());
  formData.append("file", fileStream, fileName);

  if (documentDescription) {
    formData.append("description", documentDescription);
  }

  if (label) {
    formData.append("label", label);
  }

  // Debug: Log what we're sending
  console.log("Uploading to:", uploadUrl);
  console.log("Document Type ID:", documentTypeId);
  console.log("File:", fileName);

  try {
    const response = await axios.post<DocumentUploadResponse>(
      uploadUrl,
      formData,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString("base64")}`,
          Accept: "application/json",
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    console.log("Upload successful!");
    console.log("Document ID:", response.data.id);
    console.log("Document Label:", response.data.label);

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("API Error Details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
        throw new Error(
          `Mayan EDMS API Error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        throw new Error("No response received from server");
      }
    }
    console.error("Unexpected error:", error);
    throw new Error("An unexpected error occurred during upload.");
  }
}

// Example usage
(async () => {
  try {
    const response = await uploadDocumentWithAxios(
      "http://localhost",
      "admin",
      "anYRqN8wX5",
      "/home/ahmed/Downloads/TP2_POO_Python.pdf",
      1, // document_type_id (ensure this ID exists; Default is 1)
      "Sample Document Description"
    );

    console.log("Response:", response.data);
  } catch (error) {
    console.error("Upload failed:", error);
  }
})();
