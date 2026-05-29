# Comprehensive Guide to Permissions & Folder Access Logic

This document details the robust permission system implemented for the Network Planning application, covering Role-Based Access Control (RBAC), Folder Visibility, and the mechanism for handling exceptions (User Detachment).

## 1. Core Concepts

### 1.1 Role-Based Access Control (RBAC)
The system is built on RBAC principles where:
- **Roles** define a standard set of **Permissions** (e.g., `network:view`, `map:tools:export`) and **Default Folders** (e.g., Infrastructure, Customers).
- **Users** are assigned a specialized **Role** (e.g., "Testing_Role", "Manager").
- **Inheritance:** By default, a user inherits 100% of their Role's capabilities. This ensures consistency and simplifies management (update the Role, update everyone).

### 1.2 Attributes of a User
- **Direct Permissions (`user.permissions` in DB):** Permissions explicitly assigned to this specific user.
- **Role (`user.role`):** The name of the role assigned (e.g., "Testing_Role").
- **Effective Permissions:** The final list of capabilities the user has. Calculated as: `Direct Permissions + Role Permissions`.

---

## 2. Folder Access Logic (The "Robust" Fix)

One of the critical challenges in RBAC is ensuring that when a Role's folder access changes (e.g., Admin adds a new "Project X" folder to the "Manager" role), all existing Managers see it immediately.

### 2.1 The Dynamic Merge Solution
We implemented a **Real-Time Dynamic Merge** in the backend (`folder.service.js`).

**How it works:**
Every time a user requests the folder list (via `getFolderContents` API):
1.  **Fetch Personal Access:** The system queries the `user_folder_access` table for folders manually assigned to this user.
2.  **Fetch Role Access:** The system *simultaneously* looks up the current `default_folder_ids` defined for the user's Role in the `roles` table.
3.  **Merge & Deduplicate:** The two lists are combined (Union).
4.  **Result:** The user sees a unified view of their personal folders AND their role's folders.

**Key Benefit:**
- **Instant Updates:** If you add a folder to a Role, every user with that role sees it instantly upon refresh. No database migration or "sync script" is required.
- **Safety:** Removing a folder from a Role instantly hides it from users (unless they were also given personal access to it).

### 2.2 Propagation (Redundancy)
To ensure data consistency for potential future queries that might not use the specialized `folder.service.js` logic, we also invoke a **Propagation Step** when a Role is updated (`role.controller.js`). This adds new role folders to the `user_folder_access` table as a fallback. However, the system primarily relies on the Dynamic Merge for accuracy.

---

## 3. Permission Management & "Freedom"

Users requested the ability to "Uncheck" a permission that was inherited from a Role. In strict RBAC, this is a contradiction (you can't be a "Manager" but lack "Manager Permissions").

### 3.1 The Detachment Mechanism
We implemented a robust "Opt-Out" mechanism in `UserPermissionsDialog` (`useUserPermissionsDialog.ts`).

**Scenario:**
- User "Raj" has Role "Testing_Role" (Includes `map:view`).
- Admin wants to remove `map:view` from "Raj" ONLY.

**Workflow:**
1.  **Uncheck:** Admin unchecks the "View Map Tab" (Inherited) checkbox.
2.  **Confirmation:** System warns: *"Unchecking this... will detach the user from the role... and convert all assignments to direct."*
3.  **Detachment:**
    - If confirmed, the Frontend calculates the **Effective Set** (`Role + Direct`).
    - It removes `map:view` from this set.
    - It clears the "Inherited" status visually.
    - It marks the user for **Role Detachment**.
4.  **Save:**
    - The system updates the user's Role to `'custom'` (effectively removing the "Testing_Role").
    - It saves the new, precise list of permissions as **Direct Permissions**.

**Result:** "Raj" now has a Custom role with exactly the permissions desired. The original "Testing_Role" remains untouched for other users.

---

## 4. Technical Reference

| Feature | File Location | Description |
| :--- | :--- | :--- |
| **Dynamic Folder Merge** | `backend/.../network-planning/services/folder.service.js` | Contains the Recursive CTE query that Unions `user_folder_access` with `roles.default_folder_ids`. |
| **Role Update Propagation** | `backend/.../access-control/controllers/role.controller.js` | Triggers `propagateFolderAccess` after role update to sync `user_folder_access` (Auxiliary). |
| **Permission Dialog** | `frontend/.../users/components/UserPermissionsDialog/UserPermissionsDialogContent.tsx` | Handles the UI for checking/unchecking permissions, including disabling/enabling inheritance interaction. |
| **Detachment Logic** | `frontend/.../users/components/UserPermissionsDialog/useUserPermissionsDialog.ts` | Contains `togglePermission` logic to detect inherited removal, show confirmation, and handle Role Detachment state. |
| **User Role Update** | `frontend/.../users/components/UserPermissionsDialog/useUserPermissionsDialog.ts` | In `handleSave`, calls API to set `role='custom'` before saving permissions if detachment occurred. |

---

## 5. Map Preferences (Coming Soon)
We are currently analyzing the implementation of **User Preferences Persistence** (Layer settings, view state) for the Main Map, ensuring that map configuration follows the user across logins.
