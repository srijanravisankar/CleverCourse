"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  BookOpen,
  Brain,
  Gamepad2,
  Plus,
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
  GraduationCap,
  User,
  LogOut,
  Moon,
  Sun,
  RefreshCw,
  Trash2,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { logOut } from "@/app/actions/auth";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCourseStore,
  ViewType,
  PendingSection,
} from "@/store/use-course-store";
import {
  getAllCourses,
  getCourseWithSections,
  getSectionWithContent,
  generateCourseSection,
  retryFailedSection,
  deleteFailedSection,
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
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [courseSidebarOpen, setCourseSidebarOpen] = React.useState(true);

  // Auth state
  const { user, reset: resetAuth } = useAuthStore();

  const {
    courses,
    setCourses,
    currentCourse,
    setCurrentCourse,
    sections,
    setSections,
    addSection,
    pendingSections,
    setPendingSections,
    updatePendingSection,
    removePendingSection,
    activeSectionId,
    setActiveSectionId,
    setCurrentSection,
    setIsLoadingCourses,
    setIsLoadingSection,
    isLoadingCourses,
    error,
    setError,
    getCachedSectionContent,
    cacheSectionContent,
  } = useCourseStore();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      resetAuth();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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

    // Check cache first - if we have the content, use it immediately without loading state
    const cached = getCachedSectionContent(section.id);
    if (cached) {
      setCurrentSection(cached);
      return;
    }

    // Not in cache, need to fetch from server
    setIsLoadingSection(true);
    try {
      const sectionWithContent = await getSectionWithContent(section.id);
      if (sectionWithContent) {
        // Cache it for future use
        cacheSectionContent(sectionWithContent);
        setCurrentSection(sectionWithContent);
      }
    } catch (err) {
      console.error("Error fetching section content:", err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  // Generate all sections in background (including section 1)
  const generateAllSections = React.useCallback(
    async (courseId: string, totalSections: number) => {
      // Generate all sections sequentially, starting from 1
      for (let sectionNum = 1; sectionNum <= totalSections; sectionNum++) {
        // Update status to generating
        updatePendingSection(sectionNum, { status: "generating" });

        try {
          const result = await generateCourseSection(courseId, sectionNum);

          if (result.success && result.sectionId) {
            // Fetch the newly created section and add it
            const sectionWithContent = await getSectionWithContent(
              result.sectionId,
            );
            if (sectionWithContent) {
              // Cache the content so clicking on this section is instant
              cacheSectionContent(sectionWithContent);

              addSection({
                id: sectionWithContent.id,
                courseId: sectionWithContent.courseId,
                sectionNumber: sectionWithContent.sectionNumber,
                title: sectionWithContent.title,
                isCompleted: sectionWithContent.isCompleted,
                completedAt: sectionWithContent.completedAt,
                previousContext: sectionWithContent.previousContext,
                createdAt: sectionWithContent.createdAt,
                updatedAt: sectionWithContent.updatedAt,
              });

              // If this is the first section, auto-select it
              if (sectionNum === 1) {
                setActiveSectionId(sectionWithContent.id);
                setCurrentSection(sectionWithContent);
              }
            }
            // Remove from pending
            removePendingSection(sectionNum);
          } else {
            // Mark as error
            updatePendingSection(sectionNum, {
              status: "error",
              error: result.error || "Failed to generate section",
            });
          }
        } catch (error) {
          // Mark as error
          updatePendingSection(sectionNum, {
            status: "error",
            error: error instanceof Error ? error.message : "Generation failed",
          });
        }

        // Small delay between sections to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    },
    [
      updatePendingSection,
      addSection,
      removePendingSection,
      cacheSectionContent,
      setActiveSectionId,
      setCurrentSection,
    ],
  );

  // Handle course creation success
  const handleCourseCreated = async (
    courseId: string,
    sectionCount?: number,
  ) => {
    try {
      const fetchedCourses = await getAllCourses();
      setCourses(fetchedCourses);

      const newCourse = fetchedCourses.find((c) => c.id === courseId);
      if (newCourse) {
        // Set the course as current (without loading sections since none exist yet)
        setCurrentCourse(newCourse);
        setSections([]);
        setCurrentSection(null);
        setActiveSectionId(null);

        // Set up pending sections for ALL sections (starting from 1)
        if (sectionCount && sectionCount >= 1) {
          const pendingSectionsList: PendingSection[] = [];
          for (let i = 1; i <= sectionCount; i++) {
            pendingSectionsList.push({
              sectionNumber: i,
              status: "pending",
            });
          }
          setPendingSections(pendingSectionsList);

          // Start background generation for all sections (non-blocking)
          generateAllSections(courseId, sectionCount);
        }
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
          <div className="flex flex-col w-11 bg-zinc-900 py-1.5 gap-1 items-center border-r border-zinc-800 shrink-0">
            {/* App Logo */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 text-white mt-1 hover:rounded-md transition-all duration-200 cursor-pointer">
              <GraduationCap className="size-6" />
            </div>

            <div className="w-5 h-[1px] bg-zinc-700 rounded-full mb-2 mt-2" />

            {/* Course Icons */}
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide">
              {isLoadingCourses && courses.length === 0 ? (
                <div className="flex items-center justify-center w-8 h-8">
                  <Loader2 className="size-3.5 animate-spin text-zinc-400" />
                </div>
              ) : error && courses.length === 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 text-red-400 cursor-pointer">
                      <AlertCircle className="size-3.5" />
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
                            "relative flex items-center justify-center w-8 h-8 font-semibold text-xs transition-all duration-200 cursor-pointer group",
                            colors.bg,
                            colors.text,
                            isActive
                              ? "rounded-md"
                              : "rounded-[16px] hover:rounded-md",
                          )}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute -left-2 w-0.5 h-7 bg-zinc-600 rounded-r-full" />
                          )}
                          {/* Hover indicator */}
                          {!isActive && (
                            <div className="absolute -left-2 w-0.5 h-0 bg-zinc-600 rounded-r-full transition-all duration-200 group-hover:h-2.5" />
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
                    className="flex items-center mt-1.5 justify-center w-8 h-8 rounded-md bg-zinc-800 text-green-500 hover:rounded-md hover:bg-green-600 hover:text-white transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Create New Course
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Profile Section */}
            <div className="border-t border-zinc-800 mt-auto pt-2 pb-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    title="Profile"
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
                  >
                    <User className="size-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="right" align="end" className="w-48">
                  <DropdownMenuLabel className="truncate">
                    {user?.name || "User"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-1.5">
                    Theme
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Sun className="size-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Moon className="size-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-red-400"
                  >
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ============================================ */}
          {/* SECOND SIDEBAR: Course Content/Curriculum   */}
          {/* ============================================ */}
          <div
            className={cn(
              "flex flex-col bg-sidebar transition-all duration-300 ease-in-out overflow-hidden shrink-0",
              courseSidebarOpen ? "w-[280px] border-r" : "w-0",
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
                      className="p-0.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <PanelLeftClose className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Close sidebar</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Course Home & Eagle View Buttons */}
            {currentCourse && (
              <div className="p-2 border-b flex gap-2">
                {/* Course Home Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        // Only allow if course is ready (has sections)
                        if (
                          sections.length > 0 &&
                          pendingSections.length === 0
                        ) {
                          const setActiveView =
                            useCourseStore.getState().setActiveView;
                          setActiveView("home");
                        }
                      }}
                      disabled={
                        sections.length === 0 || pendingSections.length > 0
                      }
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all",
                        sections.length > 0 && pendingSections.length === 0
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-md hover:shadow-lg cursor-pointer"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                      )}
                    >
                      <BarChart3 className="size-4" />
                      <span>Course Home</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {sections.length === 0 || pendingSections.length > 0
                      ? "Complete course generation to view analytics"
                      : "View course analytics & progress"}
                  </TooltipContent>
                </Tooltip>

                {/* Eagle View Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (
                          sections.length > 0 &&
                          pendingSections.length === 0
                        ) {
                          const setActiveView =
                            useCourseStore.getState().setActiveView;
                          setActiveView("network");
                        }
                      }}
                      disabled={
                        sections.length === 0 || pendingSections.length > 0
                      }
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        sections.length > 0 && pendingSections.length === 0
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 cursor-pointer"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                      )}
                    >
                      <Network className="size-4" />
                      <span>Eagle</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {sections.length === 0 || pendingSections.length > 0
                      ? "Complete course generation to view graph"
                      : "View course structure"}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Curriculum
                  </span>
                </div>

                {!currentCourse ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>Create or select a course to get started</p>
                  </div>
                ) : sections.length === 0 && pendingSections.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {currentCourse.status === "generating" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-5 animate-spin" />
                        <p>Generating first section...</p>
                      </div>
                    ) : (
                      <p>No sections yet</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {/* Ready sections */}
                    {sections.map((section, index) => (
                      <CourseSectionItem
                        key={section.id}
                        section={section}
                        index={index}
                        isLast={
                          index === sections.length - 1 &&
                          pendingSections.length === 0
                        }
                        isActive={activeSectionId === section.id}
                        onSelect={() => handleSelectSection(section)}
                      />
                    ))}

                    {/* Pending/Generating/Error sections */}
                    {pendingSections.map((pending) => (
                      <PendingSectionItem
                        key={`pending-${pending.sectionNumber}`}
                        pending={pending}
                        isLast={
                          pending.sectionNumber === currentCourse.sectionCount
                        }
                        courseId={currentCourse.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Toggle button when sidebar is closed */}
          {!courseSidebarOpen && (
            <div className="flex items-start pt-4 px-2 bg-sidebar shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleCourseSidebar}
                    className="p-0.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
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
  isLast,
  isActive,
  onSelect,
}: {
  section: CourseSection;
  index: number;
  isLast: boolean;
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
    <Collapsible defaultOpen={true} className="group/collapsible">
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
                "flex items-center justify-center size-6 rounded-full text-xs font-bold shrink-0 transition-colors -ml-1",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/100 text-primary-foreground",
              )}
            >
              {index + 1}
            </div>
            <span className="truncate flex-1">{section.title}</span>
            <ChevronRight className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div
            className={cn(
              "ml-4 pl-4 mt-1 mb-2 flex flex-col gap-0.5",
              !isLast && "border-l border-zinc-700",
            )}
          >
            {/* Article */}
            <button
              onClick={() => handleSubItemClick("article")}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
            >
              <BookOpen className="size-4 text-green-600" />
              <span>Article</span>
            </button>

            {/* Study Material Dropdown */}
            <Collapsible defaultOpen={true} className="group/study">
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
                <div className="ml-4 pl-2 border-l border-zinc-700 mt-1 flex flex-col gap-0.5">
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
            <Collapsible defaultOpen={true} className="group/quiz">
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
                <div className="ml-4 pl-2 border-l border-zinc-700 mt-1 flex flex-col gap-0.5">
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

/**
 * MODULAR COMPONENT: WaveText
 * Displays text with a wavy animation effect.
 */
function WaveText({ text }: { text: string }) {
  return (
    <span className="wave-text text-orange-500 text-xs font-medium">
      {text.split("").map((char, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.04}s` }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

/**
 * MODULAR COMPONENT: PendingSectionItem
 * Displays pending, generating, or error sections with appropriate animations.
 */
function PendingSectionItem({
  pending,
  isLast,
  courseId,
}: {
  pending: PendingSection;
  isLast: boolean;
  courseId: string;
}) {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { updatePendingSection, removePendingSection, addSection, sections } =
    useCourseStore();

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    updatePendingSection(pending.sectionNumber, {
      status: "generating",
      error: undefined,
    });

    try {
      const result = await retryFailedSection(courseId, pending.sectionNumber);

      if (result.success && result.sectionId) {
        // Fetch the newly created section and add it
        const sectionWithContent = await getSectionWithContent(
          result.sectionId,
        );
        if (sectionWithContent) {
          addSection({
            id: sectionWithContent.id,
            courseId: sectionWithContent.courseId,
            sectionNumber: sectionWithContent.sectionNumber,
            title: sectionWithContent.title,
            isCompleted: sectionWithContent.isCompleted,
            completedAt: sectionWithContent.completedAt,
            previousContext: sectionWithContent.previousContext,
            createdAt: sectionWithContent.createdAt,
            updatedAt: sectionWithContent.updatedAt,
          });
        }
        removePendingSection(pending.sectionNumber);
      } else {
        updatePendingSection(pending.sectionNumber, {
          status: "error",
          error: result.error || "Failed to generate section",
        });
      }
    } catch (error) {
      updatePendingSection(pending.sectionNumber, {
        status: "error",
        error: error instanceof Error ? error.message : "Retry failed",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteFailedSection(courseId, pending.sectionNumber);
      removePendingSection(pending.sectionNumber);
    } catch (error) {
      console.error("Failed to delete section:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isGenerating = pending.status === "generating" || isRetrying;
  const isError = pending.status === "error" && !isRetrying;
  const isPending = pending.status === "pending";

  return (
    <div className={cn("flex flex-col", isError && "section-error")}>
      <div
        className={cn(
          "flex items-center gap-2 w-full px-2 py-2 text-left text-sm font-medium rounded-md transition-colors",
          "text-muted-foreground/60 cursor-not-allowed bg-muted/30",
          isError && "bg-red-500/10",
        )}
      >
        {/* Section number badge with animations */}
        <div className="relative">
          <div
            className={cn(
              "flex items-center justify-center size-6 rounded-full text-xs font-bold shrink-0 -ml-1 transition-all",
              isGenerating && "section-generating bg-orange-500 text-white",
              isError && "bg-red-500 text-white",
              isPending && "bg-muted text-muted-foreground",
            )}
          >
            {isGenerating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : isError ? (
              <AlertCircle className="size-3.5" />
            ) : (
              pending.sectionNumber
            )}
          </div>

          {/* Pulsing ring overlay for generating state */}
          {isGenerating && (
            <div className="absolute inset-0 -ml-1 size-6 rounded-full generating-border opacity-60" />
          )}
        </div>

        {/* Section title/status with wavy animation */}
        <span className="truncate flex-1">
          {isGenerating ? (
            <WaveText text={`Section ${pending.sectionNumber}...`} />
          ) : isError ? (
            <span className="text-red-500 text-xs">
              {pending.error || "Generation failed"}
            </span>
          ) : (
            <span className="text-muted-foreground/50">
              Section {pending.sectionNumber}
            </span>
          )}
        </span>

        {/* Error actions */}
        {isError && (
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="p-1 rounded hover:bg-muted text-orange-500 hover:text-orange-400 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn("size-3.5", isRetrying && "animate-spin")}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Retry generation</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1 rounded hover:bg-muted text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <Trash2
                    className={cn("size-3.5", isDeleting && "animate-pulse")}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Remove section</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Loading indicator for pending/generating */}
        {(isPending || isGenerating) && !isError && (
          <div className="shrink-0 pr-1">
            <div className="flex gap-0.5">
              <div
                className="size-1 rounded-full bg-muted-foreground/40 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="size-1 rounded-full bg-muted-foreground/40 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="size-1 rounded-full bg-muted-foreground/40 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Connector line (if not last) */}
      {!isLast && (
        <div
          className={cn(
            "ml-4 h-2 border-l",
            isError ? "border-red-500/30" : "border-zinc-700/50",
          )}
        />
      )}
    </div>
  );
}
