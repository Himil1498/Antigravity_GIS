export {
  getBookmark,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  deleteBookmarks,
  searchBookmarks,
  getBookmarksByCategory,
  isBookmarked,
  clearAllBookmarks,
  getStatistics
} from './bookmarkControlService';

export {
  getBookmarks
} from './bookmarkStorage';

// Category/Folder operations
export {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from './bookmarkFolderService';

// Import/Export operations
export {
  exportBookmarks,
  importBookmarks
} from './bookmarkIOService';

// Types and constants
export type {
  Bookmark,
  BookmarkCategory,
  BookmarkStats,
  BookmarkExportData,
  BookmarkImportResult
} from './types';

export { BOOKMARKS_KEY, CATEGORIES_KEY, DEFAULT_CATEGORIES } from './constants';

