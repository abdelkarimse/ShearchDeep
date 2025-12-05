import { useState } from 'react';
import { MdAdd, MdSearch, MdFilterList } from 'react-icons/md';
import { CardDocument } from './CardDocument';
import { DocumentPopup } from './DocumentPopup';
import { ConfirmDeleteDocument } from './ConfirmDeleteDocument';
import type { Document } from '../types/documents';
import { useThemeStore } from '../Zustand/themeStore';

export const DocumentsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<'add' | 'edit'>('add');
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>();
  const [documentToDelete, setDocumentToDelete] = useState<Document | undefined>();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      title: 'Project Proposal',
      description: 'Q1 2024 project proposal with detailed requirements and timeline',
      date: '2024-01-15',
      size: '2.5 MB',
      fileType: 'pdf',
    },
    {
      id: 2,
      title: 'Budget Report',
      description: 'Annual budget report for the finance department',
      date: '2024-01-10',
      size: '1.8 MB',
      fileType: 'xlsx',
    },
    {
      id: 3,
      title: 'Meeting Notes',
      description: 'Notes from the quarterly strategy meeting',
      date: '2024-01-12',
      size: '450 KB',
      fileType: 'docx',
    },
    {
      id: 4,
      title: 'Design System',
      description: 'Complete design system with components and guidelines',
      date: '2024-01-08',
      size: '5.2 MB',
      fileType: 'pdf',
    },
    {
      id: 5,
      title: 'API Documentation',
      description: 'REST API documentation with endpoints and examples',
      date: '2024-01-14',
      size: '890 KB',
      fileType: 'doc',
    },
    {
      id: 6,
      title: 'Team Presentation',
      description: 'Q4 results and Q1 goals presentation',
      date: '2024-01-09',
      size: '3.1 MB',
      fileType: 'pptx',
    },
  ]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch ;
  });

  const handleEdit = (id: number) => {
    const docToEdit = documents.find((doc) => doc.id === id);
    if (docToEdit) {
      setSelectedDocument(docToEdit);
      setPopupMode('edit');
      setIsPopupOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const docToDelete = documents.find((doc) => doc.id === id);
    if (docToDelete) {
      setDocumentToDelete(docToDelete);
      setIsDeleteOpen(true);
    }
  };

  const handleAddNew = () => {
    setSelectedDocument(undefined);
    setPopupMode('add');
    setIsPopupOpen(true);
  };

  const handlePopupSubmit = (documentData: Partial<Document>) => {
    if (popupMode === 'add') {
      const newDoc: Document = {
        id: Math.max(...documents.map((d) => d.id), 0) + 1,
        title: documentData.title || '',
        description: documentData.description || '',
        date: documentData.date || '',
        size: documentData.size || '',
        fileType: documentData.fileType || 'pdf',
      };
      setDocuments([...documents, newDoc]);
    } else if (selectedDocument) {
      setDocuments(
        documents.map((doc) =>
          doc.id === selectedDocument.id ? { ...doc, ...documentData } : doc
        )
      );
    }
    setIsPopupOpen(false);
    setSelectedDocument(undefined);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      setDocuments(documents.filter((doc) => doc.id !== documentToDelete.id));
      setIsDeleteOpen(false);
      setDocumentToDelete(undefined);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredDocuments.length} document{filteredDocuments.length === 1 ? '' : 's'}
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <MdAdd size={20} />
          New Document
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <MdSearch className={`absolute left-3 top-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isDark 
                ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <MdFilterList className={isDark ? 'text-gray-400' : 'text-gray-600'} size={20} />
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <CardDocument
              key={doc.id}
              id={doc.id}
              title={doc.title}
              description={doc.description}
              date={doc.date}
              size={doc.size}
              fileType={doc.fileType}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No documents found. Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Popups */}
      <DocumentPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handlePopupSubmit}
        document={selectedDocument}
        mode={popupMode}
      />

      <ConfirmDeleteDocument
        isOpen={isDeleteOpen}
        documentTitle={documentToDelete?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};
