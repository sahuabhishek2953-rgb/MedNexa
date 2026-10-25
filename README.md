# MedNexa

> AI-powered prescription digitization and patient history platform for small clinics and private doctors.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI Primitives |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Icons | Lucide React |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| OCR | Tesseract.js |
| AI | Google Gemini Flash |

## Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `GEMINI_API_KEY` — Google Gemini API key

### 3. Set up the Database

```bash
npm run db:push     # Push schema to Neon DB (dev)
npm run db:studio   # Open Drizzle Studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # Dashboard layout group
│   │   ├── dashboard/       # Main dashboard page
│   │   ├── patients/        # Patient management
│   │   │   └── [id]/        # Patient detail
│   │   └── prescriptions/   # Prescription management
│   │       ├── upload/      # Upload & OCR flow
│   │       └── [id]/        # Prescription detail
│   ├── api/
│   │   └── ocr/             # OCR processing API route
│   ├── layout.tsx
│   └── page.tsx             # Redirects to /dashboard
├── components/
│   ├── dashboard/           # Stats cards, quick actions, recent list
│   ├── layout/              # Sidebar, header
│   ├── patients/            # Patient table, detail, add form
│   ├── prescriptions/       # Upload form, detail, medicine badges, table
│   └── shared/              # Status badge, search input
├── lib/
│   ├── db/                  # Drizzle ORM + Neon config + schema
│   ├── ocr/                 # Tesseract.js wrapper
│   ├── ai/                  # Google Gemini integration
│   └── utils/               # cn(), formatDate(), etc.
├── actions/                 # Next.js Server Actions
│   ├── patients.ts
│   └── prescriptions.ts
└── types/                   # Shared TypeScript types
```

## Key Features

- 📸 **Drag & drop** prescription image upload
- 🔍 **Tesseract OCR** — extracts raw text from handwritten prescriptions
- 🤖 **Gemini AI** — corrects OCR errors & extracts structured data (doctor, medicines, dosages, diagnosis)
- ✅ **Doctor review workflow** — review, edit, approve or reject digitized prescriptions
- 👥 **Patient management** — register patients, link prescriptions to records
- 📊 **Dashboard** — at-a-glance stats and quick actions
- 🏷️ **Tags & summaries** — AI-generated tags and plain-English summaries
- 📈 **OCR confidence indicator** — shows reliability of extraction

## OCR Pipeline

```
Image Upload
    ↓
Image Quality Check (Gemini Vision)
    ↓
Tesseract OCR → Raw Text
    ↓
Gemini Flash → Corrected Text + Structured Data
    ↓
Doctor Review & Approval
    ↓
Saved to Neon PostgreSQL
```
