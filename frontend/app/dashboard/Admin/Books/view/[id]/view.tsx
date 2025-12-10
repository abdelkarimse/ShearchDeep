"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
  getPageById,
} from "@/app/dashboard/apiService";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import PopupReader from "./popup-reader";
import { connectWebSocket, disconnectWebSocket, sendActionMessage, WebsocketMessagae } from "@/app/dashboard/webSocketConnection";
import { on } from "events";
import { useReaderStore } from "@/app/Zustand/readerStore";
import type { Reader } from "@/app/Zustand/readerStore";

interface Page {
  id: number;
  image_url: string;
}

export default function DocumentViewPage() {
  const params = useParams();
  const documentId = params?.id as string;
  const { data: session } = useSession() as { data: Session | null };

  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [document, setDocument] = useState<MayanDocument | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [pageImageUrls, setPageImageUrls] = useState<Record<number, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [isReaderPopupOpen, setIsReaderPopupOpen] = useState(false);
  const bookRef = useRef<any>(null);

  const readersList = useReaderStore((state) => state.readers);
  const addReader = useReaderStore((state) => state.addReader);
  const removeReader = useReaderStore((state) => state.removeReader);
  const toggleBlockReader = useReaderStore((state) => state.toggleBlockReader);
  const [stompClient, setStompClient] = useState<any>(null);
  const readers = useMemo(() => readersList.filter(reader => reader.documentId === documentId), [readersList, documentId]); 
  const hasReaders = useMemo(() => readers.filter(reader => reader.readTime < 10).length > 0, [readers]); 
  console.log("All readers:", readersList);
  console.log("Filtered readers for document", documentId, ":", readers); 
  const onActionMessage = (message: WebsocketMessagae) => {
    console.log("Received WebSocket message:", message);
    if(message.typeMessage === "GETBOOKSVIWER" ) {
      const updatedReader: Reader = {
        id: message.senderId,
        username: message.user?.username || "Unknown",
        email: message.user?.email || "No email",
        readTime: message.user?.readTime || 0,
        lastAccessed: message.user?.lastAccessed || new Date().toISOString(),
        isBlocked: message.user?.isBlocked || false,
        documentId: documentId,
      };
      addReader(updatedReader);
    }
    if(message.typeMessage === "CLOSEBOOKSVIWER" ) {
      removeReader(message.senderId);
    }
  };

  useEffect(() => {
    if (session?.accessToken && documentId && session?.user?.id) {
      const client = connectWebSocket(session, session.accessToken, onActionMessage);
      setStompClient(client);
      
      const checkConnectionAndSend = setInterval(() => {
        if (client?.connected) {
          sendActionMessage(
            {
              senderId: session.user.id,
              typeMessage: "GETBOOKSVIWER",
              documentId: documentId,
            },
            session.accessToken,
            client
          );
          clearInterval(checkConnectionAndSend);
        }
      }, 100);

      return () => {
        clearInterval(checkConnectionAndSend);
        disconnectWebSocket();
      };
    }
  }, [documentId]);

  const extractFromUrl = (url: string) => {
    const parts = url.split("/").filter(Boolean);

    const documentId = parts[parts.indexOf("documents") + 1];
    const fileId = parts[parts.indexOf("files") + 1];
    const pageId = parts[parts.indexOf("pages") + 1];

    return { documentId, fileId, pageId };
  };

  useEffect(() => {
    if (session?.accessToken && documentId) {
      setTokenHeader(session.accessToken);
      // Fetch document data from API
      getMayanDocumentById(documentId)
        .then((response) => {
          setDocument(response.data);
          // Map API response to Page interface
          const documentPages: Page[] = response.data.results.map(
            (page: any) => ({
              id: page.id,
              image_url: page.image_url,
            })
          );
          console.log("Mapped pages:", documentPages);
          setPages(documentPages);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching document:", error);
          setPages([
            {
              id: 1,
              image_url: "https://via.placeholder.com/600x800?text=Page+1",
            },
            {
              id: 2,
              image_url: "https://via.placeholder.com/600x800?text=Page+2",
            },
          ]);
          setLoading(false);
        });
    }
  }, [session, documentId]);

  // Fetch blob images and convert to object URLs
  useEffect(() => {
    if (!pages.length || !session?.accessToken) return;

    const fetchImages = async () => {
      const imageUrlMap: Record<number, string> = {};

      for (const page of pages) {
        try {
          const { documentId, fileId, pageId } = extractFromUrl(page.image_url);
          const response = await getPageById(documentId, fileId, pageId);

          // Create object URL from blob
          const blob = response.data;
          const objectUrl = URL.createObjectURL(blob);
          imageUrlMap[page.id] = objectUrl;
        } catch (error) {
          console.error(`Error fetching image for page ${page.id}:`, error);
        }
      }

      setPageImageUrls(imageUrlMap);
    };

    fetchImages();

    // Cleanup: revoke object URLs when component unmounts or pages change
    return () => {
      Object.values(pageImageUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, session?.accessToken]);

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
    sendActionMessage(
      {
        senderId: userId,
        typeMessage: "Bloc_VIEWED",
        documentId: documentId,
      },
      session?.accessToken || "",
      stompClient
    );
    toggleBlockReader(userId);
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
                {pageImageUrls[page.id] ? (
                  <img
                    src={pageImageUrls[page.id]}
                    alt={`Page ${page.id}`}
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-gray-500">Loading...</div>
                )}
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
