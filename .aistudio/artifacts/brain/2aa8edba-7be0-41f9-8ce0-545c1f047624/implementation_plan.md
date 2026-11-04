# Unified Backend WebP Image Compression & Admin Media Management (Committee, Gallery & Hall of Fame)

This revised plan implements a unified **backend image compression engine** that automatically optimizes both **developer-placed images in code** and **Admin Dashboard uploads**, while keeping the 5 Home Page section backgrounds purely developer-controlled in code and providing Admin Dashboard upload managers for **Committee Members**, **Gallery**, and **Hall of Fame**.

## User Review & Critical Decisions

> [!IMPORTANT]
> This plan has been updated based on your feedback:

- **Confirmed Decision 1 — 5 Home Page `div` Backgrounds Managed in Code Only**: The 5 selected Home Page containers are wired directly in code (matching the Registration Closed section pattern) without exposing them in the Admin Dashboard. As a developer, you can drop images into the public images folder and the backend will automatically compress and serve them.
- **Confirmed Decision 2 — Admin Dashboard Uploads for Committee Members, Gallery & Hall of Fame**: The Admin Dashboard provides dedicated photo upload controls for **Committee Members**, **Gallery**, and **Hall of Fame**, allowing administrators to upload or replace photos for these three sections.
- **Confirmed Decision 3 — 100% Backend-Driven WebP Compression (Developer + Admin Images)**:
  1. **Admin Uploads**: Every image uploaded from the Admin Dashboard (Committee Members, Gallery, Hall of Fame) is processed on the backend, converted and compressed into lightweight **WebP** format, and saved/returned as an optimized asset.
  2. **Developer Code Images**: Any heavy PNG/JPG/JPEG image placed by the developer in the public assets folder is automatically compressed by the backend into **WebP** (80–90% smaller) and transparently served—even when referenced by its original filename in code.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Backend Auto-Compressor for Developer Images**: Automatically scans and intercepts static images in the public assets folders, compressing multi-megabyte PNG/JPEG files into lightweight WebP files (typically 50 KB – 130 KB) and serving them with fast HTTP caching.
  2. **Backend Auto-Compressor for Admin Uploads**: Processes all Admin Dashboard photo uploads (Committee Members, Gallery, and Hall of Fame) on the server, resizing and encoding them to high-efficiency WebP before storing and syncing them.
  3. **Developer-Ready Background Wiring on the 5 Selected Home Page `div`s**: Configures the 5 selected Home Page containers in code with the same dark cyber-navy gradient overlay and `backgroundSize: 'cover'` pattern used in the Registration Closed card, ready for developer-supplied images.
  4. **Admin Dashboard Photo Management for Committee, Gallery & Hall of Fame**: Adds a **Committee Members** photo upload manager alongside the existing **Gallery** and **Hall of Fame 4.0** uploaders in the Admin Dashboard.
- **Target Audience / Persona**: The developer (managing section background images in code) and tournament administrators (managing Committee Member portraits, Gallery photos, and Hall of Fame winner photos from the Admin Dashboard).
- **Key Value**: Guarantees ultra-fast page loads across the entire website without manual image compression, whether an image is added in code by the developer or uploaded through the Admin Dashboard.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Developer Code Image Workflow (5 Home Page `div`s & Static Assets)**:
     - The 5 selected Home Page containers are pre-wired in code with clean dark-navy overlay gradients and designated background image paths:
       - **Div 1 (Tournament Progression Timeline Box — `1920×420`)**
       - **Div 2 (Key Information Section — `1920×740`)**
       - **Div 3 (Important Dates & Milestones Section — `1920×1080`)**
       - **Div 4 (Championship Protocol Card — `800×580`)**
       - **Div 5 (Official Rulebook & Stage Debate Timer Section — `1920×640`)**
     - Whenever the developer places or replaces an image in the public images folder (even a large 4 MB PNG/JPG), the backend automatically generates an optimized WebP version and serves the compressed payload transparently.
  2. **Admin Dashboard Upload Workflow (Committee Members, Gallery, Hall of Fame)**:
     - **Committee Members Tab**: Displays the Organizing Committee & Leadership roster. The Admin can upload or change any member's portrait photo (or add/edit member details), which is sent to the backend compressor, converted to lightweight WebP, and synced across the Home Page Committee Preview and the full Committee Page.
     - **Gallery Tab**: Admin uploads tournament event photos; the backend compresses each image into WebP and stores it in the gallery.
     - **Hall of Fame 4.0 Tab**: Admin uploads Champion, Runners Up, Emerging Team, and Best Debater photos; the backend compresses each photo into WebP and updates the Hall of Fame display.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Cyber-navy tournament arena glassmorphism consistent with the Registration Closed section.
  - *Color Palette & Mood*: Deep navy overlay (`linear-gradient(90deg, rgba(10,25,47,0.92) 0%, rgba(13,38,76,0.86) 50%, rgba(10,25,47,0.92) 100%)`) over background photography so white and cyan foreground text maintains WCAG AA contrast.
  - *Typography & Hierarchy*: Display titles in `Plus Jakarta Sans` / `Outfit`, body copy in `DM Sans`, and compression/file-size badges in `JetBrains Mono` (`tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Transparent Backend WebP Middleware + Folder Scanner**
  - *Chosen Approach*: Use a server-side image processing pipeline (`sharp`) that (a) scans and generates `.webp` companions for all developer images in the public folders on startup/change, and (b) intercepts requests for `/images/*` to serve the compressed WebP buffer automatically with `Cache-Control` headers.
  - *Why*: You never have to manually convert PNG/JPG files or worry about file extensions in your React code—even if you write `url(/images/my-bg.png)` with a 5 MB PNG file, the server automatically serves the ~80 KB compressed WebP version.
- **Decision 2 — Centralized Backend Upload Compression Endpoint for Admin Panel**
  - *Chosen Approach*: Route Admin photo uploads for **Committee Members**, **Gallery**, and **Hall of Fame** through a unified backend compression endpoint (`POST /api/images/compress`), which resizes and compresses the image to WebP on the server and returns the optimized asset URL / data.
  - *Why*: Ensures consistent, high-speed server-side compression across all three admin-managed modules and keeps Firestore / database documents small and fast.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│   DEVELOPER CODE ASSETS           │   │   ADMIN DASHBOARD UPLOADS         │
│  • 5 Selected Home Div BGs        │   │  • Committee Members Photos       │
│  • Hero / Banner / Static Images  │   │  • Gallery Event Photos           │
└─────────────────┬─────────────────┘   └─────────────────┬─────────────────┘
                  │                                       │
                  ▼                                       ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                UNIFIED BACKEND WEBP COMPRESSION ENGINE                    │
│  1. Static Folder Optimizer & Middleware:                                 │
│     • Scans public image directories for .png / .jpg / .jpeg              │
│     • Compresses to lightweight .webp (80-90% size reduction)             │
│     • Transparently serves compressed WebP with Cache-Control headers     │
│  2. Admin Upload Compressor API (POST /api/images/compress):              │
│     • Receives raw image from Admin (Committee / Gallery / Hall of Fame)  │
│     • Resizes & encodes to WebP on backend -> stores & returns WebP URL   │
└────────────────────────────────────┬──────────────────────────────────────┘
                                     │
                                     ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       LIVE FRONTEND APPLICATION                           │
│  • 5 Home Page Divs render developer backgrounds with dark navy overlay   │
│  • Committee, Gallery & Hall of Fame render backend-compressed WebP       │
└───────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **5 Home Page Section Background Slots (Developer Code Constants)**:
    - Defined in a clean, single developer config object so you can drop files named `bg-timeline.png` (or `.jpg`/`.webp`), `bg-key-info.png`, `bg-important-dates.png`, `bg-protocol-card.png`, and `bg-rulebook-timer.png` into the public images folder and they automatically appear with backend WebP compression.
  - **Committee Members State**:
    - Synced via `TournamentContext` and persisted so Admin photo uploads for any Committee Member immediately update both the Home Page Committee Preview and the full Committee Page.
  - **Gallery & Hall of Fame State**:
    - Uses the backend WebP compressor on upload and persists the optimized WebP URL.
