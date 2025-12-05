import { useState } from "react";
import { useTheme } from "../Zustand/themeStore";
import type { Document } from "../types/documents";

interface DocumentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (documentData: Partial<Document>) => void;
  document?: Document;
  mode: "add" | "edit";
}

export const DocumentPopup: React.FC<DocumentPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  document,
  mode,
}) => {
  const theme = useTheme();
  const isDark = theme === "dark";

  const [formData, setFormData] = useState<Partial<Document>>(
    document || {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      size: "",
      fileType: "pdf",
    }
  );

  // Dynamic Tailwind classes based on theme
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const inputBg = isDark
    ? "bg-gray-700 text-gray-100 border-gray-600"
    : "bg-gray-50 text-gray-900 border-gray-300";
  const labelColor = isDark ? "text-gray-300" : "text-gray-700";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form data after submission
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      size: "",
      fileType: "pdf",
    });
  };

  if (!isOpen) return null;

  const overlayBg = isDark
    ? "bg-black/60 backdrop-blur-md"
    : "bg-white/50 backdrop-blur-sm";

  return (
    <div
      className={`
      fixed inset-0
      ${overlayBg}
      flex items-center justify-center
      z-50
      p-3 sm:p-6
      transition-all duration-300 ease-in-out
    `}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`${bgColor} rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md max-h-[85vh] overflow-y-auto transform scale-100 transition-all duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className={`${textColor} text-xl sm:text-2xl font-bold mb-6`}>
          {mode === "add" ? "Add New Document" : `Edit ${document?.title}`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className={`block ${labelColor} text-sm font-medium mb-2`}>
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="Enter document title"
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBg}`}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={`block ${labelColor} text-sm font-medium mb-2`}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Enter document description"
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${inputBg}`}
            />
          </div>

          {/* File Type */}
          <div>
            <label htmlFor="fileType" className={`block ${labelColor} text-sm font-medium mb-2`}>
              File Type
            </label>
            <select
              id="fileType"
              name="fileType"
              value={formData.fileType || "pdf"}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBg}`}
            >
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="xlsx">Excel</option>
              <option value="pptx">PowerPoint</option>
              <option value="doc">Doc</option>
            </select>
          </div>

          {/* Size */}
          <div>
            <label htmlFor="size" className={`block ${labelColor} text-sm font-medium mb-2`}>
              Size
            </label>
            <input
              type="text"
              id="size"
              name="size"
              value={formData.size || ""}
              onChange={handleChange}
              placeholder="e.g., 2.5 MB"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBg}`}
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className={`block ${labelColor} text-sm font-medium mb-2`}>
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date || ""}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBg}`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {mode === "add" ? "Create" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
