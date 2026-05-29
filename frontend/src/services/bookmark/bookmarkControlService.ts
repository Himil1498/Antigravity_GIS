import type { Bookmark, BookmarkStats } from './types';
import { getBookmarks, saveBookmarks } from './bookmarkStorage';

/**
 * Get bookmark by ID
 */
export const getBookmark = (id: string): Bookmark | null => {
  const bookmarks = getBookmarks();
  return bookmarks.find((b) => b.id === id) || null;
};

/**
 * Add new bookmark
 */
export const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Bookmark => {
  const bookmarks = getBookmarks();

  const newBookmark: Bookmark = {
    ...bookmark,
    id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  bookmarks.push(newBookmark);
  saveBookmarks(bookmarks);

  return newBookmark;
};

/**
 * Update existing bookmark
 */
export const updateBookmark = (id: string, updates: Partial<Bookmark>): Bookmark | null => {
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex((b) => b.id === id);

  if (index === -1) return null;

  const updatedBookmark: Bookmark = {
    ...bookmarks[index],
    ...updates,
    id: bookmarks[index].id, // Prevent ID change
    createdAt: bookmarks[index].createdAt, // Preserve creation date
    updatedAt: new Date(),
  };

  bookmarks[index] = updatedBookmark;
  saveBookmarks(bookmarks);

  return updatedBookmark;
};

/**
 * Delete bookmark
 */
export const deleteBookmark = (id: string): boolean => {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter((b) => b.id !== id);

  if (filtered.length === bookmarks.length) {
    return false; // No bookmark found
  }

  saveBookmarks(filtered);
  return true;
};

/**
 * Delete multiple bookmarks
 */
export const deleteBookmarks = (ids: string[]): number => {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter((b) => !ids.includes(b.id));
  const deletedCount = bookmarks.length - filtered.length;

  saveBookmarks(filtered);
  return deletedCount;
};

/**
 * Search bookmarks
 */
export const searchBookmarks = (query: string): Bookmark[] => {
  const bookmarks = getBookmarks();
  const queryLower = query.toLowerCase();

  return bookmarks.filter((b) => {
    return (
      b.name.toLowerCase().includes(queryLower) ||
      b.description?.toLowerCase().includes(queryLower) ||
      b.category?.toLowerCase().includes(queryLower)
    );
  });
};

/**
 * Get bookmarks by category
 */
export const getBookmarksByCategory = (category: string): Bookmark[] => {
  const bookmarks = getBookmarks();
  return bookmarks.filter((b) => b.category === category);
};

/**
 * Check if bookmark exists for location
 */
export const isBookmarked = (lat: number, lng: number, tolerance: number = 0.0001): boolean => {
  const bookmarks = getBookmarks();
  return bookmarks.some((b) => {
    const latDiff = Math.abs(b.location.lat - lat);
    const lngDiff = Math.abs(b.location.lng - lng);
    return latDiff < tolerance && lngDiff < tolerance;
  });
};

/**
 * Clear all bookmarks
 */
export const clearAllBookmarks = (): number => {
  const bookmarks = getBookmarks();
  const count = bookmarks.length;
  saveBookmarks([]);
  return count;
};

/**
 * Get bookmark statistics
 */
export const getStatistics = (): BookmarkStats => {
  const bookmarks = getBookmarks();

  const stats: BookmarkStats = {
    total: bookmarks.length,
    byType: {},
    byCategory: {},
  };

  bookmarks.forEach((b) => {
    // Count by type
    stats.byType[b.type] = (stats.byType[b.type] || 0) + 1;

    // Count by category
    const category = b.category || 'Uncategorized';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
  });

  return stats;
};

