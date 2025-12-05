import axios, { type AxiosResponse } from "axios";
import { FormData } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";

async function uploadDocumentWithAxios(
  apiBaseUrl: string,
  token: string,
  filePathOrBlob: string | Blob,
  documentTypeId: number,
  documentDescription: string = ""
): Promise<AxiosResponse> {
  const uploadUrl = `${apiBaseUrl}/documents/documents/`;

  const formData = new FormData();

  let fileToAppend;
  let fileName: string = "document.pdf";

  if (typeof filePathOrBlob === "string") {
    fileToAppend = await fileFromPath(filePathOrBlob);
    fileName = fileToAppend.name;
  } else {
    fileToAppend = filePathOrBlob;
    if ("name" in filePathOrBlob) {
      fileName = (filePathOrBlob as File).name;
    }
  }

  formData.append("file", fileToAppend, fileName);
  formData.append("document_type", documentTypeId.toString());

  if (documentDescription) {
    formData.append("description", documentDescription);
  }

  try {
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...((formData as any).getHeaders ? (formData as any).getHeaders() : {}),
      },
    });

    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Mayan EDMS API Error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else {
      throw new Error("An unexpected error occurred during upload.");
    }
  }
}
