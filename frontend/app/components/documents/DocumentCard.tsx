import { useState } from "react";
import {
  Eye,
  Download,
  Trash2,
  MoreVertical,
  Clock,
  Tag,
  User,
  Lock,
} from "lucide-react";
import { formatDistanceToNow, isPast, isFuture } from "date-fns";
import {
  getFileTypeInfo,
  getPlaceholderThumbnail,
  formatFileSize,
} from "../../utils/fileTypes";
import type { AuthDocument } from "../../types/auth";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: AuthDocument;
  onView: (doc: AuthDocument) => void;
  onDownload: (doc: AuthDocument) => void;
  onDelete: (doc: AuthDocument) => void;
  ownerName?: string;
  isAdmin?: boolean;
  viewMode?: "grid" | "list";
}

export function DocumentCard({
  document,
  onView,
  onDownload,
  onDelete,
  ownerName,
  isAdmin = false,
  viewMode = "grid",
}: DocumentCardProps) {
  const [imageError, setImageError] = useState(false);

  const fileInfo = getFileTypeInfo(document.fileType);
  const thumbnailUrl = getPlaceholderThumbnail(document);
  const accessStatus = getAccessStatus(document);
  const FileIcon = fileInfo.icon;

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  if (viewMode === "list") {
    return (
      <Card
        className="group cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-md"
        onClick={() => onView(document)}
      >
        <CardContent className="flex items-center gap-4 p-4">
          {/* Icon */}
          <div
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
              fileInfo.bgColor,
            )}
          >
            <FileIcon className={fileInfo.color} size={24} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate">
                {document.title}
              </h3>
              {accessStatus.type !== "active" &&
                accessStatus.type !== "unrestricted" && (
                  <Badge
                    variant={
                      accessStatus.type === "expired"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {accessStatus.type === "expired" ? (
                      <Lock className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {accessStatus.shortLabel}
                  </Badge>
                )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(document.uploadDate), {
                  addSuffix: true,
                })}
              </span>
              {isAdmin && ownerName && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {ownerName}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {document.aiKeywords.slice(0, 3).map((keyword, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {keyword}
                </Badge>
              ))}
              {document.aiKeywords.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{document.aiKeywords.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <TooltipProvider>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAction(() => onView(document))}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAction(() => onDownload(document))}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleAction(() => onDelete(document))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      className="group cursor-pointer overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200"
      onClick={() => onView(document)}
    >
      {/* Thumbnail/Icon area */}
      <div className="relative aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
        {fileInfo.category === "image" && thumbnailUrl && !imageError ? (
          <img
            src={thumbnailUrl}
            alt={document.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={cn(
              "p-6 rounded-2xl transition-transform duration-300 group-hover:scale-110",
              fileInfo.bgColor,
            )}
          >
            <FileIcon className={fileInfo.color} size={48} />
          </div>
        )}

        {/* Access status overlay */}
        {(accessStatus.type === "expired" ||
          accessStatus.type === "not-started") && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Badge
              variant={
                accessStatus.type === "expired" ? "destructive" : "secondary"
              }
              className="text-sm"
            >
              {accessStatus.type === "expired" ? (
                <Lock className="w-4 h-4 mr-1" />
              ) : (
                <Clock className="w-4 h-4 mr-1" />
              )}
              {accessStatus.shortLabel}
            </Badge>
          </div>
        )}

        {/* File type badge */}
        <Badge
          className={cn(
            "absolute top-3 left-3",
            fileInfo.bgColor,
            fileInfo.color.replace("text-", "text-"),
          )}
          variant="secondary"
        >
          {fileInfo.label}
        </Badge>

        {/* Actions menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAction(() => onView(document))}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleAction(() => onDownload(document))}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleAction(() => onDelete(document))}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Public badge */}
        {document.isPublic && (
          <Badge className="absolute bottom-3 left-3" variant="default">
            Public
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-medium text-foreground truncate mb-1">
          {document.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
          {document.aiSummary.slice(0, 100)}...
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1 mb-3">
          {document.aiKeywords.slice(0, 3).map((keyword, i) => (
            <Badge key={i} variant="outline" className="text-xs font-normal">
              <Tag className="w-3 h-3 mr-1" />
              {keyword}
            </Badge>
          ))}
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
          <span>{formatFileSize(document.fileSize)}</span>
          <span>
            {formatDistanceToNow(new Date(document.uploadDate), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Owner (admin view) */}
        {isAdmin && ownerName && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{ownerName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get access status
function getAccessStatus(document: AuthDocument) {
  if (!document.accessStart && !document.accessEnd) {
    return {
      type: "unrestricted" as const,
      shortLabel: "No restrictions",
    };
  }

  const startDate = document.accessStart
    ? new Date(document.accessStart)
    : null;
  const endDate = document.accessEnd ? new Date(document.accessEnd) : null;

  if (startDate && isFuture(startDate)) {
    return {
      type: "not-started" as const,
      shortLabel: "Not Yet Available",
    };
  }

  if (endDate && isPast(endDate)) {
    return {
      type: "expired" as const,
      shortLabel: "Expired",
    };
  }

  return {
    type: "active" as const,
    shortLabel: `Expires ${formatDistanceToNow(endDate!, { addSuffix: true })}`,
  };
}

export default DocumentCard;
