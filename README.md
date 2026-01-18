# CleverCourse

An AI-powered learning platform that generates personalized courses with study materials, quizzes, and gamification features.

## Tech Stack

- Next.js 16
- TypeScript
- Drizzle ORM with Turso (libSQL)
- Google Gemini AI
- Zustand for state management

## Setup

Install dependencies:

```bash
pnpm install
```

Create a `.env` file with the following:

```
GEMINI_API_KEY=your_gemini_api_key
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

Push the database schema:

```bash
pnpm db:push
```

Run the development server:

```bash
pnpm dev
```

## Features

- AI-generated course content
- Interactive study materials (articles, flashcards, mind maps)
- Quizzes with multiple formats
- Gamification with XP, levels, and achievements
- Course progress tracking
- AI chat assistant
