import axios, { type AxiosInstance } from "axios";

// --- Configuration & Setup ---

// !! IMPORTANT !! Replace these placeholders with your actual Mayan EDMS details.
const BASE_URL = "http://localhost/api/v4";
const API_TOKEN = "2a705bbb9189f6ac74105a0860eb9874b2469ab3";
// The Search Model PK (Primary Key) for documents is often '1'. Verify this on your instance.
const DOCUMENT_SEARCH_MODEL_PK = 1;

// Axios instance configured for Mayan EDMS API
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    // Using Token Authentication. Adjust if you use Basic Auth or another method.
    Authorization: `Token ${API_TOKEN}`,
    Accept: "application/json",
  },
});

// --- Interfaces for Type Safety ---

/** Defines the core structure of a Mayan EDMS document object returned by the API. */
interface Document {
  id: number;
  label: string;
  uuid: string;
  document_type: {
    id: number;
    label: string;
    url: string;
  };
  datetime_created: string;
  // Add other properties you need (e.g., latest_version, description, etc.)
}

/** Payload for creating (uploading) a new document. */
interface DocumentCreationPayload {
  document_type_id: number; // Required ID of the document type
  label?: string;
  description?: string;
}

/** Payload for updating an existing document's metadata. */
interface DocumentUpdatePayload {
  label?: string;
  description?: string;
  // Add other fields that can be updated (e.g., cabinet_id, etc.)
}

/** Parameters for searching documents. */
interface DocumentSearchParams {
  q: string; // The search query string (e.g., text, document content, metadata)
  document_type_id?: number; // Optional filter by document type
  limit?: number; // Pagination limit
  offset?: number; // Pagination offset
}

/** Structure of the document search results from the API. */
interface SearchResults {
  results: Document[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ----------------------------------------------------------------------
// ## ➕ Add Document (Upload)
// ----------------------------------------------------------------------

/**
 * Adds a new document to Mayan EDMS by uploading a file.
 * @param file The File object to upload.
 * @param payload Metadata for the new document (requires document_type_id).
 * @returns A promise that resolves to the created Document object.
 */
export async function addDocument(
  file: File,
  payload: DocumentCreationPayload
): Promise<Document> {
  const formData = new FormData();

  // The API requires the file in a field named 'file'
  formData.append("file", file, file.name);

  // Required metadata fields
  formData.append("document_type_id", payload.document_type_id.toString());
  if (payload.label) formData.append("label", payload.label);
  if (payload.description) formData.append("description", payload.description);

  const endpoint = `/documents`;

  try {
    const response = await api.post(endpoint, formData, {
      // Must explicitly use 'multipart/form-data' for file uploads
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as Document;
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// ## ✏️ Edit Document
// ----------------------------------------------------------------------

/**
 * Edits the metadata or label of an existing document using the PATCH method.
 * @param documentId The ID of the document to update.
 * @param payload The fields to update (e.g., label, description).
 * @returns A promise that resolves to the updated Document object.
 */
export async function editDocument(
  documentId: number,
  payload: DocumentUpdatePayload
): Promise<Document> {
  const endpoint = `/documents/${documentId}`;

  try {
    // PATCH is used for partial updates
    const response = await api.patch(endpoint, payload);
    return response.data as Document;
  } catch (error) {
    console.error(`Error editing document ${documentId}:`, error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// ## 🗑️ Remove Document
// ----------------------------------------------------------------------

/**
 * Removes (deletes) a document by its ID.
 * @param documentId The ID of the document to delete.
 * @returns A promise that resolves when the document is successfully deleted (204 No Content).
 */
export async function removeDocument(documentId: number): Promise<void> {
  const endpoint = `/documents/${documentId}`;

  try {
    await api.delete(endpoint);
  } catch (error) {
    console.error(`Error removing document ${documentId}:`, error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// ## 🔍 Search Document
// ----------------------------------------------------------------------

/**
 * Searches for documents using the Mayan EDMS search API.
 * @param params The search parameters.
 * @returns A promise that resolves to the search results object.
 */
export async function searchDocuments(
  params: DocumentSearchParams
): Promise<SearchResults> {
  // Uses the configured search model ID for documents
  const endpoint = `/search/${DOCUMENT_SEARCH_MODEL_PK}/`;

  try {
    // Query parameters are passed in the second argument of api.get
    const response = await api.get(endpoint, {
      params: {
        q: params.q,
        // Map friendly interface property to the required API filter name
        ...(params.document_type_id && {
          document_type__id: params.document_type_id,
        }),
        ...(params.limit && { limit: params.limit }),
        ...(params.offset && { offset: params.offset }),
      },
    });
    return response.data as SearchResults;
  } catch (error) {
    console.error("Error searching documents:", error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// ## Example Usage (Requires an environment where 'File' object exists)
// ----------------------------------------------------------------------

/*
// Example of how to use these functions (assuming you are in a browser or Node environment that supports 'File' and 'FormData'):

async function main() {
  // 1. **Setup a Dummy File** (Only for demonstration in a test environment)
  // In a real application, you'd get this from an HTML <input type="file">
  const dummyFile = new File(['This is the content of the document.'], 'test-document.txt', { type: 'text/plain' });
  const dummyDocumentTypeId = 1; // Replace with a valid ID from your Mayan EDMS setup

  // 2. **Add Document**
  try {
    console.log('Attempting to add document...');
    const newDoc = await addDocument(dummyFile, { 
      document_type_id: dummyDocumentTypeId, 
      label: 'My New API Document',
      description: 'Uploaded via TypeScript client',
    });
    console.log('Document Added successfully! ID:', newDoc.id);
    
    // 3. **Edit Document**
    const updatedDoc = await editDocument(newDoc.id, {
      label: 'My Renamed API Document',
    });
    console.log('Document Edited successfully! New Label:', updatedDoc.label);

    // 4. **Search Document**
    const searchResults = await searchDocuments({ 
      q: 'Renamed',
      document_type_id: dummyDocumentTypeId,
      limit: 10
    });
    console.log(`Found ${searchResults.count} results matching 'Renamed'.`);
    
    // 5. **Remove Document**
    console.log('Attempting to remove document...');
    await removeDocument(newDoc.id);
    console.log(`Document ${newDoc.id} removed successfully.`);
    
  } catch (error) {
    console.error('An error occurred during the demonstration:', error);
  }
}

// main(); 
*/
