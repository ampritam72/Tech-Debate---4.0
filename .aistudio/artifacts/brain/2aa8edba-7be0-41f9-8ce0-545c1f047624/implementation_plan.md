# Official Rulebook Downloads & Interactive Stage Debate Timer Card

This update refines the **Official Rulebook & Stage Debate Timer** section on the homepage into a 3-action layout: two dedicated PDF download buttons on the left (**Parliamentary Debate Rules & Adjudication Guidelines** and **Code of Conduct**) and a prominent, full-card interactive **Stage Debate Timer** launcher on the right featuring a custom timer-and-bell stage illustration.

## User Review & Critical Decisions

> [!IMPORTANT]
> Both clarifications from Phase 1 have been confirmed and incorporated into this plan:

- **Confirmed Decision 1 (Separate Rulebook & Conduct PDFs)**: Each download button maps to its own dedicated PDF in the public assets folder (`parliamentary-rules.pdf` / `rulebook.pdf` and `code-of-conduct.pdf`), backed by automatic PDF generation fallbacks if custom files have not yet been replaced.
- **Confirmed Decision 2 (Custom Timer & Bell Stage Artwork)**: A custom high-contrast illustration depicting a digital countdown stage clock and golden adjudication bell will be generated and embedded inside the right-side card, which acts as the primary clickable launcher for the full-screen Stage Debate Timer page.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Replaces the previous button pair on the left side of the section with two distinct document download buttons:
     - **Button 1**: `Parliamentary Debate Rules & Adjudication Guidelines` (downloads the parliamentary debate & adjudication guidelines PDF).
     - **Button 2**: `Code of Conduct` (downloads the tournament rules & code of conduct PDF).
  2. Transforms the selected right-side showcase container into a full-surface interactive button (`role="button"`) containing a custom visual banner of a debate stage countdown timer and adjudication bell. Clicking anywhere on this right-side card opens the full-screen Stage Debate Timer view.
- **Target Audience / Persona**: Tournament debaters, team leaders, and adjudicators downloading official documentation or launching the stage timer on a podium laptop.
- **Key Value**: Separates the two core tournament documents clearly while making the Stage Debate Timer visually unmistakable and effortless to launch from a single large interactive card.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Downloading Parliamentary Rules**: Clicking **Parliamentary Debate Rules & Adjudication Guidelines** triggers an immediate browser download of the parliamentary debate & adjudication rules PDF.
  2. **Downloading Code of Conduct**: Clicking **Code of Conduct** triggers an immediate browser download of the tournament code of conduct & disciplinary rules PDF.
  3. **Launching the Stage Debate Timer**: Hovering over the right-side card elevates the surface, illuminates its cyan/amber border glow, and highlights the call-to-action prompt. Clicking anywhere on the card opens the full-screen Stage Debate Timer interface.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-craft dark tournament arena UI with deep navy/obsidian claymorphism surfaces, crisp cyan (`#38bdf8`) and amber-gold (`#fbbf24`) accents.
  - *Typography & Hierarchy*: Bold geometric display headings paired with single-line action buttons and tabular numerals (`tabular-nums`) for time milestones.
  - *Component Styling & Layout*: 12-column responsive split (`lg:col-span-7` for the heading, description, and two PDF download buttons; `lg:col-span-5` for the interactive Stage Debate Timer card button).
- **Interactive Feedback & Motion**: Smooth hover lift (`-translate-y-1`), subtle image zoom on hover, accessible keyboard focus rings (`focus-visible:ring-2`), and active press feedback (`active:scale-[0.99]`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dedicated Download Endpoints with Automatic Fallback PDFs**
  - *Chosen Approach*: Support separate download routes (`/api/rulebook/download?type=parliamentary` and `/api/rulebook/download?type=conduct`) that serve custom uploaded PDFs from the public folder when present, or generate structured, printable fallback PDFs automatically.
  - *Why*: Ensures both buttons work reliably out of the box while allowing the organizer to drop updated PDF files into the public folder at any time without code changes.
  - *Alternatives Considered*: Linking both buttons to a single static file, which was passed over per user preference for separate documents.
- **Decision 2: Full-Card Interactive Timer Launcher**
  - *Chosen Approach*: Convert the right-side showcase card into an accessible button element wrapping the custom timer-and-bell illustration, title, and bell milestone summary.
  - *Why*: Eliminates redundant buttons on the left while giving the Stage Debate Timer a high-impact visual entry point.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                Official Rulebook & Stage Debate Timer Section             │
├─────────────────────────────────────┬─────────────────────────────────────┤
│        Left Column (7 Cols)         │        Right Column (5 Cols)        │
│                                     │                                     │
│  ┌───────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ Button 1: Parliamentary       │  │  │ Interactive Timer Card Button │  │
│  │ Debate Rules & Adjudication   │──┼─►│  • Custom Timer + Bell Image  │  │
│  │ Guidelines (PDF Download)     │  │  │  • Title & Milestone Summary  │  │
│  └───────────────────────────────┘  │  │  • Click -> Opens Full-Screen │  │
│  ┌───────────────────────────────┐  │  │    Stage Debate Timer View    │  │
│  │ Button 2: Code of Conduct     │  │  └───────────────────────────────┘  │
│  │ (Tournament Rules Download)   │  │                                     │
│  └───────────────────────────────┘  │                                     │
└──────────────────┬──────────────────┴──────────────────┬──────────────────┘
                   │                                     │
                   ▼                                     ▼
┌─────────────────────────────────────┐ ┌───────────────────────────────────┐
│   Backend PDF Download Resolver     │ │   Full-Screen Debate Timer View   │
│  • Serves parliamentary-rules.pdf   │ │  • Giant Stage Countdown Display  │
│  • Serves code-of-conduct.pdf       │ │  • Automated 1m/2m/3m/4m Bells    │
└─────────────────────────────────────┘ └───────────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - **Left Action Row**: Contains the two download anchor buttons (`Parliamentary Debate Rules & Adjudication Guidelines` and `Code of Conduct`), styled for clear visual hierarchy and immediate file download.
  - **Right Interactive Card**: Bound directly to `onOpenTimerPage`, supporting both mouse click and keyboard activation (`Enter` / `Space`), displaying the generated stage timer & bell artwork with a fallback visual container.
