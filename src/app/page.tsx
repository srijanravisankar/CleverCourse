"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ArticleView } from "@/components/course/ArticleView";
import { CourseGraph } from "@/components/course/CourseGraph";
import { Flashcards } from "@/components/studyMaterial/Flashcards";
import { useCourseStore } from "@/store/use-course-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MindMap } from "@/components/studyMaterial/MindMap";
import { MultipleChoice } from "@/components/quiz/MultipleChoice";
import { Button } from "@/components/ui/button";
import { TrueFalse } from "@/components/quiz/TrueFalse";
import { FillInTheBlanks } from "@/components/quiz/FillInTheBlanks";
import { Loader2, BookOpen } from "lucide-react";
import {
  onQuizAnswerCorrect,
  onArticleCompleted,
  onMindmapReviewed,
  onFlashcardReviewed,
} from "@/app/actions/gamification";

export default function CoursePage() {
  const {
    activeView,
    currentCourse,
    currentSection,
    sections,
    isLoadingSection,
  } = useCourseStore();

  const [isMounted, setIsMounted] = React.useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = React.useState(0);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset index when view changes
  React.useEffect(() => {
    setCurrentQuizIndex(0);
  }, [activeView, currentSection?.id]);

  if (!isMounted) return null;

  // Parse mind map data from JSON string
  const parseMindMapData = (
    mindMap: { data: string } | undefined,
  ): {
    label: string;
    children: Array<{ label: string; children?: Array<{ label: string }> }>;
  } | null => {
    if (!mindMap) return null;
    try {
      const data = JSON.parse(mindMap.data);
      // Ensure children array exists
      return {
        label: data.label || "Mind Map",
        children: Array.isArray(data.children) ? data.children : [],
      };
    } catch {
      return null;
    }
  };

  // Parse MCQ options from JSON string
  const parseMcqOptions = (options: string): string[] => {
    try {
      return JSON.parse(options) as string[];
    } catch {
      return [];
    }
  };

  // Build course data for network graph
  const courseGraphData = currentCourse
    ? {
        courseTitle: currentCourse.title || currentCourse.topic,
        sections: sections.map((s) => ({
          id: s.id,
          title: s.title,
          isActive: s.id === currentSection?.id,
        })),
      }
    : null;

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />

      <main className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Header Area */}
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  {currentCourse?.title || currentCourse?.topic || "No Course"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  {currentSection?.title || "No Section"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize font-semibold text-primary">
                  {activeView}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Unified Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="p-6 max-w-5xl mx-auto">
            {/* Loading State */}
            {isLoadingSection && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading content...</p>
              </div>
            )}

            {/* Empty State - No Course Selected */}
            {!isLoadingSection && !currentCourse && (
              <EmptyState
                icon={<BookOpen className="size-12" />}
                title="Welcome to CleverCourse"
                description="Create your first AI-powered course to get started learning"
              />
            )}

            {/* Empty State - No Section Selected */}
            {!isLoadingSection && currentCourse && !currentSection && (
              <EmptyState
                icon={<BookOpen className="size-12" />}
                title="No Section Selected"
                description={
                  currentCourse.status === "generating"
                    ? "Your course is being generated. Please wait..."
                    : "Select a section from the sidebar to view its content"
                }
              />
            )}

            {/* Article View */}
            {!isLoadingSection &&
              currentSection &&
              activeView === "article" &&
              (currentSection.articlePages.length > 0 ? (
                <ArticleView
                  pages={currentSection.articlePages.map((p) => ({
                    pageTitle: p.pageTitle,
                    content: p.content,
                  }))}
                />
              ) : (
                <EmptyState
                  icon={<BookOpen className="size-12" />}
                  title="No Article Content"
                  description="This section doesn't have any article content yet"
                />
              ))}

            {/* Flashcards View */}
            {!isLoadingSection &&
              currentSection &&
              activeView === "flashcards" && (
                <div className="max-w-xl mx-auto py-10">
                  {currentSection.flashcards.length > 0 ? (
                    <Flashcards
                      cards={currentSection.flashcards.map((f) => ({
                        front: f.front,
                        back: f.back,
                      }))}
                    />
                  ) : (
                    <EmptyState
                      icon={<BookOpen className="size-12" />}
                      title="No Flashcards"
                      description="This section doesn't have any flashcards yet"
                    />
                  )}
                </div>
              )}

            {/* Mind Map View */}
            {!isLoadingSection &&
              currentSection &&
              activeView === "mindmap" && (
                <div className="overflow-hidden">
                  {currentSection.mindMaps.length > 0 &&
                  parseMindMapData(currentSection.mindMaps[0]) ? (
                    <MindMap
                      data={parseMindMapData(currentSection.mindMaps[0])!}
                    />
                  ) : (
                    <EmptyState
                      icon={<BookOpen className="size-12" />}
                      title="No Mind Map"
                      description="This section doesn't have a mind map yet"
                    />
                  )}
                </div>
              )}

            {/* Network Graph View */}
            {!isLoadingSection && activeView === "network" && (
              <div className="h-150 w-full">
                {courseGraphData && courseGraphData.sections.length > 0 ? (
                  <CourseGraph courseData={courseGraphData} />
                ) : (
                  <EmptyState
                    icon={<BookOpen className="size-12" />}
                    title="No Course Structure"
                    description="Create a course to see its network graph"
                  />
                )}
              </div>
            )}

            {/* MCQ View */}
            {!isLoadingSection && currentSection && activeView === "mcq" && (
              <div className="py-10">
                {currentSection.mcqQuestions.length > 0 ? (
                  currentQuizIndex < currentSection.mcqQuestions.length ? (
                    <MultipleChoice
                      key={`mcq-${currentQuizIndex}`}
                      question={
                        currentSection.mcqQuestions[currentQuizIndex].question
                      }
                      options={parseMcqOptions(
                        currentSection.mcqQuestions[currentQuizIndex].options,
                      )}
                      answer={
                        currentSection.mcqQuestions[currentQuizIndex].answer
                      }
                      onNext={() => setCurrentQuizIndex((prev) => prev + 1)}
                      onCorrectAnswer={() => {
                        const questionId =
                          currentSection.mcqQuestions[currentQuizIndex].id;
                        onQuizAnswerCorrect(questionId, "mcq").catch(
                          console.error,
                        );
                      }}
                    />
                  ) : (
                    <QuizCompleteView
                      onRestart={() => setCurrentQuizIndex(0)}
                      title="MCQ"
                    />
                  )
                ) : (
                  <EmptyState
                    icon={<BookOpen className="size-12" />}
                    title="No Multiple Choice Questions"
                    description="This section doesn't have any MCQs yet"
                  />
                )}
              </div>
            )}

            {/* TRUE / FALSE VIEW */}
            {!isLoadingSection && currentSection && activeView === "tf" && (
              <div className="py-10">
                {currentSection.trueFalseQuestions.length > 0 ? (
                  currentQuizIndex <
                  currentSection.trueFalseQuestions.length ? (
                    <TrueFalse
                      key={`tf-${currentQuizIndex}`}
                      question={
                        currentSection.trueFalseQuestions[currentQuizIndex]
                          .question
                      }
                      answer={
                        currentSection.trueFalseQuestions[currentQuizIndex]
                          .answer
                      }
                      explanation={
                        currentSection.trueFalseQuestions[currentQuizIndex]
                          .explanation
                      }
                      onNext={() => setCurrentQuizIndex((prev) => prev + 1)}
                      onCorrectAnswer={() => {
                        const questionId =
                          currentSection.trueFalseQuestions[currentQuizIndex]
                            .id;
                        onQuizAnswerCorrect(questionId, "tf").catch(
                          console.error,
                        );
                      }}
                    />
                  ) : (
                    <QuizCompleteView
                      onRestart={() => setCurrentQuizIndex(0)}
                      title="True/False"
                    />
                  )
                ) : (
                  <EmptyState
                    icon={<BookOpen className="size-12" />}
                    title="No True/False Questions"
                    description="This section doesn't have any True/False questions yet"
                  />
                )}
              </div>
            )}

            {/* FILL IN THE BLANKS VIEW */}
            {!isLoadingSection && currentSection && activeView === "fill" && (
              <div className="py-10">
                {currentSection.fillUpQuestions.length > 0 ? (
                  currentQuizIndex < currentSection.fillUpQuestions.length ? (
                    <FillInTheBlanks
                      key={`fill-${currentQuizIndex}`}
                      sentence={
                        currentSection.fillUpQuestions[currentQuizIndex]
                          .sentence
                      }
                      missingWord={
                        currentSection.fillUpQuestions[currentQuizIndex]
                          .missingWord
                      }
                      onNext={() => setCurrentQuizIndex((prev) => prev + 1)}
                      onCorrectAnswer={() => {
                        const questionId =
                          currentSection.fillUpQuestions[currentQuizIndex].id;
                        onQuizAnswerCorrect(questionId, "fill").catch(
                          console.error,
                        );
                      }}
                    />
                  ) : (
                    <QuizCompleteView
                      onRestart={() => setCurrentQuizIndex(0)}
                      title="Fill Ups"
                    />
                  )
                ) : (
                  <EmptyState
                    icon={<BookOpen className="size-12" />}
                    title="No Fill-in-the-Blank Questions"
                    description="This section doesn't have any fill-up questions yet"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-muted-foreground/50 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}

function QuizCompleteView({
  onRestart,
  title,
}: {
  onRestart: () => void;
  title: string;
}) {
  return (
    <div className="text-center p-10 bg-white rounded-3xl shadow-lg border border-slate-100 max-w-lg mx-auto animate-in zoom-in-95">
      <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🎉</span>
      </div>
      <h3 className="text-xl font-bold">{title} Section Complete!</h3>
      <p className="text-muted-foreground mb-6 mt-2">
        Excellent work mastering these concepts.
      </p>
      <Button onClick={onRestart} className="rounded-full px-8">
        Restart {title} Quiz
      </Button>
    </div>
  );
}
