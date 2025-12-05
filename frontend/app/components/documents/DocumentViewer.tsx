import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileText,
  AlertCircle,
  Clock,
  Tag,
  User,
  Calendar,
  HardDrive,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
import {
  getFileTypeInfo,
  canPreviewFile,
  formatFileSize,
} from "../../utils/fileTypes";
import type { AuthDocument } from "../../types/auth";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  document: AuthDocument;
  onClose: () => void;
  ownerName?: string; // For admin view
  isAdmin?: boolean;
}

type ViewerTab = "preview" | "info" | "ai";

export function DocumentViewer({
  document,
  onClose,
  ownerName,
  isAdmin = false,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<ViewerTab>("preview");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInfo = getFileTypeInfo(document.fileType);
  const canPreview = canPreviewFile(document.fileType);

  // Check temporal access
  const accessStatus = getAccessStatus(document);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(200, z + 25));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(25, z - 25));
      } else if (e.key === "r" && e.ctrlKey) {
        e.preventDefault();
        setRotation((r) => (r + 90) % 360);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isFullscreen, totalPages]);

  // Load text content for text files
  useEffect(() => {
    if (fileInfo.category === "text" || fileInfo.category === "code") {
      setIsLoading(true);
      // Simulate loading text content
      setTimeout(() => {
        const mockContent = getMockTextContent(
          document.fileType,
          document.title,
        );
        setTextContent(mockContent);
        setIsLoading(false);
      }, 500);
    }
  }, [document, fileInfo.category]);

  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 25));
  const handleZoomOut = () => setZoom((z) => Math.max(25, z - 25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleDownload = useCallback(() => {
    // Create a mock download
    const link = window.document.createElement("a");
    link.href = document.fileUrl;
    link.download = document.filename;
    link.click();
  }, [document]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      window.document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setLoadError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setLoadError(
      "Failed to load image. The file may be corrupted or unavailable.",
    );
  };

  const handleRegenerateAI = async () => {
    setIsRegenerating(true);
    // Simulate AI regeneration
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsRegenerating(false);
  };

  // Render preview content based on file type
  const renderPreview = () => {
    if (!canPreview) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
          <fileInfo.icon className={cn("w-24 h-24", fileInfo.color)} />
          <h3 className="text-xl font-semibold">Preview not available</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {fileInfo.label} files cannot be previewed in the browser. You can
            download the file to view it in a compatible application.
          </p>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download {document.filename}
          </Button>
        </div>
      );
    }

    if (
      accessStatus.type === "expired" ||
      accessStatus.type === "not-started"
    ) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
          <div
            className={cn(
              "p-4 rounded-full",
              accessStatus.type === "expired"
                ? "bg-destructive/10"
                : "bg-yellow-500/10",
            )}
          >
            <Clock
              className={cn(
                "w-16 h-16",
                accessStatus.type === "expired"
                  ? "text-destructive"
                  : "text-yellow-500",
              )}
            />
          </div>
          <h3 className="text-xl font-semibold">
            {accessStatus.type === "expired"
              ? "Access Expired"
              : "Access Not Yet Available"}
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            {accessStatus.message}
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
          <AlertCircle className="w-16 h-16 text-destructive" />
          <h3 className="text-xl font-semibold">Failed to Load</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {loadError}
          </p>
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Instead
          </Button>
        </div>
      );
    }

    // Image preview
    if (fileInfo.category === "image") {
      return (
        <div
          className="flex items-center justify-center h-full overflow-auto p-4"
          style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
        >
          <img
            src={document.fileUrl}
            alt={document.title}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      );
    }

    // PDF preview (using iframe or object)
    if (fileInfo.category === "pdf") {
      return (
        <div className="h-full w-full">
          <iframe
            src={document.fileUrl}
            className="w-full h-full border-0"
            title={document.title}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      );
    }

    // Text/Code preview
    if (fileInfo.category === "text" || fileInfo.category === "code") {
      return (
        <div className="h-full overflow-auto p-6">
          <pre
            className="font-mono text-sm whitespace-pre-wrap"
            style={{ fontSize: `${zoom / 100}rem` }}
          >
            {textContent}
          </pre>
        </div>
      );
    }

    // Video preview
    if (fileInfo.category === "video") {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <video
            src={document.fileUrl}
            controls
            className="max-w-full max-h-full rounded-lg"
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    // Audio preview
    if (fileInfo.category === "audio") {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <fileInfo.icon className={cn("w-24 h-24", fileInfo.color)} />
          <h3 className="text-xl font-semibold">{document.title}</h3>
          <audio src={document.fileUrl} controls className="w-full max-w-md">
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    return null;
  };

  // Render document info panel
  const renderInfo = () => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Document Details</h3>
        <div className="space-y-3">
          <InfoRow icon={FileText} label="Filename" value={document.filename} />
          <InfoRow
            icon={HardDrive}
            label="Size"
            value={formatFileSize(document.fileSize)}
          />
          <InfoRow
            icon={Calendar}
            label="Uploaded"
            value={format(
              new Date(document.uploadDate),
              "MMM d, yyyy 'at' h:mm a",
            )}
          />
          <InfoRow
            icon={fileInfo.icon}
            label="Type"
            value={`${fileInfo.label} (.${document.fileType})`}
          />
          {isAdmin && ownerName && (
            <InfoRow icon={User} label="Owner" value={ownerName} />
          )}
        </div>
      </div>

      {/* Access Window */}
      {(document.accessStart || document.accessEnd) && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Access Window</h3>
          <Card className={accessStatus.bgColor}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className={cn("w-4 h-4", accessStatus.iconColor)} />
                <span className={cn("font-medium", accessStatus.textColor)}>
                  {accessStatus.label}
                </span>
              </div>
              <p className={cn("text-sm", accessStatus.textColor)}>
                {accessStatus.message}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Description</h3>
        <p className="text-muted-foreground">
          {document.description || "No description available."}
        </p>
      </div>
    </div>
  );

  // Render AI analysis panel
  const renderAI = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="text-purple-500 w-5 h-5" />
          AI Analysis
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRegenerateAI}
          disabled={isRegenerating}
          className="gap-2"
        >
          <RefreshCw
            className={cn("w-4 h-4", isRegenerating && "animate-spin")}
          />
          {isRegenerating ? "Analyzing..." : "Regenerate"}
        </Button>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Summary
        </h4>
        <Card>
          <CardContent className="p-4">
            <p className="leading-relaxed">{document.aiSummary}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Keywords
        </h4>
        <div className="flex flex-wrap gap-2">
          {document.aiKeywords.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              <Tag className="w-3 h-3" />
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Confidence Score
        </h4>
        <div className="flex items-center gap-3">
          <Progress value={87} className="flex-1" />
          <span className="text-sm font-medium">87%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          High confidence in analysis accuracy
        </p>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex"
    >
      {/* Main viewer area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-card border-b">
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close (Esc)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2">
              <fileInfo.icon className={fileInfo.color} size={20} />
              <span className="font-medium truncate max-w-[300px]">
                {document.title}
              </span>
              <Badge variant="outline">{fileInfo.label}</Badge>
            </div>
          </div>

          <TooltipProvider>
            <div className="flex items-center gap-1">
              {/* Zoom controls */}
              {canPreview && fileInfo.category !== "pdf" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={zoom <= 25}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out (-)</TooltipContent>
                  </Tooltip>
                  <span className="text-sm min-w-[50px] text-center">
                    {zoom}%
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In (+)</TooltipContent>
                  </Tooltip>
                  <Separator orientation="vertical" className="h-6 mx-2" />
                </>
              )}

              {/* Rotation (for images) */}
              {fileInfo.category === "image" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleRotate}>
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rotate (Ctrl+R)</TooltipContent>
                </Tooltip>
              )}

              {/* Page navigation (for multi-page docs) */}
              {fileInfo.category === "pdf" && totalPages > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm min-w-[80px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-2" />
                </>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>

              {canPreview && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handlePrint}>
                      <Printer className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Print</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Fullscreen</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Preview area */}
        <div className="flex-1 bg-muted overflow-hidden">
          {activeTab === "preview" && renderPreview()}
          {activeTab === "info" && (
            <div className="h-full overflow-auto bg-card">{renderInfo()}</div>
          )}
          {activeTab === "ai" && (
            <div className="h-full overflow-auto bg-card">{renderAI()}</div>
          )}
        </div>
      </div>

      {/* Side panel tabs */}
      <div className="w-80 bg-card border-l flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ViewerTab)}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">{renderInfo()}</div>
        </Tabs>
      </div>
    </div>
  );
}

// Helper components
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-muted-foreground min-w-[80px]">
        {label}
      </span>
      <span className="text-sm truncate">{value}</span>
    </div>
  );
}

// Helper function to get access status
function getAccessStatus(document: AuthDocument) {
  if (!document.accessStart && !document.accessEnd) {
    return {
      type: "unrestricted" as const,
      label: "Unrestricted Access",
      message: "This document has no access restrictions.",
      bgColor: "bg-green-500/10",
      textColor: "text-green-700 dark:text-green-300",
      iconColor: "text-green-500",
    };
  }

  const startDate = document.accessStart
    ? new Date(document.accessStart)
    : null;
  const endDate = document.accessEnd ? new Date(document.accessEnd) : null;

  if (startDate && isFuture(startDate)) {
    return {
      type: "not-started" as const,
      label: "Access Not Yet Available",
      message: `Access will be available ${formatDistanceToNow(startDate, { addSuffix: true })} (${format(startDate, "MMM d, yyyy")})`,
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-700 dark:text-yellow-300",
      iconColor: "text-yellow-500",
    };
  }

  if (endDate && isPast(endDate)) {
    return {
      type: "expired" as const,
      label: "Access Expired",
      message: `Access expired ${formatDistanceToNow(endDate, { addSuffix: true })} (${format(endDate, "MMM d, yyyy")})`,
      bgColor: "bg-destructive/10",
      textColor: "text-destructive",
      iconColor: "text-destructive",
    };
  }

  if (endDate) {
    return {
      type: "active" as const,
      label: "Limited Access",
      message: `Access expires ${formatDistanceToNow(endDate, { addSuffix: true })} (${format(endDate, "MMM d, yyyy")})`,
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-700 dark:text-blue-300",
      iconColor: "text-blue-500",
    };
  }

  return {
    type: "active" as const,
    label: "Active Access",
    message: `Access available since ${format(startDate!, "MMM d, yyyy")}`,
    bgColor: "bg-green-500/10",
    textColor: "text-green-700 dark:text-green-300",
    iconColor: "text-green-500",
  };
}

// Mock text content generator
function getMockTextContent(fileType: string, title: string): string {
  if (fileType === "json") {
    return JSON.stringify(
      {
        openapi: "3.0.0",
        info: {
          title: "Document Management API",
          version: "2.0.0",
          description: "REST API for document management operations",
        },
        paths: {
          "/documents": {
            get: { summary: "List all documents" },
            post: { summary: "Upload a new document" },
          },
          "/documents/{id}": {
            get: { summary: "Get document by ID" },
            delete: { summary: "Delete document" },
          },
        },
      },
      null,
      2,
    );
  }

  if (fileType === "txt" || fileType === "md") {
    return `# ${title}

## Meeting Summary

The team discussed the following topics during the November 2024 meeting:

### Project Updates
- Phase 1 development completed on schedule
- Phase 2 requirements finalized
- Testing framework established

### Action Items
1. Review documentation by end of week
2. Complete security audit preparation
3. Schedule stakeholder demo
4. Update project timeline

### Next Steps
- Begin Phase 2 implementation
- Continue daily standups
- Prepare Q1 2025 planning

---
Meeting concluded at 4:30 PM
Notes prepared by: Meeting Secretary`;
  }

  return `Content of ${title}`;
}

export default DocumentViewer;
