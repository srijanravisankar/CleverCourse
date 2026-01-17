"use client";

import * as React from "react";
import {
  ChevronRight,
  BookOpen,
  Brain,
  Gamepad2,
  Plus,
  Command,
  Layers,
  BriefcaseBusiness,
  ListChecks,
  ToggleLeft,
  Type,
  Network,
  Loader2,
  AlertCircle,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

import { CreateCourseDialog } from "@/components/course/CreateCourseDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useCourseStore, ViewType } from "@/store/use-course-store";
import {
  getAllCourses,
  getCourseWithSections,
  getSectionWithContent,
} from "@/app/actions/courses";
import type { Course, CourseSection } from "@/db/types";
import { cn } from "@/lib/utils";

// Color palette for course icons (Discord-style colors)
const COURSE_COLORS = [
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-green-500", text: "text-white" },
  { bg: "bg-purple-500", text: "text-white" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-pink-500", text: "text-white" },
  { bg: "bg-cyan-500", text: "text-white" },
  { bg: "bg-yellow-500", text: "text-black" },
  { bg: "bg-red-500", text: "text-white" },
];

function getCourseColor(index: number) {
  return COURSE_COLORS[index % COURSE_COLORS.length];
}

function getCourseInitials(title: string): string {
  const words = title.split(" ").filter(Boolean);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function AppSidebar({ ...props }: React.ComponentProps<"div">) {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [courseSidebarOpen, setCourseSidebarOpen] = React.useState(true);

  const {
    courses,
    setCourses,
    currentCourse,
    setCurrentCourse,
    sections,
    setSections,
    activeSectionId,
    setActiveSectionId,
    setCurrentSection,
    setIsLoadingCourses,
    setIsLoadingSection,
    isLoadingCourses,
    error,
    setError,
  } = useCourseStore();

  // Fetch courses on mount
  React.useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      setError(null);
      try {
        const fetchedCourses = await getAllCourses();
        setCourses(fetchedCourses);

        // Auto-select first course if available
        if (fetchedCourses.length > 0 && !currentCourse) {
          await handleSelectCourse(fetchedCourses[0]);
        }
      } catch (err) {
        setError("Failed to load courses");
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle course selection
  const handleSelectCourse = async (course: Course) => {
    setCurrentCourse(course);
    setIsLoadingCourses(true);
    try {
      const courseWithSections = await getCourseWithSections(course.id);
      if (courseWithSections) {
        setSections(courseWithSections.sections);

        // Auto-select first section
        if (courseWithSections.sections.length > 0) {
          await handleSelectSection(courseWithSections.sections[0]);
        }
      }
    } catch (err) {
      setError("Failed to load course sections");
      console.error("Error fetching sections:", err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Handle section selection
  const handleSelectSection = async (section: CourseSection) => {
    setActiveSectionId(section.id);
    setIsLoadingSection(true);
    try {
      const sectionWithContent = await getSectionWithContent(section.id);
      if (sectionWithContent) {
        setCurrentSection(sectionWithContent);
      }
    } catch (err) {
      console.error("Error fetching section content:", err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  // Handle course creation success
  const handleCourseCreated = async (courseId: string) => {
    try {
      const fetchedCourses = await getAllCourses();
      setCourses(fetchedCourses);

      const newCourse = fetchedCourses.find((c) => c.id === courseId);
      if (newCourse) {
        await handleSelectCourse(newCourse);
      }
    } catch (err) {
      console.error("Error fetching new course:", err);
    }
    setShowCreateDialog(false);
  };

  const toggleCourseSidebar = () => {
    setCourseSidebarOpen(!courseSidebarOpen);
  };

  return (
    <>
      <CreateCourseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCourseCreated={handleCourseCreated}
      />

      <TooltipProvider delayDuration={0}>
        <div className="flex h-screen shrink-0" {...props}>
          {/* ============================================ */}
          {/* FIRST SIDEBAR: Discord-style Course Icons   */}
          {/* ============================================ */}
          <div className="flex flex-col w-[72px] bg-zinc-900 py-3 gap-2 items-center border-r border-zinc-800 shrink-0">
            {/* App Logo */}
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white mb-2 hover:rounded-xl transition-all duration-200 cursor-pointer">
              <Command className="size-6" />
            </div>

            <div className="w-8 h-[2px] bg-zinc-700 rounded-full mb-2" />

            {/* Course Icons */}
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide">
              {isLoadingCourses && courses.length === 0 ? (
                <div className="flex items-center justify-center w-12 h-12">
                  <Loader2 className="size-5 animate-spin text-zinc-400" />
                </div>
              ) : error && courses.length === 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 cursor-pointer">
                      <AlertCircle className="size-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {error}
                  </TooltipContent>
                </Tooltip>
              ) : (
                courses.map((course, index) => {
                  const colors = getCourseColor(index);
                  const isActive = currentCourse?.id === course.id;
                  const initials = getCourseInitials(
                    course.title || course.topic,
                  );

                  return (
                    <Tooltip key={course.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleSelectCourse(course)}
                          className={cn(
                            "relative flex items-center justify-center w-12 h-12 font-semibold text-sm transition-all duration-200 cursor-pointer group",
                            colors.bg,
                            colors.text,
                            isActive
                              ? "rounded-xl"
                              : "rounded-[24px] hover:rounded-xl",
                          )}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute -left-3 w-1 h-10 bg-white rounded-r-full" />
                          )}
                          {/* Hover indicator */}
                          {!isActive && (
                            <div className="absolute -left-3 w-1 h-0 bg-white rounded-r-full transition-all duration-200 group-hover:h-5" />
                          )}
                          {initials}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={10}
                        className="font-medium"
                      >
                        {course.title || course.topic}
                      </TooltipContent>
                    </Tooltip>
                  );
                })
              )}

              {/* Add Course Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="flex items-center justify-center w-12 h-12 rounded-[24px] bg-zinc-800 text-green-500 hover:rounded-xl hover:bg-green-600 hover:text-white transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="size-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Create New Course
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* ============================================ */}
          {/* SECOND SIDEBAR: Course Content/Curriculum   */}
          {/* ============================================ */}
          <div
            className={cn(
              "flex flex-col bg-sidebar border-r transition-all duration-300 ease-in-out overflow-hidden shrink-0",
              courseSidebarOpen ? "w-[280px]" : "w-0",
            )}
          >
            {/* Header */}
            <div className="border-b p-4 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Current Course
                  </span>
                  <div className="text-foreground text-base font-bold truncate">
                    {currentCourse
                      ? currentCourse.title || currentCourse.topic
                      : "No Course Selected"}
                  </div>
                  {currentCourse && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {currentCourse.level} • {currentCourse.status}
                    </span>
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleCourseSidebar}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <PanelLeftClose className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Close sidebar</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Curriculum
                  </span>
                  {currentCourse && (
                    <button
                      onClick={() => {
                        const setActiveView =
                          useCourseStore.getState().setActiveView;
                        setActiveView("network");
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      title="View Course Network Graph"
                    >
                      <Network className="size-3.5" />
                      <span>Network</span>
                    </button>
                  )}
                </div>

                {!currentCourse ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>Create or select a course to get started</p>
                  </div>
                ) : sections.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {currentCourse.status === "generating" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-5 animate-spin" />
                        <p>Generating course content...</p>
                      </div>
                    ) : (
                      <p>No sections yet</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {sections.map((section, index) => (
                      <CourseSectionItem
                        key={section.id}
                        section={section}
                        index={index}
                        isActive={activeSectionId === section.id}
                        onSelect={() => handleSelectSection(section)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Toggle button when sidebar is closed */}
          {!courseSidebarOpen && (
            <div className="flex items-start pt-4 px-2 bg-sidebar border-r shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleCourseSidebar}
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <PanelLeft className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Open sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </TooltipProvider>
    </>
  );
}

/**
 * MODULAR COMPONENT: CourseSectionItem
 * Handles the collapsible dropdown logic for each section.
 */
function CourseSectionItem({
  section,
  index,
  isActive,
  onSelect,
}: {
  section: CourseSection;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const setActiveView = useCourseStore((state) => state.setActiveView);

  const handleSubItemClick = (view: ViewType) => {
    if (!isActive) {
      onSelect();
    }
    setActiveView(view);
  };

  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <div className="flex flex-col">
        <CollapsibleTrigger asChild>
          <button
            onClick={onSelect}
            className={cn(
              "flex items-center gap-2 w-full px-2 py-2 text-left text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center size-6 rounded-full text-xs font-bold shrink-0 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover/collapsible:bg-primary group-hover/collapsible:text-primary-foreground",
              )}
            >
              {index + 1}
            </div>
            <span className="truncate flex-1">{section.title}</span>
            <ChevronRight className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="ml-4 pl-4 border-l border-border mt-1 mb-2 flex flex-col gap-0.5">
            {/* Article */}
            <button
              onClick={() => handleSubItemClick("article")}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
            >
              <BookOpen className="size-4 text-green-600" />
              <span>Article</span>
            </button>

            {/* Study Material Dropdown */}
            <Collapsible className="group/study">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="size-4 text-blue-600" />
                    <span>Study Material</span>
                  </div>
                  <ChevronRight className="size-3 transition-transform group-data-[state=open]/study:rotate-90" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 pl-2 border-l border-border mt-1 flex flex-col gap-0.5">
                  <button
                    onClick={() => handleSubItemClick("mindmap")}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                  >
                    <Brain className="size-4 text-pink-600" />
                    <span>Mind Map</span>
                  </button>
                  <button
                    onClick={() => handleSubItemClick("flashcards")}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                  >
                    <Layers className="size-4 text-yellow-600" />
                    <span>Flashcards</span>
                  </button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Quiz Dropdown */}
            <Collapsible className="group/quiz">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="size-4 text-red-600" />
                    <span>Quiz</span>
                  </div>
                  <ChevronRight className="size-3 transition-transform group-data-[state=open]/quiz:rotate-90" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 pl-2 border-l border-border mt-1 flex flex-col gap-0.5">
                  <button
                    onClick={() => handleSubItemClick("mcq")}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                  >
                    <ListChecks className="size-4 text-purple-600" />
                    <span>Multiple Choice</span>
                  </button>
                  <button
                    onClick={() => handleSubItemClick("tf")}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                  >
                    <ToggleLeft className="size-4 text-amber-700" />
                    <span>True / False</span>
                  </button>
                  <button
                    onClick={() => handleSubItemClick("fill")}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                  >
                    <Type className="size-4 text-stone-600" />
                    <span>Fill Ups</span>
                  </button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
