"use client"

import * as React from "react"
import { 
  ChevronRight, 
  BookOpen, 
  Brain, 
  Gamepad2, 
  Plus,
  Command
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
} from "@/components/ui/sidebar"
import { useCourseStore, ViewType } from "@/store/use-course-store"

// Mock data for the Second Sidebar
const COURSE_DATA = {
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="overflow-hidden *:data-[sidebar=sidebar]:flex-row" {...props}>
      {/* FIRST SIDEBAR: Course Icons (Discord Style) */}
      <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
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
              {/* This would map through your courses */}
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Course 1" isActive>
                  <div className="size-4 rounded-full bg-blue-500" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Create New Course">
                  <Plus className="size-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* SECOND SIDEBAR: Course Sections */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="border-b p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Current Course</span>
            <div className="text-foreground text-base font-bold truncate">
              {COURSE_DATA.courseTitle}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Curriculum</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {COURSE_DATA.sections.map((section) => (
                  <CourseSectionItem key={section.id} section={section} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}

/**
 * MODULAR COMPONENT: CourseSectionItem
 * Handles the collapsible dropdown logic for each section.
 */
// function CourseSectionItem({ section }: { section: typeof COURSE_DATA.sections[0] }) {
//   const setActiveView = useCourseStore((state) => state.setActiveView)

//   const handleNav = (view: ViewType) => {
//     setActiveView(view)
//   }

//   return (
//     <Collapsible defaultOpen className="group/collapsible">
//       <SidebarMenuItem>
//         <CollapsibleTrigger asChild>
//           <SidebarMenuButton tooltip={section.title} className="font-medium text-sidebar-foreground/80">
//             <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
//             <span className="truncate">{section.title}</span>
//           </SidebarMenuButton>
//         </CollapsibleTrigger>
        
//         <CollapsibleContent>
//           <SidebarMenuSub>
//             {/* Article Link */}
//             <SidebarMenuSubItem>
//               <SidebarMenuSubButton onClick={() => handleNav("article")}>
//                 <BookOpen className="size-4 text-blue-500" />
//                 <span>Article</span>
//               </SidebarMenuSubButton>
//             </SidebarMenuSubItem>

//             {/* Flashcards Link */}
//             <SidebarMenuSubItem>
//               <SidebarMenuSubButton onClick={() => handleNav("flashcards")}>
//                 <Brain className="size-4 text-purple-500" />
//                 <span>Flashcards</span>
//               </SidebarMenuSubButton>
//             </SidebarMenuSubItem>

//             {/* Quiz Link */}
//             <SidebarMenuSubItem>
//               <SidebarMenuSubButton onClick={() => handleNav("quiz")}>
//                 <Gamepad2 className="size-4 text-orange-500" />
//                 <span>Quiz</span>
//               </SidebarMenuSubButton>
//             </SidebarMenuSubItem>
//           </SidebarMenuSub>
//         </CollapsibleContent>
//       </SidebarMenuItem>
//     </Collapsible>
//   )
// }

function CourseSectionItem({ section }: { section: typeof COURSE_DATA.sections[0] }) {
  const setActiveView = useCourseStore((state) => state.setActiveView)

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={section.title} className="font-semibold text-sidebar-foreground">
            <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            <span className="truncate">{section.title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <SidebarMenuSub>
            {/* 1. Article (Direct Link) */}
            <SidebarMenuSubItem>
              <SidebarMenuSubButton onClick={() => setActiveView("article")}>
                <BookOpen className="size-4 text-blue-500" />
                <span>Article</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

            {/* 2. Study Material (Nested Dropdown) */}
            <SidebarMenuSubItem>
              <Collapsible className="group/study">
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="size-4 text-purple-500" />
                      <span>Study Material</span>
                    </div>
                    <ChevronRight className="size-3 transition-transform group-data-[state=open]/study:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 border-l">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton onClick={() => setActiveView("mindmap")}>
                        <span>Mind Map</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton onClick={() => setActiveView("flashcards")}>
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
                      <Gamepad2 className="size-4 text-orange-500" />
                      <span>Quiz</span>
                    </div>
                    <ChevronRight className="size-3 transition-transform group-data-[state=open]/quiz:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 border-l">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton onClick={() => setActiveView("quiz")}>
                        <span>Multiple Choice</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton onClick={() => setActiveView("quiz")}>
                        <span>True / False</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton onClick={() => setActiveView("quiz")}>
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
  )
}