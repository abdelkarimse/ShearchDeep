"use client";
import React, { useState, useRef, useEffect, use } from "react";
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
  summarizeDocumentPage,
} from "@/app/dashboard/apiService";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import {
  connectWebSocket,
  sendActionMessage,
  disconnectWebSocket,
} from "@/app/dashboard/webSocketConnection";

interface Page {
  id: number;
  image_url: string;
}

interface Reader {
  id: string;
  username: string;
  email: string;
  readTime: number;
  lastAccessed: string;
  isBlocked: boolean;
}

export default function DocumentViewPage({
  setResponse,
  setVisible
}: {
  setResponse: any;
  setVisible: any;
}) {
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
  const bookRef = useRef<any>(null);

  const extractFromUrl = (url: string) => {
    const parts = url.split("/").filter(Boolean);

    const documentId = parts[parts.indexOf("documents") + 1];
    const fileId = parts[parts.indexOf("files") + 1];
    const pageId = parts[parts.indexOf("pages") + 1];

    return { documentId, fileId, pageId };
  };

  const [stompClient, setStompClient] = useState<any>(null);

  useEffect(() => {
    if (session?.accessToken && documentId && session?.user?.id) {
      const client = connectWebSocket(session, session.accessToken);
      setStompClient(client);
      
      // Wait for connection before sending message
      const checkConnectionAndSend = setInterval(() => {
        if (client?.connected) {
          sendActionMessage(
            {
              senderId: session.user.id,
              typeMessage: "DOCUMENT8Viewed",
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
        if (client?.connected) {
          sendActionMessage(
            {
              senderId: session.user.id,
              typeMessage: "CLOSEBOOKSVIWER",
              documentId: documentId,
            },
            session.accessToken,
            client
          );
        }
        disconnectWebSocket();
      };
    }
  }, [session, documentId]);

  // Handle page close/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session?.accessToken && session?.user?.id && documentId && stompClient?.connected) {
        sendActionMessage(
          {
            senderId: session.user.id,
            typeMessage: "CLOSEBOOKSVIWER",
            documentId: documentId,
          },
          session.accessToken,
          stompClient
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session, documentId, stompClient]);

  useEffect(() => {
    if (session?.accessToken && documentId) {
      setTokenHeader(session.accessToken);
      // Fetch document data from API
      getMayanDocumentById(documentId)
        .then((response) => {
          console.log("Fetched document:", response.data);
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

    return () => {
      Object.values(pageImageUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [pages, session?.accessToken]);

  useEffect(() => {
    setResponse(null);
    setVisible(false);
  }, [currentPage]);

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
    if (session?.user?.id && session?.accessToken && stompClient?.connected) {
      sendActionMessage(
        {
          senderId: session.user.id,
          typeMessage: "CLOSEBOOKSVIWER",
          documentId: documentId,
        },
        session.accessToken,
        stompClient
      );
    }
    globalThis.history.back();
  };
  const handleSumerize = (page :Page ) => {
    setVisible(true);
    const { documentId, fileId, pageId } = extractFromUrl(page.image_url);
    const   userid=session?.user.id as string;
    summarizeDocumentPage(documentId, fileId, pageId, userid).then((res)=>setResponse(res.data));
    
  }

 
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
              onClick={() => {
                handleSumerize(pages[currentPage]);
              }}
              className="relative flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-md transition font-medium"
              type="button"
            >
              <FlagTriangleRight className="w-5 h-5" />
              Summerize
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
    </div>
  );
}
