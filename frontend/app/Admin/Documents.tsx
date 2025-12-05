"use client";
import { useState, useEffect, useCallback } from "react";
import {
  DocumentList,
  UploadZone,
  DocumentViewer,
  ConfirmDialog,
  AnalyticsDashboard,
} from "../components/documents";
import { useTheme } from "../Zustand/themeStore";
import { LayoutDashboard, FileText, Upload, BarChart3 } from "lucide-react";

type TabType = "overview" | "documents" | "upload" | "analytics";

export const Documents = () => {
  const [documents, setDocuments] = useState<AuthDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedDocument, setSelectedDocument] = useState<AuthDocument | null>(
    null,
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AuthDocument | null>(null);
  const [currentFilter, setCurrentFilter] = useState<DocumentFilter>({});
  const theme = useTheme();
  const isDark = theme === "dark";

  // Load all documents (admin sees all)
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await mockApiService.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleViewDocument = (doc: AuthDocument) => {
    setSelectedDocument(doc);
    setIsViewerOpen(true);
  };

  const handleDownloadDocument = (doc: AuthDocument) => {
    // Simulate download
    console.log("Downloading:", doc.title);
    alert(
      `Downloading "${doc.title}"...\n\nIn a real app, this would download from: ${doc.fileUrl}`,
    );
  };

  const handleDeleteDocument = (doc: AuthDocument) => {
    setDeleteTarget(doc);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !user) return;

    try {
      await mockApiService.deleteDocument(
        deleteTarget.id,
        user.id,
        user.role === "admin",
      );
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document");
    }
  };

  const handleUploadComplete = async (uploadedDocs: AuthDocument[]) => {
    // Reload documents to get the newly uploaded ones
    await loadDocuments();
  };

  const handleFilterChange = (filter: DocumentFilter) => {
    setCurrentFilter(filter);
  };

  const tabs: { id: TabType; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "documents", label: "All Documents", icon: FileText },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div
        className={`flex space-x-1 p-1 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? isDark
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 shadow-sm"
                  : isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Total Documents
              </p>
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {documents.length}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Total Size
              </p>
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {(
                  documents.reduce((acc, d) => acc + d.fileSize, 0) /
                  (1024 * 1024)
                ).toFixed(1)}{" "}
                MB
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Unique Owners
              </p>
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {new Set(documents.map((d) => d.ownerId)).size}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                File Types
              </p>
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {new Set(documents.map((d) => d.fileType)).size}
              </p>
            </div>
          </div>

          {/* Recent Documents */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Recent Documents
            </h3>
            <DocumentList
              documents={documents.slice(0, 6)}
              onView={handleViewDocument}
              onDownload={handleDownloadDocument}
              onDelete={handleDeleteDocument}
              isLoading={isLoading}
              isAdmin={true}
              showFilters={false}
            />
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <DocumentList
          documents={documents}
          onView={handleViewDocument}
          onDownload={handleDownloadDocument}
          onDelete={handleDeleteDocument}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
          isAdmin={true}
        />
      )}

      {activeTab === "upload" && (
        <div className="space-y-6">
          <div>
            <h3
              className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Upload New Documents
            </h3>
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              As an admin, you can upload documents that will be attributed to
              your account.
            </p>
          </div>
          <UploadZone
            onUploadComplete={handleUploadComplete}
            userId={user?.id || ""}
            maxFiles={10}
          />
        </div>
      )}

      {activeTab === "analytics" && (
        <AnalyticsDashboard documents={documents} />
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedDocument(null);
          }}
          onDownload={() => handleDownloadDocument(selectedDocument)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        variant="danger"
      />
    </div>
  );
};
