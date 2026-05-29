import { Bookmark, BookmarkCategory } from '../../types/search.types';

export type { Bookmark, BookmarkCategory };

export interface BookmarkStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface BookmarkExportData {
  version: string;
  exportDate: string;
  bookmarks: Bookmark[];
  categories: BookmarkCategory[];
}

export interface BookmarkImportResult {
  success: boolean;
  count: number;
  error?: string;
}

