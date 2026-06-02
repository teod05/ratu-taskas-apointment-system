# Ratu Taškas – Internal Scheduling Tool

An internal task management web app built for a Lithuanian tire service business. Managers can create jobs, assign workers, and schedule tasks via a calendar interface, replacing manual coordination with a centralised system and eliminating scheduling conflicts.

## Tech Stack

- Next.js
- TypeScript
- React
- Supabase (Auth + PostgreSQL)

## Features

- Calendar-based job scheduling
- Worker assignment per task
- Supabase authentication for secure staff access
- Real-time updates across the team

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Set up a `.env.local` file with your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
