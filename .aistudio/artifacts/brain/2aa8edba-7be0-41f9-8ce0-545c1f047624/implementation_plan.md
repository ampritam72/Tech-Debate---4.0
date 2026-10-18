# 22-Column Google Sheet Auto-Push Alignment & Live Sync Preview

Align the real-time Google Apps Script auto-push engine, CSV exporter, and Admin Console sheet preview with the exact 22-column (`A1:V1`) structure of your Google Sheet so every new squad registration and payment verification updates your spreadsheet with zero column shift.

## User Review & Critical Decisions

> [!IMPORTANT]
> Because a standard `docs.google.com/spreadsheets/d/...` link is read-only to anonymous student browsers, 24/7 automatic row insertion from any student's phone works through the **Google Apps Script Web App URL** (`script.google.com/macros/s/.../exec`) attached to your sheet and stored in Firebase Cloud Firestore.

- **Confirmed Decision 1 (Connection Method)**: 24/7 automatic push via Google Apps Script Web App URL persisted in Firebase Cloud Firestore (`settings/google_sheet`), supplemented by 1-click Google OAuth direct sync in the Admin Panel.
- **Confirmed Decision 2 (Exact 22-Column Schema)**: Strictly preserve the 22 columns (`A1:V1`) in your sheet:
  1. `Timestamp`
  2. `Team ID`
  3. `Team Name`
  4. `Batch`
  5. `Department`
  6. `Payment Method`
  7. `Sender Number`
  8. `Trx ID`
  9. `Amount (BDT)`
  10. `Payment Status`
  11. `Speaker 1 (Leader)`
  12. `Speaker 1 ID`
  13. `Speaker 1 Batch`
  14. `Speaker 1 Phone`
  15. `Speaker 2`
  16. `Speaker 2 ID`
  17. `Speaker 2 Batch`
  18. `Speaker 2 Phone`
  19. `Speaker 3`
  20. `Speaker 3 ID`
  21. `Speaker 3 Batch`
  22. `Speaker 3 Phone`

## 1. Overview & Core Concept

- **What It Does**: Ensures that the Apps Script template, client/server webhook payload formatter, direct Google OAuth writer, and CSV exporter all map 1-to-1 to your exact 22 columns (`A1:V1`). Adds an interactive **Live 22-Column Sheet Preview Table** inside the Admin Panel's Google Sheet Backup tab so you can inspect the exact rows formatted for your sheet and push/verify them in one click.
- **Target Audience / Persona**: Tournament Organizers and Super Admins of the Department of CSE, Varendra University, Rajshahi.
- **Key Value**: Eliminates any column mismatch between your existing Google Sheet header row and incoming student registrations, while providing visual confirmation of every row being pushed.

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Exact 22-Column Apps Script Copy & Deploy**:
     - The Admin copies the 22-column Apps Script from the Admin Console, pastes it into `Extensions > Apps Script` inside their Google Sheet, deploys as a Web App (`Anyone`), and saves the Web App URL in the Admin Console.
  2. **24/7 Automatic Push on Every Registration**:
     - Whenever any student registers on the website, their 22 fields are automatically sent to the cloud-saved Web App URL and appended (or updated in place by `Team ID` in Column B) in your Google Sheet.
  3. **Live 22-Column Sheet Preview in Admin Console**:
     - Directly inside the **Google Sheet Backup** tab, the admin can view a live horizontal spreadsheet preview showing all 22 columns (`Timestamp` through `Speaker 3 Phone`) populated with current Firestore registrations, along with one-click **Send Test Row** and **Sync All Squads Now** actions.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Clean SaaS data-grid and operations console matching the tournament's dark slate and emerald/cyan palette.
  - *Color Palette & Mood*: Deep slate canvas (`#091428`), crisp 1px cell borders (`border-slate-800`), emerald status indicators (`#10B981`) for `VERIFIED`, amber (`#F59E0B`) for `PENDING`, and rose (`#F43F5E`) for `REJECTED`.
  - *Typography & Hierarchy*: Monospace tabular numerals (`font-mono tabular-nums`) for timestamps, Student IDs, phone numbers, Transaction IDs, and BDT amounts.
  - *Component Styling & Layout*: Single-elevation cards with a compact 22-column scrollable spreadsheet preview table and single-line action buttons (`whitespace-nowrap shrink-0`).
- **Interactive Feedback & Motion**: Immediate toast confirmation on webhook save, test row dispatch, and bulk sync, with real-time `lastSyncAt` timestamp updates from Cloud Firestore.

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Strict 22-Column (`A1:V1`) Alignment Across All Sync Paths**
  - *Chosen Approach*: Remove the extra 23rd `Team Status` column from the Apps Script and CSV export so that Column K (`11`) is always `Speaker 1 (Leader)` and Column V (`22`) is always `Speaker 3 Phone`, matching your existing sheet header row character-for-character.
  - *Why*: Your Google Sheet already has the 22 headers in `A1:V1`; keeping the exact 22-element array prevents any column shift for Speaker 1, Speaker 2, and Speaker 3 details.
  - *Alternatives Considered*: Adding extra columns in the middle of the row (rejected because it shifts existing speaker columns).

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   22-COLUMN (A1:V1) GOOGLE SHEET PIPELINE                  │
│                                                                            │
│  ┌──────────────────────┐     22-Field Row Payload      ┌───────────────┐  │
│  │  formatTeamForSheet  │ ────────────────────────────► │ Apps Script   │  │
│  │  (A1: Timestamp ...  │                               │ Web App URL   │  │
│  │   V1: Speaker3Phone) │ ────────────────────────────► │ (Upsert by B) │  │
│  └──────────▲───────────┘     Direct OAuth API (A1:V1)  └───────┬───────┘  │
│             │                                                   │          │
│  ┌──────────┴───────────┐                                       ▼          │
│  │  TournamentContext   │                               ┌───────────────┐  │
│  │  & Admin Backup UI   │                               │ Google Sheet  │  │
│  │  (Live 22-Col Table) │                               │ Columns A - V │  │
│  └──────────────────────┘                               └───────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **22-Column Row Array (`A` to `V`)**:
    - `[0] Timestamp`, `[1] Team ID`, `[2] Team Name`, `[3] Batch`, `[4] Department`, `[5] Payment Method`, `[6] Sender Number`, `[7] Trx ID`, `[8] Amount (BDT)`, `[9] Payment Status`, `[10] Speaker 1 (Leader)`, `[11] Speaker 1 ID`, `[12] Speaker 1 Batch`, `[13] Speaker 1 Phone`, `[14] Speaker 2`, `[15] Speaker 2 ID`, `[16] Speaker 2 Batch`, `[17] Speaker 2 Phone`, `[18] Speaker 3`, `[19] Speaker 3 ID`, `[20] Speaker 3 Batch`, `[21] Speaker 3 Phone`.
- **Interactive Component & State Mapping**:
  - **Apps Script (`teamToRowArray`)**: Outputs the exact 22-element array above, prefixes phone numbers and Student IDs with `'` so Google Sheets preserves leading zeros (`017...`), and colors Column J (`10`, `Payment Status`) based on `VERIFIED` / `REJECTED` / `PENDING`.
  - **Live 22-Column Sheet Preview**: Renders the exact 22 columns in the Admin Console so the admin can visually verify how every registered squad row looks in the spreadsheet.
