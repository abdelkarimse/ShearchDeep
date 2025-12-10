"use client";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { signOut } from "next-auth/react";
import { 
  LogOut, 
  FileText, 
  Eye, 
  Calendar,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { getMayanDocuments, getPageById } from "../../apiService";
import Image from "next/image";
import { useRouter } from "next/navigation";
interface Document {
  id: number;
  label: string;
  description: string;
  datetime_created: string;
  file_latest?: {
    id: number;
  };
}

interface DocumentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Document[];
}

export default function DashboardLayout() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentImages, setDocumentImages] = useState<{ [key: number]: string }>({});
  const router = useRouter();
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {

    try {
      setLoading(true);
      const response = await getMayanDocuments();
      const docs = (response.data as unknown as DocumentResponse).results || [];
      setDocuments(docs);

      docs.forEach(async (doc: Document) => {
        if (doc.id && doc.file_latest?.id) {
          try {
            const imageResponse = await getPageById(
              doc.id.toString(),
              doc.file_latest.id.toString(),
              "1" // First page
            );
            const imageUrl = URL.createObjectURL(imageResponse.data);
            setDocumentImages(prev => ({ ...prev, [doc.id]: imageUrl }));
          } catch (error) {
            console.error(`Error fetching image for document ${doc.id}:`, error);
          }
        }
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (docId: number) => {
    router.push(`/dashboard/User/view/${docId}`);

  };

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              My Documents
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {documents.length} documents available
            </p>
          </div>
          <Button
            variant="destructive"
            className="flex items-center gap-2 px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
            onClick={() => signOut()}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
              <p className="text-gray-600">Loading documents...</p>
            </div>
          </div>
        )}
        
        {!loading && documents.length === 0 && (
          <div className="text-center py-20">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No documents found</h3>
            <p className="text-gray-500">Start by uploading your first document</p>
          </div>
        )}
        
        {!loading && documents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
              >
                {/* Document Image Preview */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                  {documentImages[doc.id] ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={documentImages[doc.id]}
                        alt={doc.label}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="text-white/50" size={64} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-semibold">PDF</span>
                    </div>
                  </div>
                </div>

                {/* Document Body */}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
                    {doc.label}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {doc.description || "No description available"}
                  </p>

                  {/* Document Meta */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar size={16} />
                    <span>
                      {new Date(doc.datetime_created).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleViewDocument(doc.id)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg py-2 font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <Eye size={18} className="mr-2" />
                    View Document
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
