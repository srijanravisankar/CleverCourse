"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ConnectionLineType,
  Panel,
} from "@xyflow/react";
import {
  BookOpen,
  Brain,
  Gamepad2,
  Layers,
  BriefcaseBusiness,
  ListChecks,
  ToggleLeft,
  Type,
  GraduationCap,
} from "lucide-react";
import { useCourseStore } from "@/store/use-course-store";

import "@xyflow/react/dist/style.css";

const colors = {
  root: "#8B5CF6", // Purple for root
  section: "#3B82F6", // Blue for sections
  article: "#10B981", // Green for article
  study: "#F59E0B", // Amber for study material
  quiz: "#EF4444", // Red for quiz
  subItem: "#6B7280", // Gray for sub-items
  edge: "#CBD5E1",
};

/**
 * Custom Node Component with Icon Support
 */
const GraphNode = ({ data }: any) => {
  const Icon = data.icon;
  const setActiveView = useCourseStore((state) => state.setActiveView);

  const handleClick = () => {
    if (data.onClick) {
      data.onClick();
    }
    if (data.viewType) {
      setActiveView(data.viewType);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer group"
      style={{
        padding:
          data.size === "large"
            ? "16px 24px"
            : data.size === "medium"
              ? "12px 20px"
              : "10px 16px",
        borderRadius: "16px",
        background: data.color,
        color: "#fff",
        fontSize:
          data.size === "large"
            ? "16px"
            : data.size === "medium"
              ? "14px"
              : "12px",
        fontWeight:
          data.size === "large"
            ? "700"
            : data.size === "medium"
              ? "600"
              : "500",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        border: "2px solid rgba(255,255,255,0.3)",
        textAlign: "center",
        minWidth:
          data.size === "large"
            ? "180px"
            : data.size === "medium"
              ? "150px"
              : "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        whiteSpace: "nowrap",
      }}
    >
      {Icon && (
        <Icon
          className={`${data.size === "large" ? "size-5" : "size-4"} opacity-90`}
        />
      )}
      <span>{data.label}</span>

      {/* Hover tooltip */}
      {data.description && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {data.description}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  graphNode: GraphNode,
};

interface CourseGraphProps {
  courseData: {
    courseTitle: string;
    sections: Array<{
      id: string;
      title: string;
      isActive: boolean;
    }>;
  };
}

export function CourseGraph({ courseData }: CourseGraphProps) {
  const setActiveView = useCourseStore((state) => state.setActiveView);

  /**
   * Generate hierarchical graph layout
   */
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeId = 0;

    // Root Node - Course Title
    const rootId = `node-${nodeId++}`;
    nodes.push({
      id: rootId,
      type: "graphNode",
      data: {
        label: courseData.courseTitle,
        color: colors.root,
        size: "large",
        icon: GraduationCap,
        description: "Course Overview",
      },
      position: { x: 0, y: 0 },
    });

    // Level 1 - Section Nodes
    const sectionCount = courseData.sections.length;
    const horizontalSpacing = 400;
    const verticalOffset = 200;

    courseData.sections.forEach((section, sectionIdx) => {
      const sectionX =
        (sectionIdx - (sectionCount - 1) / 2) * horizontalSpacing;
      const sectionY = verticalOffset;

      const sectionId = `node-${nodeId++}`;
      nodes.push({
        id: sectionId,
        type: "graphNode",
        data: {
          label: section.title,
          color: colors.section,
          size: "medium",
          description: `Section ${sectionIdx + 1}`,
        },
        position: { x: sectionX, y: sectionY },
      });

      edges.push({
        id: `e-${rootId}-${sectionId}`,
        source: rootId,
        target: sectionId,
        animated: true,
        style: { stroke: colors.edge, strokeWidth: 3 },
        type: ConnectionLineType.SmoothStep,
      });

      // Level 2 - Content Type Nodes (Article, Study Material, Quiz)
      const contentTypes = [
        {
          label: "Article",
          color: colors.article,
          icon: BookOpen,
          viewType: "article",
          description: "Read the lesson",
        },
        {
          label: "Study Material",
          color: colors.study,
          icon: BriefcaseBusiness,
          description: "Practice materials",
        },
        {
          label: "Quiz",
          color: colors.quiz,
          icon: Gamepad2,
          viewType: "quiz",
          description: "Test your knowledge",
        },
      ];

      const level2Y = sectionY + 180;
      const level2Spacing = 250;

      contentTypes.forEach((content, contentIdx) => {
        const contentX = sectionX + (contentIdx - 1) * level2Spacing;
        const contentId = `node-${nodeId++}`;

        nodes.push({
          id: contentId,
          type: "graphNode",
          data: {
            label: content.label,
            color: content.color,
            size: "medium",
            icon: content.icon,
            viewType: content.viewType,
            description: content.description,
          },
          position: { x: contentX, y: level2Y },
        });

        edges.push({
          id: `e-${sectionId}-${contentId}`,
          source: sectionId,
          target: contentId,
          style: { stroke: colors.edge, strokeWidth: 2 },
          type: ConnectionLineType.SmoothStep,
        });

        // Level 3 - Sub-items
        if (content.label === "Study Material") {
          const studyItems = [
            {
              label: "Mind Map",
              icon: Brain,
              viewType: "mindmap",
              description: "Visual concept map",
            },
            {
              label: "Flashcards",
              icon: Layers,
              viewType: "flashcards",
              description: "Quick review cards",
            },
          ];

          const level3Y = level2Y + 150;
          studyItems.forEach((item, itemIdx) => {
            const itemX = contentX + (itemIdx - 0.5) * 180;
            const itemId = `node-${nodeId++}`;

            nodes.push({
              id: itemId,
              type: "graphNode",
              data: {
                label: item.label,
                color: colors.subItem,
                size: "small",
                icon: item.icon,
                viewType: item.viewType,
                description: item.description,
              },
              position: { x: itemX, y: level3Y },
            });

            edges.push({
              id: `e-${contentId}-${itemId}`,
              source: contentId,
              target: itemId,
              style: { stroke: colors.edge, strokeWidth: 1.5 },
            });
          });
        }

        if (content.label === "Quiz") {
          const quizItems = [
            {
              label: "MCQs",
              icon: ListChecks,
              viewType: "quiz",
              description: "Multiple choice questions",
            },
            {
              label: "True/False",
              icon: ToggleLeft,
              viewType: "quiz",
              description: "True or false questions",
            },
            {
              label: "Fill-ups",
              icon: Type,
              viewType: "quiz",
              description: "Fill in the blanks",
            },
          ];

          const level3Y = level2Y + 150;
          quizItems.forEach((item, itemIdx) => {
            const itemX = contentX + (itemIdx - 1) * 140;
            const itemId = `node-${nodeId++}`;

            nodes.push({
              id: itemId,
              type: "graphNode",
              data: {
                label: item.label,
                color: colors.subItem,
                size: "small",
                icon: item.icon,
                viewType: item.viewType,
                description: item.description,
              },
              position: { x: itemX, y: level3Y },
            });

            edges.push({
              id: `e-${contentId}-${itemId}`,
              source: contentId,
              target: itemId,
              style: { stroke: colors.edge, strokeWidth: 1.5 },
            });
          });
        }

        // Article pages (Level 3)
        if (content.label === "Article") {
          const articlePages = ["Page 1", "Page 2", "Page 3"];
          const level3Y = level2Y + 150;

          articlePages.forEach((page, pageIdx) => {
            const pageX = contentX + (pageIdx - 1) * 120;
            const pageId = `node-${nodeId++}`;

            nodes.push({
              id: pageId,
              type: "graphNode",
              data: {
                label: page,
                color: colors.subItem,
                size: "small",
                viewType: "article",
                description: `Read ${page.toLowerCase()}`,
              },
              position: { x: pageX, y: level3Y },
            });

            edges.push({
              id: `e-${contentId}-${pageId}`,
              source: contentId,
              target: pageId,
              style: { stroke: colors.edge, strokeWidth: 1.5 },
            });
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [courseData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-linear-to-br from-slate-50 to-slate-100 border rounded-2xl shadow-inner relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Background color="#cbd5e1" gap={24} size={1} />
        <Controls showInteractive={false} />

        <Panel
          position="top-left"
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 m-4"
        >
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-sm text-slate-900">
              Course Knowledge Graph
            </h3>
            <p className="text-xs text-slate-600">Click any node to navigate</p>
          </div>
        </Panel>

        <Panel
          position="top-right"
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 m-4"
        >
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: colors.root }}
              ></div>
              <span>Course</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: colors.section }}
              ></div>
              <span>Section</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: colors.article }}
              ></div>
              <span>Article</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: colors.study }}
              ></div>
              <span>Study</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: colors.quiz }}
              ></div>
              <span>Quiz</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: colors.subItem }}
              ></div>
              <span>Details</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
