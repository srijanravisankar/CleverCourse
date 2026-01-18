"use client";

import * as React from "react";
import {
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Flame,
  Star,
  Trophy,
  BarChart3,
  PieChart,
  Sparkles,
  Layers,
  FileText,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Course, CourseSectionWithContent } from "@/db/types";
import {
  getCourseProgressStats,
  resetCourseProgress,
  type CourseProgressStats,
} from "@/app/actions/progress";

interface CourseHomeProps {
  course: Course;
  sections: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    sectionNumber: number;
  }>;
  sectionContents: CourseSectionWithContent[];
  onProgressReset?: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; label: string };
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: StatCardProps) {
  return (
    <Card
      className={cn("relative overflow-hidden border-none shadow-lg", color)}
    >
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
        {icon}
      </div>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2 text-xs">
                <TrendingUp className="size-3" />
                <span>
                  {trend.value}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <div className="size-6">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  color: string;
}

function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  color,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-muted/30"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(progress)}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

interface SectionProgressItemProps {
  section: {
    id: string;
    title: string;
    sectionNumber: number;
    isCompleted: boolean;
  };
  stats: { articles: number; flashcards: number; quizzes: number };
}

function SectionProgressItem({ section, stats }: SectionProgressItemProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold",
          section.isCompleted
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        {section.isCompleted ? (
          <CheckCircle2 className="size-5" />
        ) : (
          section.sectionNumber
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{section.title}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <FileText className="size-3" /> {stats.articles} pages
          </span>
          <span className="flex items-center gap-1">
            <Layers className="size-3" /> {stats.flashcards} cards
          </span>
          <span className="flex items-center gap-1">
            <HelpCircle className="size-3" /> {stats.quizzes} quizzes
          </span>
        </div>
      </div>
      <div
        className={cn(
          "px-2 py-1 rounded text-xs font-medium",
          section.isCompleted
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        )}
      >
        {section.isCompleted ? "Completed" : "In Progress"}
      </div>
    </div>
  );
}

export function CourseHome({
  course,
  sections,
  sectionContents,
  onProgressReset,
}: CourseHomeProps) {
  // User progress stats from database
  const [progressStats, setProgressStats] =
    React.useState<CourseProgressStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);
  const [isResetting, setIsResetting] = React.useState(false);

  // Fetch progress stats on mount and when course changes
  React.useEffect(() => {
    const fetchStats = async () => {
      if (!course?.id) return;
      setIsLoadingStats(true);
      try {
        const stats = await getCourseProgressStats(course.id);
        setProgressStats(stats);
      } catch (error) {
        console.error("Error fetching progress stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [course?.id]);

  // Handle reset progress
  const handleResetProgress = async () => {
    if (!course?.id) return;
    if (
      !confirm(
        "Are you sure you want to reset all progress for this course? This action cannot be undone.",
      )
    )
      return;

    setIsResetting(true);
    try {
      const result = await resetCourseProgress(course.id);
      if (result.success) {
        // Reset local stats
        setProgressStats({
          totalXpEarned: 0,
          articlesCompleted: 0,
          flashcardsCompleted: 0,
          mindmapsCompleted: 0,
          mcqCompleted: 0,
          trueFalseCompleted: 0,
          fillUpCompleted: 0,
          totalQuizCorrect: 0,
          totalQuizAttempted: 0,
          completedContentIds: [],
        });
        // Notify parent
        onProgressReset?.();
        alert(`Progress reset! ${result.itemsReset} items cleared.`);
      } else {
        alert("Failed to reset progress: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error resetting progress:", error);
      alert("Failed to reset progress");
    } finally {
      setIsResetting(false);
    }
  };

  // Calculate statistics from actual data
  const totalSections = sections.length;
  const completedSections = sections.filter((s) => s.isCompleted).length;
  const sectionProgress =
    totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

  // Calculate content stats
  const contentStats = React.useMemo(() => {
    let totalArticles = 0;
    let totalFlashcards = 0;
    let totalMcq = 0;
    let totalTrueFalse = 0;
    let totalFillUp = 0;
    let totalMindMaps = 0;

    sectionContents.forEach((section) => {
      totalArticles += section.articlePages?.length || 0;
      totalFlashcards += section.flashcards?.length || 0;
      totalMcq += section.mcqQuestions?.length || 0;
      totalTrueFalse += section.trueFalseQuestions?.length || 0;
      totalFillUp += section.fillUpQuestions?.length || 0;
      totalMindMaps += section.mindMaps?.length || 0;
    });

    return {
      totalArticles,
      totalFlashcards,
      totalQuizzes: totalMcq + totalTrueFalse + totalFillUp,
      totalMcq,
      totalTrueFalse,
      totalFillUp,
      totalMindMaps,
    };
  }, [sectionContents]);

  // Get section-specific stats
  const getSectionStats = (sectionId: string) => {
    const content = sectionContents.find((s) => s.id === sectionId);
    if (!content) return { articles: 0, flashcards: 0, quizzes: 0 };
    return {
      articles: content.articlePages?.length || 0,
      flashcards: content.flashcards?.length || 0,
      quizzes:
        (content.mcqQuestions?.length || 0) +
        (content.trueFalseQuestions?.length || 0) +
        (content.fillUpQuestions?.length || 0),
    };
  };

  // Estimate time calculations
  const estimatedReadTime = Math.ceil(contentStats.totalArticles * 3); // 3 min per article
  const estimatedFlashcardTime = Math.ceil(contentStats.totalFlashcards * 0.5); // 30 sec per card
  const estimatedQuizTime = Math.ceil(contentStats.totalQuizzes * 1); // 1 min per question
  const totalEstimatedTime =
    estimatedReadTime + estimatedFlashcardTime + estimatedQuizTime;

  // Empty state
  if (sectionContents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
          <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 p-6 rounded-3xl shadow-xl">
            <Sparkles className="size-12 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Start Your Learning Journey!
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Complete lessons to unlock analytics. Your progress, achievements, and
          insights will appear here as you learn.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
            <BookOpen className="size-4" />
            <span>Read Articles</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
            <Brain className="size-4" />
            <span>Review Flashcards</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
            <Target className="size-4" />
            <span>Take Quizzes</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Course Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-24 -mb-24" />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-3 backdrop-blur-sm">
                <BookOpen className="size-3" />
                {course.level.charAt(0).toUpperCase() +
                  course.level.slice(1)}{" "}
                Course
              </span>
              <h1 className="text-3xl font-bold mb-2">
                {course.title || course.topic}
              </h1>
              <p className="text-white/80 max-w-xl">
                {course.description || course.goal}
              </p>
            </div>
            <div className="hidden lg:block">
              <ProgressRing
                progress={sectionProgress}
                label="Course Progress"
                color="text-white"
                size={100}
                strokeWidth={8}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Layers className="size-4 opacity-70" />
              <span>{totalSections} Sections</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="size-4 opacity-70" />
              <span>{contentStats.totalArticles} Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="size-4 opacity-70" />
              <span>{contentStats.totalFlashcards} Flashcards</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="size-4 opacity-70" />
              <span>{contentStats.totalQuizzes} Quiz Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 opacity-70" />
              <span>~{totalEstimatedTime} min total</span>
            </div>
          </div>
        </div>
      </div>

      {/* XP and Progress Stats */}
      {isLoadingStats ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total XP Earned"
            value={progressStats?.totalXpEarned || 0}
            subtitle="Experience points"
            icon={<Zap className="size-24" />}
            color="bg-gradient-to-br from-amber-500 to-yellow-500 text-white"
          />
          <StatCard
            title="Articles Read"
            value={`${progressStats?.articlesCompleted || 0}/${contentStats.totalArticles}`}
            subtitle={`${contentStats.totalArticles > 0 ? Math.round(((progressStats?.articlesCompleted || 0) / contentStats.totalArticles) * 100) : 0}% complete`}
            icon={<FileText className="size-24" />}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
          />
          <StatCard
            title="Flashcards Reviewed"
            value={`${progressStats?.flashcardsCompleted || 0}/${contentStats.totalFlashcards}`}
            subtitle={`${contentStats.totalFlashcards > 0 ? Math.round(((progressStats?.flashcardsCompleted || 0) / contentStats.totalFlashcards) * 100) : 0}% reviewed`}
            icon={<Brain className="size-24" />}
            color="bg-gradient-to-br from-purple-500 to-violet-500 text-white"
          />
          <StatCard
            title="Quizzes Completed"
            value={`${(progressStats?.mcqCompleted || 0) + (progressStats?.trueFalseCompleted || 0) + (progressStats?.fillUpCompleted || 0)}/${contentStats.totalQuizzes}`}
            subtitle={`${progressStats?.totalQuizAttempted ? Math.round((progressStats.totalQuizCorrect / progressStats.totalQuizAttempted) * 100) : 0}% correct`}
            icon={<Target className="size-24" />}
            color="bg-gradient-to-br from-rose-500 to-pink-500 text-white"
          />
        </div>
      )}

      {/* Content Breakdown & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Distribution & Completion */}
        <Card className="lg:col-span-1 shadow-lg border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="size-5 text-violet-500" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-emerald-500" />
                    Articles
                  </span>
                  <span className="font-medium">
                    {progressStats?.articlesCompleted || 0}/
                    {contentStats.totalArticles}
                  </span>
                </div>
                <Progress
                  value={
                    contentStats.totalArticles > 0
                      ? ((progressStats?.articlesCompleted || 0) /
                          contentStats.totalArticles) *
                        100
                      : 0
                  }
                  className="h-2 bg-emerald-100"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-amber-500" />
                    Flashcards
                  </span>
                  <span className="font-medium">
                    {progressStats?.flashcardsCompleted || 0}/
                    {contentStats.totalFlashcards}
                  </span>
                </div>
                <Progress
                  value={
                    contentStats.totalFlashcards > 0
                      ? ((progressStats?.flashcardsCompleted || 0) /
                          contentStats.totalFlashcards) *
                        100
                      : 0
                  }
                  className="h-2 bg-amber-100"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-blue-500" />
                    Mind Maps
                  </span>
                  <span className="font-medium">
                    {progressStats?.mindmapsCompleted || 0}/
                    {contentStats.totalMindMaps}
                  </span>
                </div>
                <Progress
                  value={
                    contentStats.totalMindMaps > 0
                      ? ((progressStats?.mindmapsCompleted || 0) /
                          contentStats.totalMindMaps) *
                        100
                      : 0
                  }
                  className="h-2 bg-blue-100"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-rose-500" />
                    MCQ Questions
                  </span>
                  <span className="font-medium">
                    {progressStats?.mcqCompleted || 0}/{contentStats.totalMcq}
                  </span>
                </div>
                <Progress
                  value={
                    contentStats.totalMcq > 0
                      ? ((progressStats?.mcqCompleted || 0) /
                          contentStats.totalMcq) *
                        100
                      : 0
                  }
                  className="h-2 bg-rose-100"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-purple-500" />
                    True/False
                  </span>
                  <span className="font-medium">
                    {progressStats?.trueFalseCompleted || 0}/
                    {contentStats.totalTrueFalse}
                  </span>
                </div>
                <Progress
                  value={
                    contentStats.totalTrueFalse > 0
                      ? ((progressStats?.trueFalseCompleted || 0) /
                          contentStats.totalTrueFalse) *
                        100
                      : 0
                  }
                  className="h-2 bg-purple-100"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-cyan-500" />
                    Fill in Blanks
                  </span>
                  <span className="font-medium">
                    {progressStats?.fillUpCompleted || 0}/
                    {contentStats.totalFillUp}
                  </span>
                </div>
                <Progress
                  value={
                    contentStats.totalFillUp > 0
                      ? ((progressStats?.fillUpCompleted || 0) /
                          contentStats.totalFillUp) *
                        100
                      : 0
                  }
                  className="h-2 bg-cyan-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Progress */}
        <Card className="lg:col-span-2 shadow-lg border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="size-5 text-violet-500" />
              Section Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map((section) => (
                <SectionProgressItem
                  key={section.id}
                  section={section}
                  stats={getSectionStats(section.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Tips */}
        <Card className="shadow-lg border-none bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="size-5 text-amber-500" />
              Study Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <Flame className="size-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Keep the momentum!</p>
                <p className="text-xs text-muted-foreground">
                  Complete at least one section daily to build a streak.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <Brain className="size-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Spaced repetition</p>
                <p className="text-xs text-muted-foreground">
                  Review flashcards multiple times for better retention.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <Target className="size-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Test yourself</p>
                <p className="text-xs text-muted-foreground">
                  Take quizzes before reviewing answers for active recall.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Info */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="size-5 text-amber-500" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Level</p>
                <p className="font-semibold capitalize">{course.level}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Tone</p>
                <p className="font-semibold capitalize">{course.tone}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Sections</p>
                <p className="font-semibold">{course.sectionCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="font-semibold capitalize">{course.status}</p>
              </div>
            </div>
            {course.targetAudience && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">
                  Target Audience
                </p>
                <p className="text-sm">{course.targetAudience}</p>
              </div>
            )}
            {course.prerequisites && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">
                  Prerequisites
                </p>
                <p className="text-sm">{course.prerequisites}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reset Progress Section */}
      <Card className="shadow-lg border-none border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
            <RotateCcw className="size-5" />
            Reset Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                This will reset all your progress for this course, including
                completed articles, flashcards, quizzes, and all earned XP. This
                action cannot be undone.
              </p>
              {progressStats &&
                progressStats.completedContentIds.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    You have completed{" "}
                    {progressStats.completedContentIds.length} items and earned{" "}
                    {progressStats.totalXpEarned} XP in this course.
                  </p>
                )}
            </div>
            <Button
              variant="destructive"
              onClick={handleResetProgress}
              disabled={
                isResetting ||
                (progressStats?.completedContentIds.length || 0) === 0
              }
              className="whitespace-nowrap"
            >
              {isResetting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="size-4 mr-2" />
                  Reset Progress
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
