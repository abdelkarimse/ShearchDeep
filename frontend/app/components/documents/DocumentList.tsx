import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Tag,
  User,
  FileText,
  Folder,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import type { AuthDocument } from "../../types/auth";
import { getCategoryLabel, type FileCategory } from "../../utils/fileTypes";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  documents: AuthDocument[];
  onView: (doc: AuthDocument) => void;
  onDownload: (doc: AuthDocument) => void;
  onDelete: (doc: AuthDocument) => void;
  isAdmin?: boolean;
  users?: Array<{ id: string; firstName: string; lastName: string }>;
  isLoading?: boolean;
}

type SortOption =
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "name-desc"
  | "size-desc"
  | "size-asc";

export function DocumentList({
  documents,
  onView,
  onDownload,
  onDelete,
  isAdmin = false,
  users = [],
  isLoading = false,
}: DocumentListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<FileCategory[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get unique keywords from all documents
  const allKeywords = useMemo(() => {
    const keywords = new Set<string>();
    documents.forEach((doc) => {
      doc.aiKeywords.forEach((k) => keywords.add(k));
    });
    return Array.from(keywords).sort();
  }, [documents]);

  // Get owner name for a document
  const getOwnerName = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
    },
    [users],
  );

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.filename.toLowerCase().includes(query) ||
          doc.aiSummary.toLowerCase().includes(query) ||
          doc.aiKeywords.some((k) => k.toLowerCase().includes(query)),
      );
    }

    // Type filter
    if (selectedTypes.length > 0) {
      result = result.filter((doc) => {
        const docCategory = getDocumentCategory(doc.fileType);
        return selectedTypes.includes(docCategory);
      });
    }

    // User filter (admin only)
    if (selectedUser) {
      result = result.filter((doc) => doc.userId === selectedUser);
    }

    // Keyword filter
    if (selectedKeywords.length > 0) {
      result = result.filter((doc) =>
        selectedKeywords.some((keyword) => doc.aiKeywords.includes(keyword)),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
          );
        case "date-asc":
          return (
            new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          );
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "size-desc":
          return b.fileSize - a.fileSize;
        case "size-asc":
          return a.fileSize - b.fileSize;
        default:
          return 0;
      }
    });

    return result;
  }, [
    documents,
    searchQuery,
    selectedTypes,
    selectedUser,
    selectedKeywords,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Active filter count
  const activeFilterCount = [
    selectedTypes.length > 0,
    selectedUser !== "",
    selectedKeywords.length > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedUser("");
    setSelectedKeywords([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const toggleType = (type: FileCategory) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    setCurrentPage(1);
  };

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword],
    );
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton header */}
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        {/* Skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-[4/3]" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and controls bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Filter button */}
          <Button
            variant={
              showFilters || activeFilterCount > 0 ? "default" : "outline"
            }
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Sort dropdown */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="size-desc">Largest first</SelectItem>
              <SelectItem value="size-asc">Smallest first</SelectItem>
            </SelectContent>
          </Select>

          {/* View mode toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" />
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filters</h3>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* File type filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <FileText className="h-4 w-4" />
                    File Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "pdf",
                      "image",
                      "document",
                      "spreadsheet",
                      "text",
                      "code",
                    ].map((type) => (
                      <Button
                        key={type}
                        variant={
                          selectedTypes.includes(type as FileCategory)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleType(type as FileCategory)}
                        className="text-xs"
                      >
                        {getCategoryLabel(type as FileCategory)
                          .replace(" Files", "")
                          .replace("Office ", "")}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* User filter (admin only) */}
                {isAdmin && users.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      Owner
                    </label>
                    <Select
                      value={selectedUser}
                      onValueChange={(value) => {
                        setSelectedUser(value === "all" ? "" : value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All users</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Keywords filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Tag className="h-4 w-4" />
                    Keywords
                  </label>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {allKeywords.slice(0, 15).map((keyword) => (
                      <Badge
                        key={keyword}
                        variant={
                          selectedKeywords.includes(keyword)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleKeyword(keyword)}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {paginatedDocuments.length} of {filteredDocuments.length}{" "}
          documents
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        {filteredDocuments.length !== documents.length && (
          <span>({documents.length} total)</span>
        )}
      </div>

      {/* Empty state */}
      {filteredDocuments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Folder className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchQuery || activeFilterCount > 0
                ? "No matching documents"
                : "No documents yet"}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery || activeFilterCount > 0
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Upload your first document to get started!"}
            </p>
            {(searchQuery || activeFilterCount > 0) && (
              <Button variant="ghost" onClick={clearFilters} className="mt-4">
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document grid/list */}
      {filteredDocuments.length > 0 && (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-3",
          )}
        >
          {paginatedDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={onView}
              onDownload={onDownload}
              onDelete={onDelete}
              ownerName={isAdmin ? getOwnerName(doc.userId) : undefined}
              isAdmin={isAdmin}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, index, array) => {
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(page)}
                      className="h-9 w-9"
                    >
                      {page}
                    </Button>
                  </div>
                );
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper to get document category from file type
function getDocumentCategory(fileType: string): FileCategory {
  const typeMap: Record<string, FileCategory> = {
    pdf: "pdf",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    svg: "image",
    webp: "image",
    doc: "document",
    docx: "document",
    xls: "spreadsheet",
    xlsx: "spreadsheet",
    csv: "spreadsheet",
    ppt: "presentation",
    pptx: "presentation",
    txt: "text",
    md: "text",
    json: "code",
    js: "code",
    ts: "code",
    html: "code",
    css: "code",
    xml: "code",
    zip: "archive",
    rar: "archive",
    tar: "archive",
    mp4: "video",
    webm: "video",
    mov: "video",
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
  };
  return typeMap[fileType.toLowerCase()] || "unknown";
}

export default DocumentList;
