"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  FlagTriangleRight,
} from "lucide-react";

import {
  getMayanDocumentById,
  setTokenHeader,
  MayanDocument,
} from "@/app/dashboard/apiService";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import PopupReader, { Reader } from "./popup-reader";

interface Page {
  id: number;
  content: string;
  image: string;
}

export default function DocumentViewPage() {
  const params = useParams();
  const documentId = params?.id as string;
  const { data: session } = useSession() as { data: Session | null };

  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [document, setDocument] = useState<MayanDocument | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReaderPopupOpen, setIsReaderPopupOpen] = useState(false);
  const bookRef = useRef<any>(null);

  // Sample readers data - TODO: Fetch from API
  const [readers, setReaders] = useState<Reader[]>([
    {
      id: "1",
      username: "John Doe",
      email: "john.doe@example.com",
      readTime: 45,
      lastAccessed: "2025-12-09T10:30:00.000Z",
      isBlocked: false,
    },
    {
      id: "2",
      username: "Jane Smith",
      email: "jane.smith@example.com",
      readTime: 30,
      lastAccessed: "2025-12-08T14:20:00.000Z",
      isBlocked: false,
    },
    {
      id: "3",
      username: "Bob Johnson",
      email: "bob.johnson@example.com",
      readTime: 15,
      lastAccessed: "2025-12-07T09:15:00.000Z",
      isBlocked: true,
    },
  ]);
  const hasReaders = readers.length > 0;

  useEffect(() => {
    if (session?.accessToken && documentId) {
      setTokenHeader(session.accessToken);
      // Fetch document data from API
      getMayanDocumentById(documentId)
        .then((response) => {
          setDocument(response.data);
          // TODO: Fetch actual pages from Mayan EDMS API
          // For now, use placeholder pages
          const documentPages: Page[] = [
            {
              id: 1,
              content: `Document: ${response.data.label}`,
              image: "https://via.placeholder.com/600x800?text=Page+1",
            },
            {
              id: 2,
              content: "Page 2: Document Content",
              image: "https://via.placeholder.com/600x800?text=Page+2",
            },
            {
              id: 3,
              content: "Page 3: Additional Content",
              image: "https://via.placeholder.com/600x800?text=Page+3",
            },
          ];
          setPages(documentPages);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching document:", error);
          // Fallback to sample pages
          setPages([
            {
              id: 1,
              content: `Document ID: ${documentId}`,
              image: "https://via.placeholder.com/600x800?text=Page+1",
            },
            {
              id: 2,
              content: "Page 2: Content",
              image: "https://via.placeholder.com/600x800?text=Page+2",
            },
          ]);
          setLoading(false);
        });
    }
  }, [session, documentId]);

  const handleNextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip()?.flipNext();
      setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
    }
  };

  const handlePrevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip()?.flipPrev();
      setCurrentPage((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.8));
  };

  const handleGoBack = () => {
    globalThis.history.back();
  };

  const handleOpenReaderPopup = () => {
    setIsReaderPopupOpen(true);
  };

  const handleBlockAccess = (userId: string) => {
    setReaders((prevReaders) =>
      prevReaders.map((reader) =>
        reader.id === userId
          ? { ...reader, isBlocked: !reader.isBlocked }
          : reader
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-black text-xl font-medium">
          Loading document...
        </div>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-black text-xl font-medium">No document found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-200 p-2  bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Go Back"
              type="button"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-2xl font-bold text-black">
              {document?.label || "Document Viewer"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-black text-sm font-medium">
              Page {currentPage + 1} of {pages.length}
            </span>
            <input
              type="range"
              min="0"
              max={pages.length - 1}
              value={currentPage}
              onChange={(e) => {
                const page = Number.parseInt(e.target.value, 10);
                setCurrentPage(page);
                if (bookRef.current) {
                  bookRef.current.pageFlip()?.turnToPage(page);
                }
              }}
              className="w-48 cursor-pointer accent-black"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Zoom Out"
              type="button"
            >
              <ZoomOut className="w-5 h-5 text-black" />
            </button>
            <span className="text-black text-sm w-12 text-center font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Zoom In"
              type="button"
            >
              <ZoomIn className="w-5 h-5 text-black" />
            </button>
            <button
              onClick={handleOpenReaderPopup}
              className="relative flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-md transition font-medium"
              type="button"
            >
              <FlagTriangleRight className="w-5 h-5" />
              View Readers
              {/* Animated Badge */}
              {hasReaders && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 overflow-auto flex items-center justify-between p-8 bg-gray-50">
        <button
          onClick={handlePrevPage}
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-md transition font-medium"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          className="flex flex-col gap-6 items-center"
        >
          <HTMLFlipBook
            width={400}
            height={500}
            size="stretch"
            minWidth={300}
            maxWidth={500}
            minHeight={400}
            maxHeight={600}
            maxShadowOpacity={0.5}
            showCover={true}
            ref={bookRef}
            className="shadow-2xl rounded-lg"
          >
            {pages.map((page) => (
              <div
                key={page.id}
                className="w-full h-full bg-white flex flex-col items-center justify-center p-8 border border-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.image}
                  alt={`Page ${page.id}`}
                  className="w-full h-full object-cover rounded"
                  loading="lazy"
                />
                <p className="mt-4 text-gray-600 text-sm">{page.content}</p>
              </div>
            ))}
          </HTMLFlipBook>
        </div>
        <button
          onClick={handleNextPage}
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-md transition font-medium"
          type="button"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Popup Reader */}
      <PopupReader
        isOpen={isReaderPopupOpen}
        onClose={() => setIsReaderPopupOpen(false)}
        documentTitle={document?.label || "Document"}
        readers={readers}
        onBlockAccess={handleBlockAccess}
      />
    </div>
  );
}
