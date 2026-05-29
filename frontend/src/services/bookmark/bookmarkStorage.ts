import { BOOKMARKS_KEY, CATEGORIES_KEY, DEFAULT_CATEGORIES } from './constants';
import type { Bookmark, BookmarkCategory } from './types';

/**
 * Get all bookmarks from storage
 */
export const getBookmarks = (): Bookmark[] => {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    if (!data) return [];

    const bookmarks = JSON.parse(data);
    // Convert date strings back to Date objects
    return bookmarks.map((b: any) => ({
      ...b,
      createdAt: new Date(b.createdAt),
      updatedAt: new Date(b.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return [];
  }
};

/**
 * Save bookmarks to storage
 */
export const saveBookmarks = (bookmarks: Bookmark[]): void => {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
    throw new Error('Failed to save bookmarks');
  }
};

/**
 * Get all categories from storage
 */
export const getCategories = (): BookmarkCategory[] => {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (!data) {
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

/**
 * Save categories to storage
 */
export const saveCategories = (categories: BookmarkCategory[]): void => {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
    throw new Error('Failed to save categories');
  }
};

