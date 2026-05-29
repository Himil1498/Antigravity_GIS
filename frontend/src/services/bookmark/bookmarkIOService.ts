import type { Bookmark, BookmarkCategory, BookmarkExportData, BookmarkImportResult } from './types';
import { getBookmarks, saveBookmarks, getCategories, saveCategories } from './bookmarkStorage';

/**
 * Export bookmarks to JSON
 */
export const exportBookmarks = (): string => {
  const bookmarks = getBookmarks();
  const categories = getCategories();

  const exportData: BookmarkExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    bookmarks,
    categories,
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Import bookmarks from JSON
 */
export const importBookmarks = (jsonData: string, merge: boolean = false): BookmarkImportResult => {
  try {
    const importData = JSON.parse(jsonData);

    if (!importData.bookmarks || !Array.isArray(importData.bookmarks)) {
      return { success: false, count: 0, error: 'Invalid format' };
    }

    let bookmarks = importData.bookmarks.map((b: any) => ({
      ...b,
      createdAt: new Date(b.createdAt),
      updatedAt: new Date(b.updatedAt),
    }));

    if (merge) {
      // Merge with existing bookmarks
      const existing = getBookmarks();
      const existingIds = new Set(existing.map((b) => b.id));

      // Add only new bookmarks
      bookmarks = bookmarks.filter((b: Bookmark) => !existingIds.has(b.id));
      bookmarks = [...existing, ...bookmarks];
    }

    saveBookmarks(bookmarks);

    // Import categories if available
    if (importData.categories && Array.isArray(importData.categories)) {
      if (merge) {
        const existingCategories = getCategories();
        const existingCategoryIds = new Set(existingCategories.map((c) => c.id));
        const newCategories = importData.categories.filter(
          (c: BookmarkCategory) => !existingCategoryIds.has(c.id)
        );
        saveCategories([...existingCategories, ...newCategories]);
      } else {
        saveCategories(importData.categories);
      }
    }

    return { success: true, count: bookmarks.length };
  } catch (error) {
    console.error('Error importing bookmarks:', error);
    return { success: false, count: 0, error: 'Failed to parse data' };
  }
};

