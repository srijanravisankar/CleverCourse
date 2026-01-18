"use server";

/**
 * Course Generation Service
 *
 * This module handles the complete course generation flow:
 * 1. Creates course record
 * 2. Processes uploaded files
 * 3. Calls Gemini to generate content for each section
 * 4. Persists all generated content to the database
 */

import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";
import {
  courseRepository,
  sectionRepository,
  articleRepository,
  flashcardRepository,
  mindMapRepository,
  mcqRepository,
  trueFalseRepository,
  fillUpRepository,
  fileRepository,
  generateId,
} from "@/db/repositories";
import type { Course, CreateCourseInput, MindMapData } from "@/db/types";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentUserId } from "@/app/actions/auth";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ============================================================================
// TYPES
// ============================================================================

export interface FileUpload {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded file data
}

export interface GenerationProgress {
  status:
    | "idle"
    | "creating"
    | "uploading"
    | "generating"
    | "complete"
    | "error";
  currentSection: number;
  totalSections: number;
  message: string;
}

interface GeneratedSection {
  sectionTitle: string;
  article: {
    pages: Array<{
      pageTitle: string;
      content: string;
    }>;
  };
  studyMaterial: {
    mindMap: MindMapData;
    flashcards: Array<{
      front: string;
      back: string;
    }>;
  };
  quiz: {
    mcqs: Array<{
      question: string;
      options: string[];
      answer: string;
    }>;
    trueFalse: Array<{
      question: string;
      answer: boolean;
      explanation: string;
    }>;
    fillUps: Array<{
      sentence: string;
      missingWord: string;
    }>;
  };
}

// ============================================================================
// GEMINI SCHEMA
// ============================================================================

const courseGenerationSchema: Schema = {
  description:
    "Complete course section with article, study materials, and quizzes",
  type: SchemaType.OBJECT,
  properties: {
    sectionTitle: {
      type: SchemaType.STRING,
      description: "Clear, descriptive title for this section",
    },
    article: {
      type: SchemaType.OBJECT,
      description: "Educational article content split into pages",
      properties: {
        pages: {
          type: SchemaType.ARRAY,
          description: "Article pages (3 pages recommended)",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              pageTitle: {
                type: SchemaType.STRING,
                description: "Title for this page",
              },
              content: {
                type: SchemaType.STRING,
                description:
                  "Full markdown content with headings, lists, code blocks, etc.",
              },
            },
            required: ["pageTitle", "content"],
          },
        },
      },
      required: ["pages"],
    },
    studyMaterial: {
      type: SchemaType.OBJECT,
      description: "Study materials for reinforcement",
      properties: {
        mindMap: {
          type: SchemaType.OBJECT,
          description: "Hierarchical mind map structure",
          properties: {
            label: {
              type: SchemaType.STRING,
              description: "Root node label (section topic)",
            },
            children: {
              type: SchemaType.ARRAY,
              description: "Child concept nodes",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  label: { type: SchemaType.STRING },
                  children: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        label: { type: SchemaType.STRING },
                      },
                      required: ["label"],
                    },
                  },
                },
                required: ["label"],
              },
            },
          },
          required: ["label"],
        },
        flashcards: {
          type: SchemaType.ARRAY,
          description: "5-8 flashcards for key concepts",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              front: {
                type: SchemaType.STRING,
                description: "Question or prompt",
              },
              back: {
                type: SchemaType.STRING,
                description: "Answer or explanation",
              },
            },
            required: ["front", "back"],
          },
        },
      },
      required: ["mindMap", "flashcards"],
    },
    quiz: {
      type: SchemaType.OBJECT,
      description: "Quiz questions for assessment",
      properties: {
        mcqs: {
          type: SchemaType.ARRAY,
          description: "5 multiple choice questions",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: "Exactly 4 options",
              },
              answer: {
                type: SchemaType.STRING,
                description:
                  "The correct option (must match one of the options exactly)",
              },
            },
            required: ["question", "options", "answer"],
          },
        },
        trueFalse: {
          type: SchemaType.ARRAY,
          description: "5 true/false questions",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              answer: { type: SchemaType.BOOLEAN },
              explanation: {
                type: SchemaType.STRING,
                description: "Brief explanation of why the answer is correct",
              },
            },
            required: ["question", "answer", "explanation"],
          },
        },
        fillUps: {
          type: SchemaType.ARRAY,
          description: "5 fill-in-the-blank questions",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              sentence: {
                type: SchemaType.STRING,
                description: "Sentence with ______ indicating the blank",
              },
              missingWord: {
                type: SchemaType.STRING,
                description: "The correct word/phrase for the blank",
              },
            },
            required: ["sentence", "missingWord"],
          },
        },
      },
      required: ["mcqs", "trueFalse", "fillUps"],
    },
  },
  required: ["sectionTitle", "article", "studyMaterial", "quiz"],
};

// ============================================================================
// FILE HANDLING
// ============================================================================

/**
 * Save uploaded files to disk and database
 */
async function saveUploadedFiles(
  courseId: string,
  files: FileUpload[],
): Promise<string[]> {
  if (files.length === 0) return [];

  const uploadDir = path.join(process.cwd(), "data", "uploads", courseId);
  await mkdir(uploadDir, { recursive: true });

  const extractedTexts: string[] = [];

  for (const file of files) {
    const filename = `${generateId()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    const relativePath = path.join("uploads", courseId, filename);

    // Decode base64 and save file
    const buffer = Buffer.from(file.data, "base64");
    await writeFile(filePath, buffer);

    // Extract text based on file type
    let extractedText = "";
    if (
      file.type.includes("text") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md")
    ) {
      extractedText = buffer.toString("utf-8");
    }
    // For PDF, DOCX, etc. - we'd need additional libraries
    // For now, we'll just note that the file was uploaded

    // Save to database
    await fileRepository.create({
      courseId,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: relativePath,
      isProcessed: extractedText.length > 0,
      extractedText: extractedText || null,
    });

    if (extractedText) {
      extractedTexts.push(`=== File: ${file.name} ===\n${extractedText}`);
    }
  }

  return extractedTexts;
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is a rate limit error (429)
 */
function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("429") ||
      error.message.includes("Too Many Requests")
    );
  }
  return false;
}

/**
 * Extract retry delay from error message or use default
 */
function getRetryDelay(error: unknown, attempt: number): number {
  // Try to extract retry delay from error message
  if (error instanceof Error) {
    const match = error.message.match(/retry in (\d+(?:\.\d+)?)/i);
    if (match) {
      return Math.ceil(parseFloat(match[1]) * 1000) + 1000; // Add 1 second buffer
    }
  }
  // Exponential backoff: 10s, 20s, 40s, 80s...
  return Math.min(10000 * Math.pow(2, attempt), 120000);
}

// ============================================================================
// SECTION GENERATION
// ============================================================================

/**
 * Generate a single section using Gemini with retry logic for rate limits
 */
async function generateSection(
  courseInput: CreateCourseInput,
  sectionNumber: number,
  totalSections: number,
  previousContext: string,
  fileContext: string,
  maxRetries: number = 5,
): Promise<GeneratedSection> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: courseGenerationSchema,
      temperature: 0.7,
      maxOutputTokens: 8192, // Increase output token limit to prevent truncation
    },
  });

  const prompt = `You are an expert educator creating a comprehensive online course. Generate Section ${sectionNumber} of ${totalSections} for a course on "${courseInput.topic}".

## Course Configuration:
- **Topic**: ${courseInput.topic}
- **Target Level**: ${courseInput.level}
- **Learning Goal**: ${courseInput.goal}
- **Teaching Tone**: ${courseInput.tone}
${courseInput.targetAudience ? `- **Target Audience**: ${courseInput.targetAudience}` : ""}
${courseInput.prerequisites ? `- **Prerequisites**: ${courseInput.prerequisites}` : ""}
- **Daily Time Commitment**: ${courseInput.timeCommitment} minutes

## Section Context:
${previousContext ? `**Previous Sections Summary**: ${previousContext}` : "This is the first section - introduce the topic fundamentals."}

${
  fileContext
    ? `## Reference Materials (uploaded by user):
${fileContext}

Use these materials as reference to ensure accuracy and relevance.`
    : ""
}

## Requirements:
1. **Article**: Create 3 comprehensive pages in Markdown format with:
   - Clear headings and subheadings
   - Code examples where relevant (use proper markdown code blocks)
   - Bullet points and numbered lists
   - Bold and italic emphasis for key terms
   - Practical examples and analogies

2. **Mind Map**: Create a hierarchical concept map with:
   - Root node = main topic of this section
   - 3-4 main branches
   - 2-3 sub-concepts per branch

3. **Flashcards**: Create 5-8 flashcards covering:
   - Key definitions
   - Important concepts
   - Common patterns/practices

4. **Quiz**:
   - **5 MCQs**: 4 options each, one correct answer
   - **5 True/False**: With brief explanations
   - **5 Fill-in-the-blanks**: Use ______ for the blank

## Critical Rules:
- Content must be educational, accurate, and engaging
- Match the specified tone (${courseInput.tone})
- Ensure proper difficulty for ${courseInput.level} level
- No duplicate content from previous sections
- All quiz answers must be unambiguous and correct`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      let parsed: GeneratedSection;
      try {
        parsed = JSON.parse(responseText) as GeneratedSection;
      } catch (parseError) {
        // JSON parsing failed - this is usually due to truncation
        console.error(
          `JSON parse error for section ${sectionNumber} (attempt ${attempt + 1}/${maxRetries}):`,
          parseError instanceof Error ? parseError.message : parseError,
        );

        // If we have more retries, try again
        if (attempt < maxRetries - 1) {
          console.log(
            `Retrying section ${sectionNumber} due to malformed JSON...`,
          );
          await sleep(2000); // Wait 2 seconds before retry
          continue;
        }
        throw parseError;
      }

      // Validate the response has required fields
      if (
        !parsed.sectionTitle ||
        !parsed.article?.pages ||
        !parsed.studyMaterial ||
        !parsed.quiz
      ) {
        throw new Error("Invalid response structure from Gemini");
      }

      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if this is a rate limit error
      if (isRateLimitError(error)) {
        const retryDelay = getRetryDelay(error, attempt);
        console.log(
          `Rate limit hit for section ${sectionNumber}. Attempt ${attempt + 1}/${maxRetries}. ` +
            `Waiting ${Math.round(retryDelay / 1000)}s before retry...`,
        );
        await sleep(retryDelay);
        continue;
      }

      // Check if this is a JSON parse error (handled above but just in case)
      if (error instanceof SyntaxError) {
        if (attempt < maxRetries - 1) {
          console.log(`Retrying section ${sectionNumber} due to JSON error...`);
          await sleep(2000);
          continue;
        }
      }

      // For non-rate-limit errors, throw immediately
      console.error("Generation error for section", sectionNumber, error);
      throw new Error(`Failed to generate section ${sectionNumber}: ${error}`);
    }
  }

  // If we exhausted all retries
  console.error("Max retries exceeded for section", sectionNumber);
  throw new Error(
    `Failed to generate section ${sectionNumber} after ${maxRetries} attempts. ` +
      `Last error: ${lastError?.message || "Unknown error"}. ` +
      `Your Gemini API quota may be exhausted. Please wait a few minutes and try again.`,
  );
}

/**
 * Persist a generated section to the database using a transaction for atomicity
 */
async function persistSection(
  courseId: string,
  sectionNumber: number,
  content: GeneratedSection,
  previousContext: string,
): Promise<string> {
  // Use the raw sqlite instance for transaction
  const { sqlite } = await import("@/db/index");

  // Prepare all the data before starting the transaction
  const sectionId = crypto.randomUUID();

  const articlePagesData = content.article.pages.map((page, index) => ({
    id: crypto.randomUUID(),
    sectionId,
    pageNumber: index + 1,
    pageTitle: page.pageTitle,
    content: page.content,
  }));

  const mindMapData = content.studyMaterial.mindMap
    ? {
        id: crypto.randomUUID(),
        sectionId,
        data: JSON.stringify(content.studyMaterial.mindMap),
      }
    : null;

  const flashcardsData = content.studyMaterial.flashcards.map((card) => ({
    id: crypto.randomUUID(),
    sectionId,
    front: card.front,
    back: card.back,
  }));

  const mcqsData = content.quiz.mcqs.map((mcq) => ({
    id: crypto.randomUUID(),
    sectionId,
    question: mcq.question,
    options: JSON.stringify(mcq.options),
    answer: mcq.answer,
  }));

  const trueFalseData = content.quiz.trueFalse.map((tf) => ({
    id: crypto.randomUUID(),
    sectionId,
    question: tf.question,
    answer: tf.answer ? 1 : 0,
    explanation: tf.explanation,
  }));

  const fillUpsData = content.quiz.fillUps.map((fill) => ({
    id: crypto.randomUUID(),
    sectionId,
    sentence: fill.sentence,
    missingWord: fill.missingWord,
  }));

  // Execute all inserts in a single transaction for speed
  const now = new Date().getTime(); // SQLite stores timestamps as integers

  sqlite.transaction(() => {
    // Insert section (course_sections has updated_at)
    sqlite
      .prepare(
        `
      INSERT INTO course_sections (id, course_id, section_number, title, previous_context, is_completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `,
      )
      .run(
        sectionId,
        courseId,
        sectionNumber,
        content.sectionTitle,
        previousContext,
        now,
        now,
      );

    // Insert article pages (no updated_at column)
    const insertArticle = sqlite.prepare(`
      INSERT INTO article_pages (id, section_id, page_number, page_title, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const page of articlePagesData) {
      insertArticle.run(
        page.id,
        page.sectionId,
        page.pageNumber,
        page.pageTitle,
        page.content,
        now,
      );
    }

    // Insert mind map (no updated_at column)
    if (mindMapData) {
      sqlite
        .prepare(
          `
        INSERT INTO mind_maps (id, section_id, data, created_at)
        VALUES (?, ?, ?, ?)
      `,
        )
        .run(mindMapData.id, mindMapData.sectionId, mindMapData.data, now);
    }

    // Insert flashcards (no updated_at column)
    const insertFlashcard = sqlite.prepare(`
      INSERT INTO flashcards (id, section_id, front, back, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const card of flashcardsData) {
      insertFlashcard.run(card.id, card.sectionId, card.front, card.back, now);
    }

    // Insert MCQs (no updated_at column)
    const insertMcq = sqlite.prepare(`
      INSERT INTO mcq_questions (id, section_id, question, options, answer, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const mcq of mcqsData) {
      insertMcq.run(
        mcq.id,
        mcq.sectionId,
        mcq.question,
        mcq.options,
        mcq.answer,
        now,
      );
    }

    // Insert True/False (no updated_at column)
    const insertTf = sqlite.prepare(`
      INSERT INTO true_false_questions (id, section_id, question, answer, explanation, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const tf of trueFalseData) {
      insertTf.run(
        tf.id,
        tf.sectionId,
        tf.question,
        tf.answer,
        tf.explanation,
        now,
      );
    }

    // Insert Fill-ups (no updated_at column)
    const insertFill = sqlite.prepare(`
      INSERT INTO fill_up_questions (id, section_id, sentence, missing_word, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const fill of fillUpsData) {
      insertFill.run(
        fill.id,
        fill.sectionId,
        fill.sentence,
        fill.missingWord,
        now,
      );
    }
  })();

  // Return a summary for context in next section
  return `Section ${sectionNumber}: ${content.sectionTitle} - Covered: ${content.article.pages.map((p) => p.pageTitle).join(", ")}`;
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

/**
 * Generate the first section and create course record
 * Returns immediately after first section is ready so user can start learning
 */
export async function generateFirstSection(
  input: CreateCourseInput,
  files: FileUpload[] = [],
): Promise<{ success: boolean; courseId?: string; error?: string }> {
  let courseId: string | undefined;

  try {
    // Get the current user ID from the session
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated. Please log in." };
    }

    // Step 1: Create the course record
    const course = await courseRepository.create({
      userId,
      title: input.topic,
      topic: input.topic,
      description: `A ${input.level} level course on ${input.topic} designed to help you ${input.goal}.`,
      level: input.level,
      goal: input.goal,
      tone: input.tone,
      targetAudience: input.targetAudience ?? null,
      prerequisites: input.prerequisites ?? null,
      sectionCount: input.sectionCount,
      timeCommitment: input.timeCommitment,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      status: "generating",
    });
    courseId = course.id;

    // Step 2: Save uploaded files and extract text
    const fileContexts = await saveUploadedFiles(courseId, files);
    const fileContext = fileContexts.join("\n\n").slice(0, 10000);

    // Step 3: Generate ONLY the first section
    console.log(`Generating section 1 of ${input.sectionCount}...`);

    const sectionContent = await generateSection(
      input,
      1,
      input.sectionCount,
      "",
      fileContext,
    );

    // Persist first section to database
    await persistSection(courseId, 1, sectionContent, "");

    console.log(`First section of course ${courseId} generated successfully!`);
    return { success: true, courseId };
  } catch (error) {
    console.error("First section generation failed:", error);

    // Mark course as failed if it was created
    if (courseId) {
      await courseRepository.update(courseId, {
        status: "draft",
        description: `Generation failed: ${error}`,
      });
    }

    return {
      success: false,
      courseId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create course record and save uploaded files without generating any sections.
 * This allows the UI to close immediately and show loading state in the sidebar.
 */
export async function createCourseOnly(
  input: CreateCourseInput,
  files: FileUpload[] = [],
): Promise<{ success: boolean; courseId?: string; error?: string }> {
  try {
    // Get the current user ID from the session
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated. Please log in." };
    }

    // Step 1: Create the course record
    const course = await courseRepository.create({
      userId,
      title: input.topic,
      topic: input.topic,
      description: `A ${input.level} level course on ${input.topic} designed to help you ${input.goal}.`,
      level: input.level,
      goal: input.goal,
      tone: input.tone,
      targetAudience: input.targetAudience ?? null,
      prerequisites: input.prerequisites ?? null,
      sectionCount: input.sectionCount,
      timeCommitment: input.timeCommitment,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      status: "generating",
    });

    // Step 2: Save uploaded files (but don't extract text yet, that happens during generation)
    if (files.length > 0) {
      await saveUploadedFiles(course.id, files);
    }

    console.log(`Course ${course.id} created, ready for section generation`);
    return { success: true, courseId: course.id };
  } catch (error) {
    console.error("Course creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate a specific section of an existing course (for progressive loading)
 */
export async function generateNextSection(
  courseId: string,
  sectionNumber: number,
): Promise<{ success: boolean; sectionId?: string; error?: string }> {
  try {
    // Get the course
    const course = await courseRepository.findById(courseId);
    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Get existing sections for context
    const sections = await sectionRepository.findByCourseId(courseId);
    const previousSections = sections.filter(
      (s) => s.sectionNumber < sectionNumber,
    );
    const previousContext = previousSections
      .map((s) => `Section ${s.sectionNumber}: ${s.title}`)
      .join("\n");

    // Get file context
    const files = await fileRepository.findByCourseId(courseId);
    const fileContext = files
      .filter((f) => f.extractedText)
      .map((f) => `=== ${f.originalName} ===\n${f.extractedText}`)
      .join("\n\n")
      .slice(0, 10000);

    // Build input from course data
    const input: CreateCourseInput = {
      topic: course.topic,
      level: course.level as CreateCourseInput["level"],
      goal: course.goal,
      tone: course.tone as CreateCourseInput["tone"],
      targetAudience: course.targetAudience ?? undefined,
      prerequisites: course.prerequisites ?? undefined,
      sectionCount: course.sectionCount,
      timeCommitment: course.timeCommitment,
    };

    console.log(
      `Generating section ${sectionNumber} of ${course.sectionCount}...`,
    );

    const sectionContent = await generateSection(
      input,
      sectionNumber,
      course.sectionCount,
      previousContext,
      fileContext,
    );

    const sectionSummary = await persistSection(
      courseId,
      sectionNumber,
      sectionContent,
      previousContext,
    );

    // Check if this was the last section
    const updatedSections = await sectionRepository.findByCourseId(courseId);
    if (updatedSections.length >= course.sectionCount) {
      await courseRepository.updateStatus(courseId, "active");
      console.log(`Course ${courseId} fully generated!`);
    }

    // Get the created section to return its ID
    const createdSection = updatedSections.find(
      (s) => s.sectionNumber === sectionNumber,
    );

    return { success: true, sectionId: createdSection?.id };
  } catch (error) {
    console.error(`Section ${sectionNumber} generation failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate and create a complete course (legacy - generates all at once)
 *
 * This is the main entry point for course creation:
 * 1. Creates the course record
 * 2. Saves uploaded files
 * 3. Generates each section with Gemini
 * 4. Persists all content to database
 * 5. Returns the completed course
 */
export async function generateAndCreateCourse(
  input: CreateCourseInput,
  files: FileUpload[] = [],
): Promise<{ success: boolean; courseId?: string; error?: string }> {
  let courseId: string | undefined;

  try {
    // Get the current user ID from the session
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated. Please log in." };
    }

    // Step 1: Create the course record
    const course = await courseRepository.create({
      userId,
      title: input.topic,
      topic: input.topic,
      description: `A ${input.level} level course on ${input.topic} designed to help you ${input.goal}.`,
      level: input.level,
      goal: input.goal,
      tone: input.tone,
      targetAudience: input.targetAudience ?? null,
      prerequisites: input.prerequisites ?? null,
      sectionCount: input.sectionCount,
      timeCommitment: input.timeCommitment,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      status: "generating",
    });
    courseId = course.id;

    // Step 2: Save uploaded files and extract text
    const fileContexts = await saveUploadedFiles(courseId, files);
    const fileContext = fileContexts.join("\n\n").slice(0, 10000); // Limit context size

    // Step 3: Generate each section
    let previousContext = "";

    for (let i = 1; i <= input.sectionCount; i++) {
      console.log(`Generating section ${i} of ${input.sectionCount}...`);

      // Generate the section content
      const sectionContent = await generateSection(
        input,
        i,
        input.sectionCount,
        previousContext,
        fileContext,
      );

      // Persist to database
      const sectionSummary = await persistSection(
        courseId,
        i,
        sectionContent,
        previousContext,
      );

      // Build context for next section
      previousContext = previousContext
        ? `${previousContext}\n${sectionSummary}`
        : sectionSummary;
    }

    // Step 4: Update course status to active
    await courseRepository.updateStatus(courseId, "active");

    console.log(`Course ${courseId} generated successfully!`);
    return { success: true, courseId };
  } catch (error) {
    console.error("Course generation failed:", error);

    // Mark course as failed if it was created
    if (courseId) {
      await courseRepository.update(courseId, {
        status: "draft",
        description: `Generation failed: ${error}`,
      });
    }

    return {
      success: false,
      courseId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Regenerate a single section of an existing course
 */
export async function regenerateSection(
  courseId: string,
  sectionNumber: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the course
    const course = await courseRepository.findById(courseId);
    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Get existing sections for context
    const sections = await sectionRepository.findByCourseId(courseId);
    const previousSections = sections.filter(
      (s) => s.sectionNumber < sectionNumber,
    );
    const previousContext = previousSections
      .map((s) => `Section ${s.sectionNumber}: ${s.title}`)
      .join("\n");

    // Get file context
    const files = await fileRepository.findByCourseId(courseId);
    const fileContext = files
      .filter((f) => f.extractedText)
      .map((f) => `=== ${f.originalName} ===\n${f.extractedText}`)
      .join("\n\n")
      .slice(0, 10000);

    // Delete existing section content
    const existingSection = sections.find(
      (s) => s.sectionNumber === sectionNumber,
    );
    if (existingSection) {
      await sectionRepository.delete(existingSection.id);
    }

    // Generate new content
    const input: CreateCourseInput = {
      topic: course.topic,
      level: course.level as CreateCourseInput["level"],
      goal: course.goal,
      tone: course.tone as CreateCourseInput["tone"],
      targetAudience: course.targetAudience ?? undefined,
      prerequisites: course.prerequisites ?? undefined,
      sectionCount: course.sectionCount,
      timeCommitment: course.timeCommitment,
    };

    const sectionContent = await generateSection(
      input,
      sectionNumber,
      course.sectionCount,
      previousContext,
      fileContext,
    );

    await persistSection(
      courseId,
      sectionNumber,
      sectionContent,
      previousContext,
    );

    return { success: true };
  } catch (error) {
    console.error("Section regeneration failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
