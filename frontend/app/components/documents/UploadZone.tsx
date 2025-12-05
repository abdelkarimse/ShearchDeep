import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getFileTypeInfo, formatFileSize } from "../../utils/fileTypes";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";

interface UploadFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "analyzing" | "complete" | "error";
  progress: number;
  error?: string;
  aiSummary?: string;
  aiKeywords?: string[];
}

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  disabled?: boolean;
}

const MAX_FILE_SIZE_DEFAULT = 50 * 1024 * 1024; // 50MB

export function UploadZone({
  onUpload,
  maxFileSize = MAX_FILE_SIZE_DEFAULT,
  acceptedTypes,
  disabled = false,
}: UploadZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        status: "pending",
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Process files one by one
      for (const uploadFile of newFiles) {
        await processFile(uploadFile);
      }
    },
    [disabled],
  );

  const processFile = async (uploadFile: UploadFile) => {
    const { file, id } = uploadFile;

    // Validate file size
    if (file.size > maxFileSize) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "error",
                error: `File too large. Maximum size is ${formatFileSize(maxFileSize)}`,
              }
            : f,
        ),
      );
      return;
    }

    try {
      setIsUploading(true);

      // Update to uploading status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: "uploading", progress: 0 } : f,
        ),
      );

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress } : f)),
        );
      }

      // Update to analyzing status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: "analyzing", progress: 100 } : f,
        ),
      );

      // Call the actual upload handler (which includes AI analysis simulation)
      await onUpload(file);

      // Update to complete status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "complete",
                aiSummary:
                  "Document analyzed successfully. AI has extracted key information and generated searchable metadata.",
                aiKeywords: [
                  "document",
                  "uploaded",
                  file.name.split(".")[0].toLowerCase().replace(/_/g, " "),
                ],
              }
            : f,
        ),
      );

      // Remove completed files after delay
      setTimeout(() => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      }, 3000);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f,
        ),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      disabled: disabled || isUploading,
      accept: acceptedTypes
        ? Object.fromEntries(acceptedTypes.map((type) => [type, []]))
        : undefined,
      maxSize: maxFileSize,
    });

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed cursor-pointer transition-all duration-200",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive &&
            !isDragReject &&
            "hover:border-primary/50 hover:bg-muted/50",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed",
        )}
      >
        <CardContent className="p-8">
          <input {...getInputProps()} />

          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                "p-4 rounded-full mb-4 transition-colors",
                isDragActive && !isDragReject && "bg-primary/10",
                isDragReject && "bg-destructive/10",
                !isDragActive && "bg-muted",
              )}
            >
              <Upload
                className={cn(
                  "w-8 h-8 transition-colors",
                  isDragActive && !isDragReject && "text-primary",
                  isDragReject && "text-destructive",
                  !isDragActive && "text-muted-foreground",
                )}
              />
            </div>

            {isDragActive && !isDragReject ? (
              <>
                <p className="text-lg font-medium text-primary">
                  Drop files here
                </p>
                <p className="text-sm text-primary/80">Release to upload</p>
              </>
            ) : isDragReject ? (
              <>
                <p className="text-lg font-medium text-destructive">
                  File type not accepted
                </p>
                <p className="text-sm text-destructive/80">
                  Please use supported file formats
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">Drag and drop files here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or <span className="text-primary font-medium">browse</span> to
                  select files
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum file size: {formatFileSize(maxFileSize)}
                </p>
              </>
            )}
          </div>

          {/* AI badge */}
          <Badge variant="secondary" className="absolute top-4 right-4 gap-1">
            <Sparkles className="w-3 h-3" />
            AI-powered analysis
          </Badge>
        </CardContent>
      </Card>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile) => (
            <UploadFileItem
              key={uploadFile.id}
              uploadFile={uploadFile}
              onRemove={() => removeFile(uploadFile.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual file item component
function UploadFileItem({
  uploadFile,
  onRemove,
}: {
  uploadFile: UploadFile;
  onRemove: () => void;
}) {
  const { file, status, progress, error, aiSummary, aiKeywords } = uploadFile;
  const fileInfo = getFileTypeInfo(file.name);
  const FileIcon = fileInfo.icon;

  return (
    <Card
      className={cn(
        "transition-all",
        status === "error" && "border-destructive/50 bg-destructive/5",
        status === "complete" && "border-green-500/50 bg-green-500/5",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn("flex-shrink-0 p-2 rounded-lg", fileInfo.bgColor)}>
            <FileIcon className={fileInfo.color} size={20} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{file.name}</p>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatFileSize(file.size)}
              </span>
            </div>

            {/* Status */}
            <div className="mt-2">
              {status === "pending" && (
                <p className="text-sm text-muted-foreground">Waiting...</p>
              )}
              {status === "uploading" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <p className="text-sm text-primary">
                      Uploading... {progress}%
                    </p>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}
              {status === "analyzing" && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                  <p className="text-sm text-purple-600">
                    AI analyzing document...
                  </p>
                </div>
              )}
              {status === "complete" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-600">Upload complete!</p>
                  </div>
                  {aiSummary && (
                    <p className="text-xs text-muted-foreground">{aiSummary}</p>
                  )}
                  {aiKeywords && aiKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {aiKeywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">
                    {error || "Upload failed"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Remove button */}
          {(status === "error" || status === "pending") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="flex-shrink-0 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default UploadZone;
