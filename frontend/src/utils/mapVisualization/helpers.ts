
/**
 * Helper function to create bookmark button HTML
 */
export const createBookmarkButton = (entryId: string) => {
  return `
    <div style="margin-top: 10px; display: flex; gap: 8px; justify-content: center;">
      <button id="bookmark-btn-${entryId}" style="padding: 8px 16px; font-size: 13px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
        ⭐ Bookmark
      </button>
    </div>
  `;
};

