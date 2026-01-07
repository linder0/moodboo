# Creative Canvas — Moodboard to Brief

**Drop any creative references (images, screenshots, files, links) into a board and get a coherent, client-ready photoshoot brief + shot list in minutes.**

This is not a blank canvas like Miro. It's a **moodboard → brief generator**.

## Target Users

- Creative directors
- Producers
- Photographers
- Stylists
- Brand creative teams (fashion/lifestyle)

## Features

- **Collect**: Add references via image upload, file upload (PDFs), link paste, or text snippets
- **Annotate**: Add notes, tags, and roles (lighting/styling/pose/etc.) to each reference
- **Synthesize**: AI generates a complete photoshoot brief with concept, aesthetic clusters, direction, and shot list
- **Export**: Download a client-ready PDF

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **AI**: OpenAI GPT-4o (with vision)
- **Styling**: Tailwind CSS + shadcn/ui
- **PDF Export**: @react-pdf/renderer

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Create a storage bucket named `references` with public access
4. Copy your project URL and keys

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
/src
  /app
    /page.tsx                    # Board list
    /board/[id]/page.tsx         # Board editor
    /board/[id]/export/page.tsx  # Export preview
    /api
      /boards/route.ts           # CRUD boards
      /cards/route.ts            # CRUD cards
      /synthesize/route.ts       # AI synthesis
      /link-preview/route.ts     # OpenGraph fetch
      /export/route.ts           # PDF generation

  /components
    /boards                      # Board list components
    /editor                      # Board editor components
    /output                      # AI output display components
    /export                      # PDF export components
    /ui                          # shadcn components

  /lib
    /supabase.ts                 # Supabase client
    /openai.ts                   # OpenAI client
    /prompts.ts                  # AI synthesis prompts
    /schemas.ts                  # Zod validation schemas
    /types.ts                    # TypeScript types
```

## AI Output Structure

The synthesis generates:

- **Concept**: Title, one-liner, description, keywords
- **Aesthetic Clusters** (3 looks): Name, summary, rules, palette, lighting, styling, composition
- **Direction Blocks**: Lighting, styling, composition with do/don't lists
- **Shot List** (8-12 shots): Name, intent, camera notes, lighting, styling, props/location
- **Global Do/Don't List**
- **Deliverables** (optional)
- **Risks & Mitigations** (optional)

## License

MIT
