"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  MarkerType,
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
  FileText,
} from "lucide-react";
import { useCourseStore, ViewType } from "@/store/use-course-store";

import "@xyflow/react/dist/style.css";

// Color palette
const colors = {
  root: "#8B5CF6",
  section: "#3B82F6",
  article: "#10B981",
  study: "#F59E0B",
  quiz: "#EF4444",
  mindmap: "#EC4899",
  flashcards: "#FBBF24",
  mcq: "#8B5CF6",
  trueFalse: "#F97316",
  fillups: "#6366F1",
  page: "#14B8A6",
  edge: "#94A3B8",
  subItem: "#6B7280",
};

/**
 * Custom Node Component with Handles for proper edge connections
 */
function GraphNode({ data }: { data: any }) {
  const Icon = data.icon;
  const setActiveView = useCourseStore((state) => state.setActiveView);

  const handleClick = () => {
    if (data.viewType) {
      setActiveView(data.viewType as ViewType);
    }
  };

  const getNodeStyles = () => {
    switch (data.level) {
      case 0:
        return {
          padding: "20px 32px",
          fontSize: "18px",
          fontWeight: "800",
          minWidth: "200px",
          iconSize: "size-6",
          borderRadius: "24px",
        };
      case 1:
        return {
          padding: "14px 24px",
          fontSize: "14px",
          fontWeight: "700",
          minWidth: "160px",
          iconSize: "size-5",
          borderRadius: "18px",
        };
      case 2:
        return {
          padding: "12px 20px",
          fontSize: "13px",
          fontWeight: "600",
          minWidth: "140px",
          iconSize: "size-5",
          borderRadius: "14px",
        };
      default:
        return {
          padding: "10px 16px",
          fontSize: "12px",
          fontWeight: "500",
          minWidth: "110px",
          iconSize: "size-4",
          borderRadius: "12px",
        };
    }
  };

  const styles = getNodeStyles();

  return (
    <div
      onClick={handleClick}
      className="transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl cursor-pointer group relative"
      style={{
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        background: `linear-gradient(135deg, ${data.color} 0%, ${data.color}dd 100%)`,
        color: "#fff",
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        boxShadow: `0 8px 24px ${data.color}40, 0 4px 12px rgba(0,0,0,0.1)`,
        border: "2px solid rgba(255,255,255,0.4)",
        textAlign: "center",
        minWidth: styles.minWidth,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        whiteSpace: "nowrap",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="bg-transparent! border-0! w-4! h-4!"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="bg-transparent! border-0! w-4! h-4!"
      />
      <Handle
        type="target"
        position={Position.Right}
        className="bg-transparent! border-0! w-4! h-4!"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="bg-transparent! border-0! w-4! h-4!"
      />

      {Icon && <Icon className={`${styles.iconSize} drop-shadow-sm`} />}
      <span className="drop-shadow-sm">{data.label}</span>

      <Handle
        type="source"
        position={Position.Top}
        className="bg-transparent! border-0! w-4! h-4!"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="bg-transparent! border-0! w-4! h-4!"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="bg-transparent! border-0! w-4! h-4!"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-transparent! border-0! w-4! h-4!"
      />

      {data.description && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
          {data.description}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

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

function getCircularPosition(
  centerX: number,
  centerY: number,
  radius: number,
  angleInRadians: number,
): { x: number; y: number } {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function CourseGraph({ courseData }: CourseGraphProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeId = 0;

    const centerX = 0;
    const centerY = 0;

    const RADIUS_LEVEL_1 = 300;
    const RADIUS_LEVEL_2 = 550;
    const RADIUS_LEVEL_3 = 780;

    // ROOT NODE
    const rootId = `node-${nodeId++}`;
    nodes.push({
      id: rootId,
      type: "graphNode",
      data: {
        label: courseData.courseTitle,
        color: colors.root,
        level: 0,
        icon: GraduationCap,
        description: "📚 Course Overview",
      },
      position: { x: centerX, y: centerY },
    });

    // SECTIONS
    const sectionCount = courseData.sections.length;
    const sectionAngleStep = (2 * Math.PI) / sectionCount;

    courseData.sections.forEach((section, sectionIdx) => {
      const sectionAngle = sectionAngleStep * sectionIdx - Math.PI / 2;
      const sectionPos = getCircularPosition(
        centerX,
        centerY,
        RADIUS_LEVEL_1,
        sectionAngle,
      );

      const sectionId = `node-${nodeId++}`;
      nodes.push({
        id: sectionId,
        type: "graphNode",
        data: {
          label: section.title,
          color: colors.section,
          level: 1,
          description: `📖 Section ${sectionIdx + 1}`,
        },
        position: sectionPos,
      });

      edges.push({
        id: `e-${rootId}-${sectionId}`,
        source: rootId,
        target: sectionId,
        animated: true,
        style: { stroke: colors.edge, strokeWidth: 3 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: colors.edge,
          width: 20,
          height: 20,
        },
      });

      // CONTENT TYPES
      const contentTypes = [
        {
          label: "Article",
          color: colors.article,
          icon: BookOpen,
          viewType: "article" as ViewType,
          description: "📝 Read the lesson",
          children: [
            {
              label: "Page 1",
              icon: FileText,
              viewType: "article" as ViewType,
              color: colors.page,
              description: "📄 Read page 1",
            },
            {
              label: "Page 2",
              icon: FileText,
              viewType: "article" as ViewType,
              color: colors.page,
              description: "📄 Read page 2",
            },
            {
              label: "Page 3",
              icon: FileText,
              viewType: "article" as ViewType,
              color: colors.page,
              description: "📄 Read page 3",
            },
          ],
        },
        {
          label: "Study Material",
          color: colors.study,
          icon: BriefcaseBusiness,
          description: "📚 Practice materials",
          children: [
            {
              label: "Mind Map",
              icon: Brain,
              viewType: "mindmap" as ViewType,
              color: colors.mindmap,
              description: "🧠 Visual concepts",
            },
            {
              label: "Flashcards",
              icon: Layers,
              viewType: "flashcards" as ViewType,
              color: colors.flashcards,
              description: "🃏 Quick review",
            },
          ],
        },
        {
          label: "Quiz",
          color: colors.quiz,
          icon: Gamepad2,
          viewType: "quiz" as ViewType,
          description: "🎯 Test knowledge",
          children: [
            {
              label: "MCQs",
              icon: ListChecks,
              viewType: "quiz" as ViewType,
              color: colors.mcq,
              description: "✅ Multiple choice",
            },
            {
              label: "True/False",
              icon: ToggleLeft,
              viewType: "quiz" as ViewType,
              color: colors.trueFalse,
              description: "⚡ Quick decisions",
            },
            {
              label: "Fill-ups",
              icon: Type,
              viewType: "quiz" as ViewType,
              color: colors.fillups,
              description: "✏️ Complete sentence",
            },
          ],
        },
      ];

      const contentArcSpan = 0.5;
      const contentCount = contentTypes.length;

      contentTypes.forEach((content, contentIdx) => {
        const contentAngleOffset =
          ((contentIdx - (contentCount - 1) / 2) * contentArcSpan) /
          (contentCount - 1 || 1);
        const contentAngle = sectionAngle + contentAngleOffset;
        const contentPos = getCircularPosition(
          centerX,
          centerY,
          RADIUS_LEVEL_2,
          contentAngle,
        );

        const contentId = `node-${nodeId++}`;
        nodes.push({
          id: contentId,
          type: "graphNode",
          data: {
            label: content.label,
            color: content.color,
            level: 2,
            icon: content.icon,
            viewType: content.viewType,
            description: content.description,
          },
          position: contentPos,
        });

        edges.push({
          id: `e-${sectionId}-${contentId}`,
          source: sectionId,
          target: contentId,
          style: { stroke: content.color, strokeWidth: 2.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: content.color,
            width: 16,
            height: 16,
          },
        });

        // SUB-ITEMS
        if (content.children && content.children.length > 0) {
          const childCount = content.children.length;
          const childArcSpan = 0.3;

          content.children.forEach((child, childIdx) => {
            const childAngleOffset =
              ((childIdx - (childCount - 1) / 2) * childArcSpan) /
              (childCount - 1 || 1);
            const childAngle = contentAngle + childAngleOffset;
            const childPos = getCircularPosition(
              centerX,
              centerY,
              RADIUS_LEVEL_3,
              childAngle,
            );

            const childId = `node-${nodeId++}`;
            nodes.push({
              id: childId,
              type: "graphNode",
              data: {
                label: child.label,
                color: child.color,
                level: 3,
                icon: child.icon,
                viewType: child.viewType,
                description: child.description || `View ${child.label}`,
              },
              position: childPos,
            });

            edges.push({
              id: `e-${contentId}-${childId}`,
              source: contentId,
              target: childId,
              style: { stroke: child.color, strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: child.color,
                width: 14,
                height: 14,
              },
            });
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [courseData]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 border rounded-2xl shadow-inner relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 0.9 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={32} size={2} />
        <Controls
          showInteractive={false}
          className="bg-white/90! shadow-lg! rounded-xl! border-0!"
        />

        <Panel
          position="top-left"
          className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-5 m-4 border border-slate-200/50"
        >
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Knowledge Graph
            </h3>
            <p className="text-xs text-slate-500">
              Click any node to navigate • Scroll to zoom • Drag to pan
            </p>
          </div>
        </Panel>

        <Panel
          position="top-right"
          className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 m-4 border border-slate-200/50"
        >
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="font-semibold text-slate-700 mb-1">Legend</div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ background: colors.root }}
              />
              <span className="text-slate-600">Course</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ background: colors.section }}
              />
              <span className="text-slate-600">Section</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ background: colors.article }}
              />
              <span className="text-slate-600">Article</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ background: colors.study }}
              />
              <span className="text-slate-600">Study Material</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ background: colors.quiz }}
              />
              <span className="text-slate-600">Quiz</span>
            </div>
          </div>
        </Panel>

        <Panel
          position="bottom-left"
          className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 m-4 border border-slate-200/50"
        >
          <div className="flex gap-6 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-purple-600">
                {courseData.sections.length}
              </span>
              <span className="text-slate-500">Sections</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-600">
                {nodes.length}
              </span>
              <span className="text-slate-500">Nodes</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-emerald-600">
                {edges.length}
              </span>
              <span className="text-slate-500">Connections</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
