# AKH Web Project

A modern web application built for the **Absolventské křesťanské hnutí (AKH)**.
This project uses the **Next.js 15** App Router, **Supabase** for backend
services, and **Tailwind CSS** for styling.

![Screenshot](opengraph-image.png)

## 🛠 Technology Stack

### Core

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)

### Frontend & UI

- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI based)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Inter (via `next/font`)

### Key Libraries

- **Forms**: `react-hook-form` + `zod` typesafe validation.
- **Rich Text Editor**: [Tiptap](https://tiptap.dev/) (Headless wrapper).
- **Notifications**: `sonner`.
- **Image Compression**: `browser-image-compression`.

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router
│   ├── (admin)/          # Protected Admin interface (layout group)
│   ├── api/              # API Routes (minimal, mostly Server Actions used)
│   └── ...               # Public pages (akce, spolecenstvi, etc.)
├── components/           # React Components
│   ├── ui/               # Reusable shadcn/ui primitives
│   └── ...               # Feature-specific components
├── lib/                  # Utilities
│   └── supabase/         # Supabase Client/Server helpers
├── scripts/              # Maintenance & Migration scripts
└── supabase/             # Database migrations & schemas
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Supabase Project

### 1. Clone & Install

```bash
git clone <repo_url>
cd akhweb
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Optional: Service role for admin scripts
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3. Run Locally

```bash
npm run dev
```

## 🔐 Admin & Security

- **Role-Based Access Control (RBAC)**: secure database policies (RLS).
- **Middleware**: Protected routes (`/admin/*`) require authentication.
- **Roles**: `admin` (full access), `editor` (content access), `user`
  (read-only).

## 📦 Deployment

### Option 1: Vercel (Recommended)

1. Import project to Vercel.
2. Add Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, etc.).
3. Deploy. Vercel automatically detects Next.js config.

### Option 2: Netlify

This project includes a `netlify.toml` for easy deployment.

1. Import project to Netlify.
2. Ensure Build Command is `npm run build` and Publish dir is `.next`.
3. **Crucial**: Add Environment Variables in Netlify Site Settings.
4. Netlify's Next.js Runtime will handle Middleware and SSR.

Note: Since this app uses **Middleware** and **SSR**, it cannot be a purely
static site (`next export` is not supported). It requires a Node.js runtime
(Vercel Functions or Netlify Functions).

## 🗄 Database Management

Scripts are located in `scripts/`:

- `setup_rbac.sql`: Initial Role-Based Access Control setup.
- `apply_migration.js`: Apply local SQL migrations to remote DB.
- `verify_security.js`: Audit RLS policies.
