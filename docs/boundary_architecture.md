# Region Boundaries: Architecture & Data Flow

This document explains in simple terms how the region boundaries interact between the Main Map, the Admin Editor, the database, and the static `india.json` file.

## 1. How the Main Map Loads Boundaries

When a user opens the Main Map, the system needs to know what boundaries to draw. It follows a **Two-Step Fallback Process**:

1.  **Step 1: The Database (Primary Source)**
    The Main Map makes a request to the backend (`/api/boundary-public/list-all`). The backend looks inside the `boundary_versions` database table for any region that has `status = 'published'`. If found, it draws this exact polygon on the map.
2.  **Step 2: The `india.json` File (Fallback Source)**
    If a specific region (e.g., Punjab) has *never* been edited or published by an Admin, the database won't have a record for it. If there is no published database record, the frontend automatically falls back to loading the static `india.json` file exactly as it was provided, drawing that default boundary instead.

> **💡 In summary:** The Main Map always prioritizes what Admins have manually published. If an Admin hasn't published anything for a state, it defaults to `india.json`.

---

## 2. How the Admin Region Boundary Editor Works

When an Admin opens the Region Boundary Editor to edit a state:

1.  **Loading the Canvas**
    The editor first checks the `boundary_versions` table to see if you have any unsaved drafts (`status = 'draft'`) or an already published live boundary (`status = 'published'`). 
    If neither exists, it borrows the coordinates from `india.json` just so you have a starting point to edit.
2.  **Saving a Draft**
    When you edit points and click "Save", it does **not** overwrite `india.json`. Instead, it saves those coordinates as a new row in the `boundary_versions` table with `status = 'draft'`. The Main Map does not see drafts.
3.  **Publishing to Live**
    When you click "Publish", the backend takes your draft and changes its status in the `boundary_versions` table to `status = 'published'`.
    To keep a historical record, it takes whatever the *previous* published boundary was and changes its status to `archived`.

> **💡 In summary:** Publishing a boundary tells the database "make this the new official map". The next time anyone opens the Main Map, the system sees this new published database record and completely ignores `india.json` for that state.

---

## 3. Import & Export GeoJSON Feature Analysis

The **Import/Export GeoJSON** feature acts as a bridge to override the manual point-editing process.

*   **Export:** Clicking Export packages whatever boundary is currently on your editor screen into a standard `.geojson` file and downloads it to your computer.
*   **Import:** Clicking Import allows you to upload an accurate GeoJSON file. The frontend strictly validates the file to ensure it's a valid `Polygon` or `MultiPolygon`, instantly renders it on the editor, and triggers a "Save to Draft" event. 
*   **Safety check:** I have verified the frontend source code (`useRegionImportExport.ts`). It handles the geometric parsing cleanly and throws helpful errors if an invalid file is uploaded. It works perfectly fine and is the highly recommended way to fix borders.
