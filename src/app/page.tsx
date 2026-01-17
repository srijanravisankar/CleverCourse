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

// Mock course data for the graph
const MOCK_COURSE_DATA = {
  courseTitle: "React Fundamentals",
  sections: [
    {
      id: "sec-1",
      title: "Introduction to Hooks",
      isActive: true,
    },
    {
      id: "sec-2",
      title: "Advanced UseEffect",
      isActive: false,
    },
    {
      id: "sec-3",
      title: "Custom Hooks",
      isActive: false,
    },
  ],
};

export default function CoursePage() {
  const { activeView } = useCourseStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "350px" } as React.CSSProperties}
    >
      <AppSidebar />

      <SidebarInset className="flex flex-col">
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
                <BreadcrumbPage className="capitalize">
                  {activeView}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4">
          {activeView === "article" && (
            <ArticleView pages={MOCK_COURSE_SECTION.article.pages} />
          )}

          {activeView === "flashcards" && (
            <div className="max-w-xl mx-auto py-10">
              <Flashcards
                cards={MOCK_COURSE_SECTION.studyMaterial.flashcards}
              />
            </div>
          )}

          {activeView === "mindmap" && (
            <div className="max-w-5xl mx-auto overflow-hidden">
              <MindMap data={MOCK_COURSE_SECTION.studyMaterial.mindMap} />
            </div>
          )}

          {activeView === "network" && (
            <div className="w-full h-full">
              <CourseGraph courseData={MOCK_COURSE_DATA} />
            </div>
          )}

          {activeView === "quiz" && (
            <div className="max-w-2xl mx-auto py-10 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready for the Quiz?</h2>
              <p className="text-muted-foreground italic">
                The Quiz component will go here next!
              </p>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* TODO: Add the "Interactive Chat" sidebar here for the right side */}
    </SidebarProvider>
  );
}
