// File Type Utilities
// Provides file type detection, icons, and categorization

import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileCode, 
  FileArchive,
  File,
  FileVideo,
  FileAudio,
  Presentation,
  type LucideIcon
} from 'lucide-react';

// ============================================
// FILE TYPE DEFINITIONS
// ============================================

export type FileCategory = 
  | 'pdf'
  | 'image'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'text'
  | 'code'
  | 'archive'
  | 'video'
  | 'audio'
  | 'unknown';

export interface FileTypeInfo {
  category: FileCategory;
  label: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
  canPreview: boolean;
  mimeType: string;
}

// ============================================
// FILE EXTENSION MAPPINGS
// ============================================

const FILE_TYPE_MAP: Record<string, FileTypeInfo> = {
  // PDF
  pdf: {
    category: 'pdf',
    label: 'PDF',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: FileText,
    canPreview: true,
    mimeType: 'application/pdf',
  },
  
  // Images
  jpg: {
    category: 'image',
    label: 'Image',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: FileImage,
    canPreview: true,
    mimeType: 'image/jpeg',
  },
  jpeg: {
    category: 'image',
    label: 'Image',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: FileImage,
    canPreview: true,
    mimeType: 'image/jpeg',
  },
  png: {
    category: 'image',
    label: 'Image',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: FileImage,
    canPreview: true,
    mimeType: 'image/png',
  },
  gif: {
    category: 'image',
    label: 'GIF',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: FileImage,
    canPreview: true,
    mimeType: 'image/gif',
  },
  svg: {
    category: 'image',
    label: 'SVG',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: FileImage,
    canPreview: true,
    mimeType: 'image/svg+xml',
  },
  webp: {
    category: 'image',
    label: 'WebP',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: FileImage,
    canPreview: true,
    mimeType: 'image/webp',
  },
  
  // Documents
  doc: {
    category: 'document',
    label: 'Word',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: FileText,
    canPreview: false,
    mimeType: 'application/msword',
  },
  docx: {
    category: 'document',
    label: 'Word',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: FileText,
    canPreview: false,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  
  // Spreadsheets
  xls: {
    category: 'spreadsheet',
    label: 'Excel',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: FileSpreadsheet,
    canPreview: false,
    mimeType: 'application/vnd.ms-excel',
  },
  xlsx: {
    category: 'spreadsheet',
    label: 'Excel',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: FileSpreadsheet,
    canPreview: false,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  csv: {
    category: 'spreadsheet',
    label: 'CSV',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: FileSpreadsheet,
    canPreview: true,
    mimeType: 'text/csv',
  },
  
  // Presentations
  ppt: {
    category: 'presentation',
    label: 'PowerPoint',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: Presentation,
    canPreview: false,
    mimeType: 'application/vnd.ms-powerpoint',
  },
  pptx: {
    category: 'presentation',
    label: 'PowerPoint',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: Presentation,
    canPreview: false,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  
  // Text files
  txt: {
    category: 'text',
    label: 'Text',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    icon: FileText,
    canPreview: true,
    mimeType: 'text/plain',
  },
  md: {
    category: 'text',
    label: 'Markdown',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    icon: FileText,
    canPreview: true,
    mimeType: 'text/markdown',
  },
  
  // Code files
  json: {
    category: 'code',
    label: 'JSON',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: FileCode,
    canPreview: true,
    mimeType: 'application/json',
  },
  js: {
    category: 'code',
    label: 'JavaScript',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: FileCode,
    canPreview: true,
    mimeType: 'application/javascript',
  },
  ts: {
    category: 'code',
    label: 'TypeScript',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: FileCode,
    canPreview: true,
    mimeType: 'application/typescript',
  },
  html: {
    category: 'code',
    label: 'HTML',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: FileCode,
    canPreview: true,
    mimeType: 'text/html',
  },
  css: {
    category: 'code',
    label: 'CSS',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    icon: FileCode,
    canPreview: true,
    mimeType: 'text/css',
  },
  xml: {
    category: 'code',
    label: 'XML',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    icon: FileCode,
    canPreview: true,
    mimeType: 'application/xml',
  },
  
  // Archives
  zip: {
    category: 'archive',
    label: 'ZIP',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: FileArchive,
    canPreview: false,
    mimeType: 'application/zip',
  },
  rar: {
    category: 'archive',
    label: 'RAR',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: FileArchive,
    canPreview: false,
    mimeType: 'application/x-rar-compressed',
  },
  tar: {
    category: 'archive',
    label: 'TAR',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: FileArchive,
    canPreview: false,
    mimeType: 'application/x-tar',
  },
  
  // Video
  mp4: {
    category: 'video',
    label: 'Video',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    icon: FileVideo,
    canPreview: true,
    mimeType: 'video/mp4',
  },
  webm: {
    category: 'video',
    label: 'Video',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    icon: FileVideo,
    canPreview: true,
    mimeType: 'video/webm',
  },
  mov: {
    category: 'video',
    label: 'Video',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    icon: FileVideo,
    canPreview: false,
    mimeType: 'video/quicktime',
  },
  
  // Audio
  mp3: {
    category: 'audio',
    label: 'Audio',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    icon: FileAudio,
    canPreview: true,
    mimeType: 'audio/mpeg',
  },
  wav: {
    category: 'audio',
    label: 'Audio',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    icon: FileAudio,
    canPreview: true,
    mimeType: 'audio/wav',
  },
  ogg: {
    category: 'audio',
    label: 'Audio',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    icon: FileAudio,
    canPreview: true,
    mimeType: 'audio/ogg',
  },
};

const UNKNOWN_FILE_TYPE: FileTypeInfo = {
  category: 'unknown',
  label: 'File',
  color: 'text-gray-500',
  bgColor: 'bg-gray-100 dark:bg-gray-700',
  icon: File,
  canPreview: false,
  mimeType: 'application/octet-stream',
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Get file type info from filename or extension
 */
export function getFileTypeInfo(filenameOrExtension: string): FileTypeInfo {
  const ext = filenameOrExtension.includes('.') 
    ? getFileExtension(filenameOrExtension)
    : filenameOrExtension.toLowerCase();
  
  return FILE_TYPE_MAP[ext] || UNKNOWN_FILE_TYPE;
}

/**
 * Get file category from filename
 */
export function getFileCategory(filename: string): FileCategory {
  return getFileTypeInfo(filename).category;
}

/**
 * Check if file can be previewed in the viewer
 */
export function canPreviewFile(filename: string): boolean {
  return getFileTypeInfo(filename).canPreview;
}

/**
 * Get appropriate icon component for file type
 */
export function getFileIcon(filename: string): LucideIcon {
  return getFileTypeInfo(filename).icon;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Parse file size string to bytes (e.g., "2.4 MB" -> 2516582)
 */
export function parseFileSize(sizeString: string): number {
  const match = sizeString.match(/^([\d.]+)\s*(\w+)$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  const multipliers: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024,
  };
  
  return Math.round(value * (multipliers[unit] || 1));
}

/**
 * Get all supported file categories
 */
export function getAllCategories(): FileCategory[] {
  return ['pdf', 'image', 'document', 'spreadsheet', 'presentation', 'text', 'code', 'archive', 'video', 'audio'];
}

/**
 * Get category label for display
 */
export function getCategoryLabel(category: FileCategory): string {
  const labels: Record<FileCategory, string> = {
    pdf: 'PDF Documents',
    image: 'Images',
    document: 'Office Documents',
    spreadsheet: 'Spreadsheets',
    presentation: 'Presentations',
    text: 'Text Files',
    code: 'Code Files',
    archive: 'Archives',
    video: 'Videos',
    audio: 'Audio Files',
    unknown: 'Other Files',
  };
  return labels[category];
}

/**
 * Validate file type against allowed types
 */
export function isFileTypeAllowed(filename: string, allowedCategories?: FileCategory[]): boolean {
  if (!allowedCategories || allowedCategories.length === 0) return true;
  const category = getFileCategory(filename);
  return allowedCategories.includes(category);
}

/**
 * Get accepted file extensions for input accept attribute
 */
export function getAcceptedExtensions(categories?: FileCategory[]): string {
  if (!categories || categories.length === 0) return '*';
  
  const extensions: string[] = [];
  
  for (const [ext, info] of Object.entries(FILE_TYPE_MAP)) {
    if (categories.includes(info.category)) {
      extensions.push(`.${ext}`);
    }
  }
  
  return extensions.join(',');
}

// ============================================
// SAMPLE/PLACEHOLDER FILE URLs
// ============================================

// These are placeholder URLs for mock file viewing
export const SAMPLE_FILES = {
  pdf: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf',
  image: 'https://picsum.photos/800/600',
  text: 'data:text/plain;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGZpbGUgY29udGVudC4KCkl0IGNvbnRhaW5zIG11bHRpcGxlIGxpbmVzIG9mIHRleHQgZm9yIGRlbW9uc3RyYXRpb24gcHVycG9zZXMuCgpMaW5lIDMKTGluZSA0CkxpbmUgNQ==',
};

/**
 * Generate a placeholder image URL based on document properties
 */
export function getPlaceholderThumbnail(doc: { fileType: string; title: string }): string {
  const info = getFileTypeInfo(doc.fileType);
  
  if (info.category === 'image') {
    // Use picsum for image placeholders with consistent seed
    const seed = doc.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://picsum.photos/seed/${seed}/400/300`;
  }
  
  // For other types, return empty (will show icon instead)
  return '';
}
