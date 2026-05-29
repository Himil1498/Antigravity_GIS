# OptiConnect GIS: Telecom Pre-Sales Feasibility Workflow

This document outlines the standard operating procedure for B2B/Carrier pre-sales feasibility checks, from customer inquiry to infrastructure commissioning.

## 1. The Manual Feasibility Workflow (Current State)

1.  **Data Reception**: A Telecom Carrier/Enterprise Customer (e.g., Airtel, Jio, Tata, etc.) sends a file (KML, KMZ, or Excel) containing target locations (e.g., 100 sites) requiring connectivity.
2.  **File Organization**: The Project Coordinator uploads this file into the OptiConnect `Customers` directory under the specific customer's designated folder.
3.  **Visualization**: The Project Manager (PM) navigates to the Main Map, opens the Network Catalog, and loads both the new Customer target data and the existing company Infrastructure data (POPs, Sub POPs, Nodes, Bandwidth BTS, Data Centers, etc.).
4.  **Manual Analysis**: The PM utilizes GIS distance and measurement tools to manually evaluate the proximity of each of the 100 customer locations against existing Infrastructure. Sometimes, feasibility is also checked against other existing, connected Customer points (Customer -> Customer).
5.  **Quotation / Revert**: The PM determines the feasiblity ratio (e.g., 50 out of 100 locations are reachable) and reverts to the customer with this analysis.
6.  **Order Processing**: The customer provides a confirmed Purchase Order for the feasible locations (e.g., 50 locations). This order is entered into the ERP system, and deployment tasks are generated.
7.  **Commissioning**: The physical deployment connects the customer locations to the core infrastructure.
8.  **As-Built Integration**: Once connected, the details are entered via the "Add New Inventory" form under the Network Planning tab.
9.  **Approval & Go-Live**: After the Branch Manager approves the entry, the location officially transitions into the live Infrastructure or permanent Customer dataset, making it available on the map for all users and future feasibility checks.

---

## 2. The Auto-Feasibility Workflow (Future State)

To eliminate the manual, point-by-point GIS measurement phase (Step 4), the **Auto Feasibility Engine** will automate the spatial analysis.

1.  **Automated Batch Processing**: After the PM loads the customer file (100 locations) onto the map, they click a new **"Run Auto-Feasibility"** button.
2.  **Spatial Engine (PostGIS)**: The backend system immediately runs a spatial cross-join array. It calculates the exact distance from every single new customer point to the nearest existing Infrastructure (POP, Sub POP, Node) OR existing Customer point.
3.  **Instant Classification**: The system categorizes the 100 points instantly into a grid or table output:
    *   **🟢 Feasible**: Within an acceptable radius (e.g., < 500m). Lists the nearest Node ID and exact distance.
    *   **🔴 Not Feasible**: Too far from existing infrastructure (e.g., > 2000m).
4.  **Instant Export**: The PM can immediately export this automated analysis as an Excel report to send directly back to the customer, reducing a multi-day manual mapping task into a 5-second automated check.
