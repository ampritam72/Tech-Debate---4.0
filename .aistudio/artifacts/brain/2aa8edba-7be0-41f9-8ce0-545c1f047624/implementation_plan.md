# Real-Time Cloud Registration Sync (Firebase Cloud Firestore) & Strict Submission Verification

Unify team registrations, payment verification, and live squad counters across the public Vercel deployment and the AI Studio Admin Console using **Firebase Cloud Firestore** as the shared real-time cloud database, while strictly blocking any fake local-only success screens when cloud persistence fails.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during clarification to eliminate silent `localStorage`-only registrations on Vercel:

- **Confirmed Decision 1 — Shared Real-Time Cloud Database (`Firebase Cloud Firestore`)**: Because Vercel hosts a static SPA bundle without direct access to the internal AI Studio Cloud SQL instance or cookie-gated Cloud Run proxy, **Firebase Cloud Firestore** will serve as the primary, globally accessible real-time cloud store. Both the Vercel site and the AI Studio preview connect directly to the same Firestore database (`teams` collection) via the Firebase Web SDK (`onSnapshot`), ensuring any registration on Vercel appears instantaneously in the Admin Dashboard and live Home Page counters everywhere.
- **Confirmed Decision 2 — Strict Cloud Persistence Gate (Zero Fake Success Screen)**: The previous offline `localStorage` fallback (`isLocalFallback: true`) that showed a celebratory registration voucher when the cloud database could not be reached will be completely removed. A registration is only marked successful—and the Digital Registration Voucher is only displayed—after Firestore (and the backend API when available) confirms the write transaction committed to the cloud. If the cloud write fails or times out, a clear error alert is shown and the user stays on Step 3 so they can retry without losing their form inputs.
- **Automatic Local-to-Cloud Recovery**: Any teams previously trapped in a browser's `localStorage` queue (`td4_unsynced_teams_v4`) will be automatically migrated into Cloud Firestore when that browser next opens the site.

---

## 1. Overview & Core Concept

- **What It Does**: Connects every client instance of the **Premier University CSE Intra-Departmental Tech Debate 4.0** portal (whether accessed via the public Vercel URL, mobile browsers, or AI Studio) to a single authoritative **Firebase Cloud Firestore** database with real-time `onSnapshot` listeners and dual-write synchronization with the PostgreSQL backend.
- **Target Audience / Persona**:
  - **Debate Teams (Students on Vercel / Mobile)**: Need 100% certainty that when they see the "Registration Confirmed" voucher, their squad (`TD4-TEAM-XXX`), speaker roster, and bKash/Nagad/Rocket `TrxID` are permanently recorded in the organizers' central database.
  - **Tournament Organizers & Admins**: Need instant visibility of all newly registered squads, live team counters on the Home Page, one-click payment verification/rejection, and full 31-column CSV export from any device without discrepancies between Vercel and AI Studio.
- **Key Value**: Eliminates split-brain state between Vercel and AI Studio, guarantees zero lost registrations, enforces atomic uniqueness checks (`Team Name`, `Student ID`, `Transaction ID`), and provides real-time synchronization across all connected screens.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Public Team Registration (3-Step Wizard -> Cloud Commit -> Verified Voucher)**:
     - **Step 1 (Squad Info)** & **Step 2 (3 Speakers)**: Validates against the live Cloud Firestore `teams` list in real time so duplicate team names or student IDs are caught immediately.
     - **Step 3 (Payment & Submission)**: When the user clicks **Complete Registration**, the button enters a locked `Verifying & Saving to Cloud Database...` loading state.
     - **Cloud Verification Gate**:
       - *On Confirmed Cloud Commit*: Fires confetti, generates the official `TD4-TEAM-XXX` voucher with a **Cloud Database Verified** status indicator, and updates the live team counter across all open browsers within milliseconds.
       - *On Network / Cloud Error*: Blocks the success screen, displays a high-contrast crimson diagnostic banner explaining the exact reason (e.g., duplicate `TrxID`, network disconnection, or permission error), and preserves all entered fields on Step 3 for immediate retry.
  2. **Admin Console Live Sync & Offline CSV Export**:
     - The Admin Dashboard header displays a live **Cloud Firestore Synced** status indicator and team counter (`tabular-nums`).
     - Approving or rejecting a payment (`VERIFIED` / `REJECTED`), changing team status, or deleting a test entry mutates Cloud Firestore directly (and syncs with PostgreSQL), immediately reflecting on the public Home Page and Registration Roster.
     - Clicking **Download Teams CSV** exports the live cloud-synced dataset with all 31 columns in UTF-8 BOM Excel format.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-craft dark UI console for an engineering university championship — crisp structural surfaces, single-elevation cards with `1px solid` hairline borders (`border-slate-800`), and zero decorative bloat.
  - *Color Palette & Mood*:
    - **60% Dominant Canvas**: Deep obsidian slate (`#020617` / `bg-slate-950`).
    - **30% Structural Surfaces**: Elevated slate containers (`#0F172A` / `bg-slate-900/90`) with subtle hairline borders (`border-slate-800/80`).
    - **10% Semantic Accents**: Cyan (`#06B6D4`) for primary interactive CTAs, Emerald (`#10B981`) for verified cloud commits, Amber (`#F59E0B`) for pending review states, and Crimson (`#EF4444`) for blocking submission errors.
  - *Typography & Hierarchy*:
    - Display & Section Headings: Geometric sans with balanced wrapping (`text-wrap: balance`).
    - Body Copy: High-legibility sans at `14px–16px` for form inputs and instructions.
    - Telemetry, Team IDs (`TD4-TEAM-101`), Student IDs, Phone Numbers, and Counters: Strict monospace tabular numerals (`font-mono tabular-nums`) for vertical alignment across tables and vouchers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Primary Cloud Firestore Persistence with Dual-Write Backend Sync**
  - *Chosen Approach*: Provision Firebase Cloud Firestore in the project and read/write registrations directly to the Firestore `teams` collection from the client SDK, while also mirroring writes to `/api/register` when the Express/PostgreSQL backend is reachable.
  - *Why*: Vercel static deployments only deploy the frontend bundle (`dist/`) and cannot reach AI Studio's private Cloud SQL or authenticated Cloud Run proxy due to cross-origin session cookies. Firebase Cloud Firestore works natively over HTTPS from any domain (Vercel, custom domain, localhost, and AI Studio) in real time.
  - *Alternatives Considered*: Relying solely on `REMOTE_API_BASE` pointing to Cloud Run (fails from external browsers because the AI Studio proxy intercepts cross-origin requests without an active Google session cookie).

- **Decision 2: Strict Fail-Closed Submission (Removing `localStorage` Fallback)**
  - *Chosen Approach*: Remove `isLocalFallback: true` from `registerTeam`. Require `setDoc` / transaction commit to Cloud Firestore to resolve before returning a `Team` object to `RegistrationWizard`.
  - *Why*: Showing a success voucher when data was only saved in the user's phone browser `localStorage` misled participants into thinking their registration reached the organizers. Failing closed with a clear retry message guarantees 100% data integrity.

- **Decision 3: Deterministic Uniqueness Enforcement in Cloud Firestore**
  - *Chosen Approach*: Before committing a new team document `/teams/{teamId}`, query the live Firestore `teams` collection (and run a transaction) to verify that the **Team Name**, all three **Student IDs**, and the payment **Transaction ID (`TrxID`)** do not already exist, and assign the next sequential `TD4-TEAM-XXX` ID atomically.
  - *Why*: Prevents race conditions or duplicate submissions when multiple squads register simultaneously from Vercel.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                   CLIENT BROWSERS (Vercel Domain & AI Studio)                │
│                                                                              │
│  ┌─────────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐  │
│  │   RegistrationWizard    │  │   HomePage Counter   │  │ AdminDashboard  │  │
│  │ (3-Step Form & Voucher) │  │  & Public Team List  │  │ (Verify / CSV)  │  │
│  └────────────┬────────────┘  └──────────┬───────────┘  └────────┬────────┘  │
│               │                          │                       │           │
│               ▼                          ▼                       ▼           │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                TournamentContext (Real-Time State Engine)              │  │
│  │  • Subscribes to Firestore `onSnapshot(collection(db, 'teams'))`       │  │
│  │  • Enforces strict cloud-commit before resolving `registerTeam()`      │  │
│  │  • Auto-migrates any legacy `unsynced` localStorage teams on boot      │  │
│  └──────────────────────┬─────────────────────────────────┬───────────────┘  │
└─────────────────────────┼─────────────────────────────────┼──────────────────┘
                          │ (1) Primary Real-Time Sync      │ (2) Mirror Sync
                          │     (Works on Vercel & AIS)     │     (When on AIS)
                          ▼                                 ▼
        ┌───────────────────────────────────┐     ┌────────────────────────────┐
        │   FIREBASE CLOUD FIRESTORE (db)   │     │  Express + Cloud SQL API   │
        │  • `/teams/{teamId}`              │     │  • `/api/register`         │
        │  • `/notices/{noticeId}`          │     │  • `/api/teams`            │
        │  • `/fixtures/{fixtureId}`        │     │  • `/api/admin/*`          │
        │  • Hardened `firestore.rules`     │     └────────────────────────────┘
        └───────────────────────────────────┘
```

### Data Model & State (`firebase-blueprint.json` & Firestore Collections)

- **`/teams/{teamId}` (`Team` Entity)**:
  - `id`: string (`^TD4-TEAM-[0-9]+$`, max 32 chars)
  - `name`: string (3–80 chars)
  - `batch`: string (max 32 chars)
  - `department`: string (max 100 chars)
  - `leaderId`: string (max 64 chars)
  - `registrationDate`: ISO timestamp string (max 40 chars)
  - `status`: enum (`'PENDING' | 'APPROVED' | 'REJECTED'`)
  - `notes`: optional string (max 500 chars)
  - `members`: bounded list (exactly 3 speaker objects containing `id`, `teamId`, `speakerRole`, `fullName`, `studentId`, `batch`, `semester`, `phone`, `email`, `isLeader`)
  - `payment`: nested map (`id`, `teamId`, `method` in `['bKash', 'Nagad', 'Rocket']`, `senderNumber`, `transactionId`, `amount`, `status` in `['PENDING', 'VERIFIED', 'REJECTED']`, `verifiedAt`, `rejectionReason`)

### Interactive Component & State Mapping

1. **Firebase Provisioning & Initialization**:
   - Provision Firestore via the Firebase setup flow so `firebase-applet-config.json` includes `firestoreDatabaseId`.
   - Initialize `db = getFirestore(app, firebaseConfig.firestoreDatabaseId)` and validate connectivity on boot using `getDocFromServer`.
   - Deploy hardened `firestore.rules` allowing validated team registrations and admin management operations, plus structured `handleFirestoreError` diagnostics.
2. **Real-Time Listener & Initial Seed Migration (`TournamentContext`)**:
   - Attach an `onSnapshot` listener on `/teams` (ordered by `registrationDate` descending).
   - Sync any existing PostgreSQL teams and any legacy `td4_unsynced_teams_v4` entries into Firestore automatically so zero existing records are lost.
3. **Strict Registration Handler (`registerTeam` & `RegistrationWizard`)**:
   - Validate uniqueness of Team Name, Student IDs, and `TrxID` against the live Firestore snapshot.
   - Write the new `Team` document directly to Firestore `/teams/{teamId}` using `setDoc` (and mirror to `/api/register` in the background if available).
   - If the Firestore write throws or times out (e.g. offline/network failure), throw an explicit user-facing error that `RegistrationWizard` renders in the Step 3 error alert banner, preventing `setShowSuccessModal(true)` from firing until the cloud write succeeds.
4. **Admin Mutations (`updatePaymentStatus`, `updateTeamStatus`, `deleteTeam`, `clearAllRegistrations`)**:
   - Execute `updateDoc` / `deleteDoc` directly against Firestore `/teams/{teamId}` (alongside the Express API call) so changes made in the Admin Panel immediately propagate to all Vercel and AI Studio clients.
