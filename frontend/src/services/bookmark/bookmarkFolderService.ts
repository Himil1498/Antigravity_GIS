import type { BookmarkCategory } from './types';
import { getCategories, saveCategories, getBookmarks, saveBookmarks } from './bookmarkStorage';

/**
 * Add new category
 */
export const addCategory = (category: Omit<BookmarkCategory, 'id'>): BookmarkCategory => {
  const categories = getCategories();

  const newCategory: BookmarkCategory = {
    ...category,
    id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  categories.push(newCategory);
  saveCategories(categories);

  return newCategory;
};

/**
 * Update category
 */
export const updateCategory = (id: string, updates: Partial<BookmarkCategory>): BookmarkCategory | null => {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) return null;

  const updatedCategory: BookmarkCategory = {
    ...categories[index],
    ...updates,
    id: categories[index].id, // Prevent ID change
  };

  categories[index] = updatedCategory;
  saveCategories(categories);

  return updatedCategory;
};

/**
 * Delete category
 */
export const deleteCategory = (id: string): boolean => {
  const categories = getCategories();
  const filtered = categories.filter((c) => c.id !== id);

  if (filtered.length === categories.length) {
    return false;
  }

  // Remove category from all bookmarks
  const bookmarks = getBookmarks();
  const category = categories.find((c) => c.id === id);
  if (category) {
    let bookmarksChanged = false;
    bookmarks.forEach((b) => {
      if (b.category === category.name) {
        b.category = undefined;
        bookmarksChanged = true;
      }
    });
    if (bookmarksChanged) {
      saveBookmarks(bookmarks);
    }
  }

  saveCategories(filtered);
  return true;
};

/**
 * Get all categories
 * Re-exporting from storage for convenience
 */
export { getCategories };

