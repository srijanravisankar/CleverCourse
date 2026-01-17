# CleverCourse Database Layer

This document describes the SQLite persistence layer for the CleverCourse application, built with **Drizzle ORM**.

## Overview

The database layer provides:

- **SQLite** storage via `better-sqlite3`
- **Drizzle ORM** for type-safe queries
- **Server Actions** for Next.js integration
- **Repository pattern** for clean data access

## Directory Structure

```
src/db/
├── index.ts        # Database connection and Drizzle instance
├── schema.ts       # Table definitions and relations
├── types.ts        # TypeScript types for all models
├── repositories.ts # Repository layer with CRUD operations
├── utils.ts        # Helper functions (parsing, formatting)
└── seed.ts         # Development seed script

src/app/actions/
├── index.ts        # Re-exports all actions
├── courses.ts      # Course-related server actions
├── chat.ts         # Chat/conversation server actions
└── progress.ts     # User progress server actions

data/
└── clevercourse.db # SQLite database file (gitignored)
```

## Database Schema

### Core Entities

| Table                  | Description                 |
| ---------------------- | --------------------------- |
| `users`                | User accounts               |
| `courses`              | Learning courses            |
| `course_sections`      | Sections within a course    |
| `article_pages`        | Article content pages       |
| `flashcards`           | Flashcard study material    |
| `mind_maps`            | Mind map visualizations     |
| `mcq_questions`        | Multiple choice questions   |
| `true_false_questions` | True/False questions        |
| `fill_up_questions`    | Fill-in-the-blank questions |
| `chat_conversations`   | Chat sessions               |
| `chat_messages`        | Individual chat messages    |
| `uploaded_files`       | Course material uploads     |
| `user_progress`        | Learning progress tracking  |

### Entity Relationships

```
User
 ├── Courses (1:N)
 │    ├── Sections (1:N)
 │    │    ├── ArticlePages (1:N)
 │    │    ├── Flashcards (1:N)
 │    │    ├── MindMaps (1:N)
 │    │    ├── MCQQuestions (1:N)
 │    │    ├── TrueFalseQuestions (1:N)
 │    │    └── FillUpQuestions (1:N)
 │    └── UploadedFiles (1:N)
 ├── ChatConversations (1:N)
 │    └── ChatMessages (1:N)
 └── UserProgress (1:N per course)
```

## NPM Scripts

```bash
# Generate Drizzle migrations
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (GUI)
pnpm db:studio

# Seed database with sample data
pnpm db:seed

# Reset database (delete, recreate, seed)
pnpm db:reset
```

## Usage

### Server Actions (Recommended for Next.js)

```typescript
// In a Server Component or Server Action
import {
  getAllCourses,
  getCourseWithSections,
  createCourse,
} from "@/app/actions";

// Get all courses
const courses = await getAllCourses();

// Get course with sections
const course = await getCourseWithSections(courseId);

// Create a new course
const newCourse = await createCourse({
  topic: "Machine Learning",
  level: "beginner",
  goal: "Learn ML fundamentals",
  tone: "professional",
  sectionCount: 5,
  timeCommitment: 30,
});
```

### Direct Repository Access

```typescript
// For advanced use cases
import {
  courseRepository,
  sectionRepository,
  flashcardRepository,
} from "@/db/repositories";

// Get full course with all content
const fullCourse = await courseRepository.findByIdFull(courseId);

// Create section with content
const section = await sectionRepository.create({
  courseId: course.id,
  sectionNumber: 1,
  title: "Introduction",
});

// Update flashcard with spaced repetition
await flashcardRepository.updateReview(flashcardId, true);
```

### Type-Safe Queries

```typescript
import type {
  Course,
  CourseSection,
  FullCourse,
  CreateCourseInput,
} from "@/db/types";

// All types are inferred from the schema
function processCourse(course: Course) {
  console.log(course.title, course.status);
}
```

## Key Features

### 1. Spaced Repetition for Flashcards

Flashcards include built-in spaced repetition:

```typescript
// After reviewing a flashcard
await flashcardRepository.updateReview(flashcardId, isCorrect);
// Automatically adjusts difficulty and next review date
```

### 2. Quiz Answer Tracking

Quiz questions track user attempts:

```typescript
// Submit an MCQ answer
const result = await mcqRepository.submitAnswer(questionId, "Answer A");
console.log(result.isCorrect); // true/false

// Reset attempts for a section
await resetSectionQuizzes(sectionId);
```

### 3. Progress Tracking

Comprehensive progress tracking per course:

```typescript
// Increment metrics
await incrementArticlesRead(courseId);
await incrementFlashcardsReviewed(courseId);
await addTimeSpent(courseId, 300); // 5 minutes

// Update quiz score
await updateQuizScore(courseId, 85); // 85%
```

### 4. Chat Persistence

Chat conversations are persisted with context:

```typescript
// Create conversation for a course
const conv = await createConversation(courseId, "Help with ML");

// Add messages
await addMessage(conv.id, "user", "What is supervised learning?");
await addMessage(conv.id, "assistant", "Supervised learning is...");

// Get conversation with all messages
const fullConv = await getConversationWithMessages(conv.id);
```

## Utility Functions

```typescript
import {
  parseMindMap, // Parse JSON mind map data
  parseMcqQuestion, // Parse JSON MCQ options
  formatTimeSpent, // "5h 30m"
  calculateQuizScore, // { score: 80, attempted: 4, total: 5 }
  shuffleArray, // Randomize quiz options
} from "@/db/utils";
```

## Development

### Adding a New Table

1. Define the table in `schema.ts`:

```typescript
export const newTable = sqliteTable("new_table", {
  id: text("id").primaryKey(),
  // ... columns
});
```

2. Add relations if needed:

```typescript
export const newTableRelations = relations(newTable, ({ one, many }) => ({
  // ... relations
}));
```

3. Export types in `types.ts`:

```typescript
export type NewRecord = InferSelectModel<typeof newTable>;
export type InsertNewRecord = InferInsertModel<typeof newTable>;
```

4. Add repository in `repositories.ts`:

```typescript
export const newRepository = {
  async create(data) {
    /* ... */
  },
  async findById(id) {
    /* ... */
  },
  // ...
};
```

5. Push schema changes:

```bash
pnpm db:push
```

### Testing Database

```bash
# Seed with test data
pnpm db:seed

# Open visual database browser
pnpm db:studio

# Reset and reseed
pnpm db:reset
```

## Configuration

Database configuration is in `drizzle.config.ts`:

```typescript
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/clevercourse.db",
  },
});
```

## Notes

- Database file is stored at `data/clevercourse.db`
- WAL mode is enabled for better performance
- Foreign keys are enforced
- The database file is gitignored (each developer seeds locally)
- Server Actions handle all frontend-database communication
