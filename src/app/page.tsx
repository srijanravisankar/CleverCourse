"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ArticleView } from "@/components/course/ArticleView";
import { CourseGraph } from "@/components/course/CourseGraph";
import { Flashcards } from "@/components/studyMaterial/Flashcards";
import { MOCK_COURSE_SECTION } from "@/lib/placeholder";
import { useCourseStore } from "@/store/use-course-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MindMap } from "@/components/studyMaterial/MindMap";
import { MultipleChoice } from "@/components/quiz/MultipleChoice";
import { Button } from "@/components/ui/button";
import { TrueFalse } from "@/components/quiz/TrueFalse";
import { FillInTheBlanks } from "@/components/quiz/FillInTheBlanks";

// Mock course data for the graph
const MOCK_COURSE_DATA = {
  courseTitle: "React Fundamentals",
  sections: [
    { id: "sec-1", title: "Introduction to Hooks", isActive: true },
    { id: "sec-2", title: "Advanced UseEffect", isActive: false },
    { id: "sec-3", title: "Custom Hooks", isActive: false },
  ],
};

export default function CoursePage() {
  const { activeView } = useCourseStore();
  const [isMounted, setIsMounted] = React.useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = React.useState(0);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset index when view changes
  React.useEffect(() => {
    setCurrentQuizIndex(0);
  }, [activeView]);

  if (!isMounted) return null;

  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
      <AppSidebar />

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Header Area */}
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">React Fundamentals</BreadcrumbLink>
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
            {activeView === "article" && (
              <ArticleView pages={MOCK_COURSE_SECTION.article.pages} />
            )}

            {activeView === "flashcards" && (
              <div className="max-w-xl mx-auto py-10">
                <Flashcards cards={MOCK_COURSE_SECTION.studyMaterial.flashcards} />
              </div>
            )}

            {activeView === "mindmap" && (
              <div className="overflow-hidden">
                <MindMap data={MOCK_COURSE_SECTION.studyMaterial.mindMap} />
              </div>
            )}

            {activeView === "network" && (
              <div className="h-[600px] w-full">
                <CourseGraph courseData={MOCK_COURSE_DATA} />
              </div>
            )}

            {activeView === "mcq" && (
              <div className="py-10">
                {currentQuizIndex < MOCK_COURSE_SECTION.quiz.mcqs.length ? (
                  <MultipleChoice 
                    key={`mcq-${currentQuizIndex}`} 
                    question={MOCK_COURSE_SECTION.quiz.mcqs[currentQuizIndex].question}
                    options={MOCK_COURSE_SECTION.quiz.mcqs[currentQuizIndex].options}
                    answer={MOCK_COURSE_SECTION.quiz.mcqs[currentQuizIndex].answer}
                    onNext={() => setCurrentQuizIndex(prev => prev + 1)}
                  />
                ) : (
                  <QuizCompleteView onRestart={() => setCurrentQuizIndex(0)} title="MCQ" />
                )}
              </div>
            )}

            {/* TRUE / FALSE VIEW */}
            {activeView === "tf" && (
              <div className="py-10">
                {currentQuizIndex < MOCK_COURSE_SECTION.quiz.trueFalse.length ? (
                  <TrueFalse 
                    key={`tf-${currentQuizIndex}`}
                    question={MOCK_COURSE_SECTION.quiz.trueFalse[currentQuizIndex].question}
                    answer={MOCK_COURSE_SECTION.quiz.trueFalse[currentQuizIndex].answer}
                    explanation={MOCK_COURSE_SECTION.quiz.trueFalse[currentQuizIndex].explanation}
                    onNext={() => setCurrentQuizIndex(prev => prev + 1)}
                  />
                ) : (
                  <QuizCompleteView onRestart={() => setCurrentQuizIndex(0)} title="True/False" />
                )}
              </div>
            )}
      
            {/* FILL IN THE BLANKS VIEW */}
            {activeView === "fill" && (
              <div className="py-10">
                {currentQuizIndex < MOCK_COURSE_SECTION.quiz.fillUps.length ? (
                  <FillInTheBlanks 
                    key={`fill-${currentQuizIndex}`}
                    sentence={MOCK_COURSE_SECTION.quiz.fillUps[currentQuizIndex].sentence}
                    missingWord={MOCK_COURSE_SECTION.quiz.fillUps[currentQuizIndex].missingWord}
                    onNext={() => setCurrentQuizIndex(prev => prev + 1)}
                  />
                ) : (
                  <QuizCompleteView onRestart={() => setCurrentQuizIndex(0)} title="Fill Ups" />
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function QuizCompleteView({ onRestart, title }: { onRestart: () => void, title: string }) {
  return (
    <div className="text-center p-10 bg-white rounded-3xl shadow-lg border border-slate-100 max-w-lg mx-auto animate-in zoom-in-95">
      <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🎉</span>
      </div>
      <h3 className="text-xl font-bold">{title} Section Complete!</h3>
      <p className="text-muted-foreground mb-6 mt-2">Excellent work mastering these concepts.</p>
      <Button onClick={onRestart} className="rounded-full px-8">
        Restart {title} Quiz
      </Button>
    </div>
  );
}