"use server";

/**
 * Course Server Actions
 *
 * These server actions provide the interface between the frontend
 * and the database for course-related operations.
 */

import {
  courseRepository,
  sectionRepository,
  articleRepository,
  flashcardRepository,
  mindMapRepository,
  mcqRepository,
  trueFalseRepository,
  fillUpRepository,
  generateId,
} from "@/db/repositories";
import type {
  Course,
  CourseWithSections,
  FullCourse,
  CourseSection,
  CourseSectionWithContent,
  CreateCourseInput,
  GeneratedSectionContent,
} from "@/db/types";

// ============================================================================
// COURSE ACTIONS
// ============================================================================

/**
 * Create a new course
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const course = await courseRepository.create({
    title: `Course: ${input.topic}`,
    topic: input.topic,
    level: input.level,
    goal: input.goal,
    tone: input.tone,
    targetAudience: input.targetAudience ?? null,
    prerequisites: input.prerequisites ?? null,
    sectionCount: input.sectionCount,
    timeCommitment: input.timeCommitment,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    status: "draft",
  });

  return course;
}

/**
 * Get all courses
 */
export async function getAllCourses(): Promise<Course[]> {
  return courseRepository.findAll();
}

/**
 * Get a course by ID
 */
export async function getCourseById(id: string): Promise<Course | null> {
  const course = await courseRepository.findById(id);
  return course ?? null;
}

/**
 * Get a course with all its sections
 */
export async function getCourseWithSections(
  id: string,
): Promise<CourseWithSections | null> {
  const course = await courseRepository.findByIdWithSections(id);
  return course ?? null;
}

/**
 * Get the full course with all content
 */
export async function getFullCourse(id: string): Promise<FullCourse | null> {
  const course = await courseRepository.findByIdFull(id);
  return course ?? null;
}

/**
 * Update course status
 */
export async function updateCourseStatus(
  id: string,
  status: Course["status"],
): Promise<Course | null> {
  const course = await courseRepository.updateStatus(id, status);
  return course ?? null;
}

/**
 * Update course title and description
 */
export async function updateCourseDetails(
  id: string,
  data: { title?: string; description?: string },
): Promise<Course | null> {
  const course = await courseRepository.update(id, data);
  return course ?? null;
}

/**
 * Delete a course
 */
export async function deleteCourse(id: string): Promise<void> {
  await courseRepository.delete(id);
}

/**
 * Set the current section index for a course
 */
export async function setCurrentSection(
  courseId: string,
  sectionIndex: number,
): Promise<Course | null> {
  const course = await courseRepository.update(courseId, {
    currentSectionIndex: sectionIndex,
  });
  return course ?? null;
}

// ============================================================================
// SECTION ACTIONS
// ============================================================================

/**
 * Get sections for a course
 */
export async function getCourseSections(
  courseId: string,
): Promise<CourseSection[]> {
  return sectionRepository.findByCourseId(courseId);
}

/**
 * Get a section by ID with all its content
 */
export async function getSectionWithContent(
  sectionId: string,
): Promise<CourseSectionWithContent | null> {
  const section = await sectionRepository.findByIdWithContent(sectionId);
  return section ?? null;
}

/**
 * Mark a section as complete
 */
export async function markSectionComplete(
  sectionId: string,
): Promise<CourseSection | null> {
  const section = await sectionRepository.markComplete(sectionId);

  if (section) {
    // Also increment the completed sections count on the course
    await courseRepository.incrementCompletedSections(section.courseId);
  }

  return section ?? null;
}

/**
 * Create a new section with all its content from AI-generated data
 */
export async function createSectionWithContent(
  courseId: string,
  sectionNumber: number,
  content: GeneratedSectionContent,
): Promise<CourseSection> {
  // Create the section
  const section = await sectionRepository.create({
    courseId,
    sectionNumber,
    title: content.sectionTitle,
  });

  // Create article pages
  const articlePages = content.article.pages.map((page, index) => ({
    sectionId: section.id,
    pageNumber: index + 1,
    pageTitle: page.pageTitle,
    content: page.content,
  }));
  await articleRepository.createMany(articlePages);

  // Create mind map
  await mindMapRepository.create({
    sectionId: section.id,
    data: JSON.stringify(content.studyMaterial.mindMap),
  });

  // Create flashcards
  const flashcards = content.studyMaterial.flashcards.map((card) => ({
    sectionId: section.id,
    front: card.front,
    back: card.back,
  }));
  await flashcardRepository.createMany(flashcards);

  // Create MCQ questions
  const mcqs = content.quiz.mcqs.map((mcq) => ({
    sectionId: section.id,
    question: mcq.question,
    options: JSON.stringify(mcq.options),
    answer: mcq.answer,
  }));
  await mcqRepository.createMany(mcqs);

  // Create True/False questions
  const trueFalseQs = content.quiz.trueFalse.map((tf) => ({
    sectionId: section.id,
    question: tf.question,
    answer: tf.answer,
    explanation: tf.explanation,
  }));
  await trueFalseRepository.createMany(trueFalseQs);

  // Create Fill-in-the-blank questions
  const fillUps = content.quiz.fillUps.map((fill) => ({
    sectionId: section.id,
    sentence: fill.sentence,
    missingWord: fill.missingWord,
  }));
  await fillUpRepository.createMany(fillUps);

  return section;
}

// ============================================================================
// ARTICLE ACTIONS
// ============================================================================

/**
 * Mark an article page as read
 */
export async function markArticleAsRead(articleId: string): Promise<void> {
  await articleRepository.markAsRead(articleId);
}

/**
 * Get article pages for a section
 */
export async function getSectionArticles(sectionId: string) {
  return articleRepository.findBySectionId(sectionId);
}

// ============================================================================
// FLASHCARD ACTIONS
// ============================================================================

/**
 * Get flashcards for a section
 */
export async function getSectionFlashcards(sectionId: string) {
  return flashcardRepository.findBySectionId(sectionId);
}

/**
 * Update flashcard after review (spaced repetition)
 */
export async function reviewFlashcard(flashcardId: string, isCorrect: boolean) {
  return flashcardRepository.updateReview(flashcardId, isCorrect);
}

// ============================================================================
// MIND MAP ACTIONS
// ============================================================================

/**
 * Get mind map for a section
 */
export async function getSectionMindMap(sectionId: string) {
  return mindMapRepository.findBySectionId(sectionId);
}

// ============================================================================
// QUIZ ACTIONS
// ============================================================================

/**
 * Get all quiz questions for a section
 */
export async function getSectionQuizzes(sectionId: string) {
  const [mcqs, trueFalse, fillUps] = await Promise.all([
    mcqRepository.findBySectionId(sectionId),
    trueFalseRepository.findBySectionId(sectionId),
    fillUpRepository.findBySectionId(sectionId),
  ]);

  return { mcqs, trueFalse, fillUps };
}

/**
 * Submit an MCQ answer
 */
export async function submitMcqAnswer(questionId: string, answer: string) {
  return mcqRepository.submitAnswer(questionId, answer);
}

/**
 * Submit a True/False answer
 */
export async function submitTrueFalseAnswer(
  questionId: string,
  answer: boolean,
) {
  return trueFalseRepository.submitAnswer(questionId, answer);
}

/**
 * Submit a Fill-in-the-blank answer
 */
export async function submitFillUpAnswer(questionId: string, answer: string) {
  return fillUpRepository.submitAnswer(questionId, answer);
}

/**
 * Reset all quiz attempts for a section
 */
export async function resetSectionQuizzes(sectionId: string) {
  const [mcqs, trueFalse, fillUps] = await Promise.all([
    mcqRepository.findBySectionId(sectionId),
    trueFalseRepository.findBySectionId(sectionId),
    fillUpRepository.findBySectionId(sectionId),
  ]);

  // Reset all questions
  await Promise.all([
    ...mcqs.map((q) => mcqRepository.resetAttempt(q.id)),
    ...trueFalse.map((q) => trueFalseRepository.resetAttempt(q.id)),
    ...fillUps.map((q) => fillUpRepository.resetAttempt(q.id)),
  ]);
}
