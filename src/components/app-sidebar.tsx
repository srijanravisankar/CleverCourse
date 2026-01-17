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
} from "lucide-react";

import { CreateCourseDialog } from "@/components/course/CreateCourseDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCourseStore, ViewType } from "@/store/use-course-store";
import {
  getAllCourses,
  getCourseWithSections,
  getSectionWithContent,
} from "@/app/actions/courses";
import type { Course, CourseSection } from "@/db/types";

// Color palette for course icons
const COURSE_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-yellow-500",
  "bg-red-500",
];

function getCourseColor(index: number): string {
  return COURSE_COLORS[index % COURSE_COLORS.length];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

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
    // Refresh the courses list to get the new course
    try {
      const fetchedCourses = await getAllCourses();
      setCourses(fetchedCourses);

      // Find and select the newly created course
      const newCourse = fetchedCourses.find((c) => c.id === courseId);
      if (newCourse) {
        await handleSelectCourse(newCourse);
      }
    } catch (err) {
      console.error("Error fetching new course:", err);
    }
    setShowCreateDialog(false);
  };

  return (
    <>
      <CreateCourseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCourseCreated={handleCourseCreated}
      />

      <Sidebar
        collapsible="icon"
        className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
        {...props}
      >
        {/* FIRST SIDEBAR: Course Icons (Discord Style) */}
        <Sidebar
          collapsible="none"
          className="w-[calc(3rem+15px+1px)]! border-r"
        >
          <SidebarHeader>
            <SidebarMenuButton size="lg" className="md:h-8 md:p-0">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Command className="size-4" />
              </div>
            </SidebarMenuButton>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {isLoadingCourses && courses.length === 0 ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Loader2 className="size-4 animate-spin" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : error && courses.length === 0 ? (
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton>
                          <AlertCircle className="size-4 text-destructive" />
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="center">
                        {error}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ) : (
                  courses.map((course, index) => (
                    <SidebarMenuItem key={course.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={currentCourse?.id === course.id}
                            onClick={() => handleSelectCourse(course)}
                          >
                            <div
                              className={`size-4 rounded-full ${getCourseColor(
                                index,
                              )} ${
                                currentCourse?.id === course.id
                                  ? "ring-2 ring-primary ring-offset-1"
                                  : ""
                              }`}
                            />
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                          {course.title || course.topic}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))
                )}

                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        onClick={() => setShowCreateDialog(true)}
                      >
                        <Plus className="size-4" />
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      Create New Course
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* SECOND SIDEBAR: Course Sections */}
        <Sidebar collapsible="none" className="hidden flex-1 md:flex">
          <SidebarHeader className="border-b p-4">
            <div className="flex flex-col gap-1">
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
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <div className="flex items-center justify-between px-2 mb-2">
                <SidebarGroupLabel>Curriculum</SidebarGroupLabel>
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
              <SidebarGroupContent>
                <SidebarMenu>
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
                    sections.map((section, index) => (
                      <CourseSectionItem
                        key={section.id}
                        section={section}
                        index={index}
                        isActive={activeSectionId === section.id}
                        onSelect={() => handleSelectSection(section)}
                      />
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </Sidebar>
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
    // First select this section if not already active
    if (!isActive) {
      onSelect();
    }
    setActiveView(view);
  };

  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={section.title}
            className={`font-semibold text-sidebar-foreground ${
              isActive ? "bg-accent" : ""
            }`}
            onClick={onSelect}
          >
            <div
              className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-black text-accent group-hover/collapsible:bg-primary group-hover/collapsible:text-primary-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span className="truncate">{section.title}</span>
            <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {/* 1. Article (Direct Link) */}
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                onClick={() => handleSubItemClick("article")}
              >
                <BookOpen className="size-4 text-green-600!" />
                <span>Article</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

            {/* 2. Study Material (Nested Dropdown) */}
            <SidebarMenuSubItem>
              <Collapsible className="group/study">
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness className="size-4 text-blue-600" />
                      <span>Study Material</span>
                    </div>
                    <ChevronRight className="size-3 transition-transform group-data-[state=open]/study:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 border-l">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => handleSubItemClick("mindmap")}
                      >
                        <Brain className="size-4 text-pink-600!" />
                        <span>Mind Map</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => handleSubItemClick("flashcards")}
                      >
                        <Layers className="size-4 text-yellow-600!" />
                        <span>Flashcards</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuSubItem>

            {/* 3. Quiz (Nested Dropdown) */}
            <SidebarMenuSubItem>
              <Collapsible className="group/quiz">
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="size-4 text-red-600" />
                      <span>Quiz</span>
                    </div>
                    <ChevronRight className="size-3 transition-transform group-data-[state=open]/quiz:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 border-l">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => handleSubItemClick("mcq")}
                      >
                        <ListChecks className="size-4 text-purple-600!" />
                        <span>Multiple Choice</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => handleSubItemClick("tf")}
                      >
                        <ToggleLeft className="size-4 text-amber-900!" />
                        <span>True / False</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => handleSubItemClick("fill")}
                      >
                        <Type className="size-4 text-stone-600!" />
                        <span>Fill Ups</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
