import React, { useState, useCallback } from "react";
import axios from "axios";
import { addDocument } from "../../../apiService";

// --- Component Props Interface ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiClient: typeof axios;
  children?: React.ReactNode;
  setaction: () => void;
}

export default function Modal({
  isOpen,
  onClose,
  apiClient,
  children,
  setaction,
}: ModalProps) {
  // 1. ALL HOOK CALLS MUST BE UNCONDITIONAL AT THE TOP LEVEL
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); // This hook must be called whether the modal is open or not!

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      setSuccess(false);
      const file = event.target.files ? event.target.files[0] : null;
      setUploadedFile(file);
    },
    []
  ); // 2. THE CONDITIONAL RETURN GOES HERE, AFTER ALL HOOKS

  if (!isOpen) return null; // Determine if the form can be submitted

  const isFormValid = !!uploadedFile && !!documentTypeId; // --- API Submission Handler ---

  const handleSend = async () => {
    if (!isFormValid) {
      setError("Please upload a file and provide the document type ID.");
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false); // 1. Create FormData object

    const formData = new FormData();
    formData.append("file", uploadedFile as Blob); // Append optional fields

    if (label) {
      formData.append("label", label);
    }
    if (description) {
      formData.append("description", description);
    } // Append the required document_type_id

    formData.append("document_type_id", documentTypeId);

    try {
      // 2. API Call using your service function
      const x = await addDocument(formData);
      console.log(x);
      setaction();
      setSuccess(true); // Optional: Clear form after successful upload // setUploadedFile(null); // setLabel(""); // setDescription(""); // setDocumentTypeId(""); // Optional: Close modal after a delay // setTimeout(onClose, 2000);
    } catch (err) {
      let message = "An unknown error occurred during upload.";
      if (axios.isAxiosError(err) && err.response) {
        message =
          err.response.data.detail ||
          err.response.data.message ||
          `API Error: ${err.response.status}`;
      }
      console.error("Upload Error:", err);
      setError(message);
    } finally {
      setIsSending(false);
    }
  }; // --- JSX Rendering (Unchanged) ---

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      {" "}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full relative transform transition-all">
        {/* Close Button */}{" "}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          aria-label="Close modal"
        >
          {" "}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>{" "}
          </svg>{" "}
        </button>{" "}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Upload Document 📄{" "}
        </h2>
        {/* File Dropzone/Input */}{" "}
        <div className="flex items-center justify-center w-full mb-6">
          {" "}
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors p-4 
           ${
             uploadedFile
               ? "border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
               : "border-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
           }`}
          >
            {" "}
            <div className="flex flex-col items-center justify-center text-center">
              {" "}
              {uploadedFile ? (
                <>
                  {" "}
                  <svg
                    className="w-10 h-10 mb-3 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {" "}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>{" "}
                  </svg>{" "}
                  <p className="mb-2 text-lg font-semibold text-green-700 dark:text-green-300">
                    File Selected!{" "}
                  </p>{" "}
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-full max-w-xs">
                    {uploadedFile.name}{" "}
                  </p>{" "}
                </>
              ) : (
                <>
                  {" "}
                  <svg
                    className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                    />{" "}
                  </svg>{" "}
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    {" "}
                    <span className="font-bold text-black-600 dark:text-black-400">
                      Click to upload{" "}
                    </span>{" "}
                    or drag and drop{" "}
                  </p>{" "}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF (Max 10MB){" "}
                  </p>{" "}
                </>
              )}{" "}
            </div>{" "}
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />{" "}
          </label>{" "}
        </div>
        {/* --- Input Fields --- */} {/* Document Type ID Input (Required) */}{" "}
        <div className="flex flex-col mb-4"> </div>
        {/* Label Input */}{" "}
        <div className="flex flex-col mb-4">
          {" "}
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Document Label{" "}
          </label>{" "}
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
           focus:ring-black-500 focus:border-black-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white 
           disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:border-gray-700"
            placeholder="e.g., Q3 Report 2024"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={!uploadedFile || isSending}
          />{" "}
        </div>
        {/* Description Input */}{" "}
        <div className="flex flex-col mb-6">
          {" "}
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description{" "}
          </label>{" "}
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
           focus:ring-black-500 focus:border-black-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white 
           disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:border-gray-700"
            placeholder="A brief summary of the document"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!uploadedFile || isSending}
          />{" "}
        </div>
        {/* Status/Error Messages */}{" "}
        {error && (
          <p className="text-sm text-center text-red-500 mb-4 font-medium">
            🚨 Error: {error}{" "}
          </p>
        )}{" "}
        {success && (
          <p className="text-sm text-center text-green-600 mb-4 font-medium">
            ✅ Upload Successful!{" "}
          </p>
        )}
        {/* --- Action Button --- */}{" "}
        <div className="flex w-full justify-center">
          {" "}
          <button
            onClick={handleSend}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors duration-200 
            ${
              isFormValid && !isSending
                ? "bg-black text-white hover:bg-black-700 focus:outline-none focus:ring-4 focus:ring-black-500 focus:ring-opacity-50"
                : "bg-gray-400 text-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
            }`}
            disabled={!isFormValid || isSending}
          >
            {isSending ? "Sending..." : "Send"}{" "}
          </button>{" "}
        </div>
        {children}{" "}
      </div>{" "}
    </div>
  );
}
