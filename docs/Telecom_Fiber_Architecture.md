# Telecom Fiber Architecture - Developer Guide

This guide is designed for developers, GIS engineers, and software engineers working on the OptiConnect GIS Platform. It explains the physical layout of a telecom fiber-optic network in simple, highly accessible terms, avoiding overly dense network engineering jargon.

---

## 🏗️ The Three Pillars of Fiber Networks

There are three primary entities you will encounter when modeling a telecom network on a map. Think of telecom networks exactly like the physical road infrastructure of a city.

### 1. **Rings** (The Highways)
A **Ring** is a long fiber-optic cable that travels around a city or neighborhood and connects back to where it started, forming a complete loop.
- **Why build a loop?** Redundancy! (High Availability). If an excavator digs up the cable on the left side of the Ring, the internet instantly travels around the *right* side of the Ring instead. Nobody loses internet.
- **Developer Analogy:** A redundant cluster of ethernet cables ensuring full failover.

### 2. **POPs** (The Highway Exits & Intersections)
A **POP** (Point of Presence) is a physical building, data center, or street cabinet where the telecom company puts all their highly expensive routing hardware, servers, and switches.
- **In GIS:** We place POPs on top of Rings (like beads on a necklace).
- **Developer Analogy:** A Server Load Balancer or an API Gateway. It distributes the main traffic out to smaller, specific destinations.
- **Real-World Analogy:** A highway exit ramp or a toll plaza.

### 3. **Routes** (The Local Roads)
A **Route** is a point-to-point (straight line) bundle of fiber cables. They do not loop back. They usually branch out from a POP and travel straight to a final destination (like a corporate park).
- **In GIS:** Routes are linear polylines. They always require a **Start POP** (so the system knows which main router powers the cable) and usually an **End POP** or an End Customer.
- **Real-World Analogy:** A local neighborhood road that takes you from the highway exit straight to your driveway.

---

## 🕸️ The Hierarchy of Rings

Telecom companies don't build just one giant loop. They build webs of interconnected rings decreasing in size, very similar to blood vessels (Arteries → Veins → Capillaries).

### 🔴 Core Rings
- **Scope:** Hundreds of kilometers (Surrounds the entire city or region).
- **Purpose:** Carries the massive internet backbone for the entire city, connecting huge regional Data Centers.
- **Customer Access:** General customers are **NEVER** allowed on a Core Ring. Only hyperscale VIPs (e.g., global Google/AWS data centers) might have direct access to a core ring.

### 🔵 Distribution Rings
- **Scope:** 20 to 50 kilometers.
- **Purpose:** The telecom company taps into the Core Ring and builds smaller loops (Distribution Rings) that go around individual districts or neighborhoods (e.g., a "North District Ring").
- **Customer Access:** Standard customers do not connect here. Massive institutions (military bases, huge hospitals) might occasionally connect directly here.

### 🟢 Access Rings
- **Scope:** 2 to 5 kilometers.
- **Purpose:** Sub-loops branching off the Distribution Ring that surround specific dense areas like a Business Campus, Tech Park, or dense residential area.
- **Customer Access:** **This is where 95% of standard customers connect.**

---

## 🔌 How Do Customers Actually Get Online?

**The Standard Flow (The 95% Rule)**
In your GIS Platform, the user workflow models this exact process:

1. A large **Access Ring** is drawn around a busy commerce district.
2. A **POP** is placed at a major street corner on that Access Ring.
3. A business customer signs a contract with the telecom company. The business is located 3 miles away from the Access Ring.
4. The telecom engineer draws a linear **Route** (fiber cable) from the **POP** directly to the customer's building. 
5. The internet successfully flows from: `Core Ring` ➡️ `Distribution Ring` ➡️ `Access Ring` ➡️ `POP` ➡️ `Route` ➡️ `Customer Building`.

*By capturing the "Start POP" on a Route, the Software Database can successfully trace this exact lineage backward so engineers know exactly how a building receives its internet!*
