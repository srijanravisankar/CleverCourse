"use client";

import * as React from "react";
import {
  X,
  BookOpen,
  Target,
  Users,
  Sparkles,
  Hash,
  MessageSquare,
  Upload,
  File,
  Folder,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCourseOnly, type FileUpload } from "@/lib/course-generator";
import type { CourseLevel, CourseTone } from "@/db/types";

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onCourseCreated?: (courseId: string, sectionCount?: number) => void;
}

interface UploadedFileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  path?: string;
  file?: File; // Store the actual File object
}

type GenerationStatus =
  | "idle"
  | "preparing"
  | "generating"
  | "complete"
  | "error";

export function CreateCourseDialog({
  open,
  onClose,
  onCourseCreated,
}: CreateCourseDialogProps) {
  const [formData, setFormData] = React.useState({
    topic: "",
    level: "beginner" as CourseLevel,
    goal: "",
    tone: "professional" as CourseTone,
    sectionCount: "5",
    targetAudience: "",
    prerequisites: "",
    timeCommitment: "30",
    startDate: "",
    endDate: "",
  });

  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFileItem[]>(
    [],
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [generationStatus, setGenerationStatus] =
    React.useState<GenerationStatus>("idle");
  const [generationMessage, setGenerationMessage] = React.useState("");
  const [generationError, setGenerationError] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  if (!open) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.topic.trim()) {
      newErrors.topic = "Course topic is required";
    }

    if (!formData.goal.trim()) {
      newErrors.goal = "Learning goal is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:mime/type;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setGenerationStatus("preparing");
    setGenerationMessage("Creating course...");
    setGenerationError("");

    try {
      // Convert uploaded files to FileUpload format
      const filesToUpload: FileUpload[] = [];

      for (const uploadedFile of uploadedFiles) {
        if (uploadedFile.file && uploadedFile.type === "file") {
          const base64 = await fileToBase64(uploadedFile.file);
          filesToUpload.push({
            name: uploadedFile.name,
            type: uploadedFile.file.type,
            size: uploadedFile.file.size,
            data: base64,
          });
        }
      }

      // Create course record only (no section generation - that happens in sidebar)
      const result = await createCourseOnly(
        {
          topic: formData.topic,
          level: formData.level,
          goal: formData.goal,
          tone: formData.tone,
          targetAudience: formData.targetAudience || undefined,
          prerequisites: formData.prerequisites || undefined,
          sectionCount: parseInt(formData.sectionCount),
          timeCommitment: parseInt(formData.timeCommitment),
          startDate: formData.startDate
            ? new Date(formData.startDate)
            : undefined,
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        },
        filesToUpload,
      );

      if (result.success && result.courseId) {
        // Call the callback with courseId and section count
        // The sidebar will handle generating ALL sections (including section 1)
        if (onCourseCreated) {
          onCourseCreated(result.courseId, parseInt(formData.sectionCount));
        }

        // Close immediately and reset form
        onClose();
        setFormData({
          topic: "",
          level: "beginner",
          goal: "",
          tone: "professional",
          sectionCount: "5",
          targetAudience: "",
          prerequisites: "",
          timeCommitment: "30",
          startDate: "",
          endDate: "",
        });
        setUploadedFiles([]);
        setGenerationStatus("idle");
      } else {
        setGenerationStatus("error");
        // Parse error message for user-friendly display
        let errorMsg = result.error || "Failed to create course";
        if (
          errorMsg.includes("429") ||
          errorMsg.includes("quota") ||
          errorMsg.includes("Too Many Requests")
        ) {
          errorMsg =
            "API rate limit reached. Please wait a few minutes before trying again.";
        }
        setGenerationError(errorMsg);
      }
    } catch (error) {
      console.error("Course creation error:", error);
      setGenerationStatus("error");
      let errorMsg =
        error instanceof Error ? error.message : "An unexpected error occurred";
      if (
        errorMsg.includes("429") ||
        errorMsg.includes("quota") ||
        errorMsg.includes("Too Many Requests")
      ) {
        errorMsg =
          "API rate limit reached. Please wait a few minutes before trying again.";
      }
      setGenerationError(errorMsg);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFileItem[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: "file",
      size: `${(file.size / 1024).toFixed(1)} KB`,
      path: file.webkitRelativePath || file.name,
      file: file, // Store the actual File object
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const newFiles: UploadedFileItem[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: "file",
      size: `${(file.size / 1024).toFixed(1)} KB`,
      path: file.webkitRelativePath || file.name,
      file: file,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Group files by their root folder
    const folderName = files[0].webkitRelativePath.split("/")[0];

    const newFiles: UploadedFileItem[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: "file",
      size: `${(file.size / 1024).toFixed(1)} KB`,
      path: file.webkitRelativePath,
      file: file,
    }));

    // Add a folder entry
    const folderEntry: UploadedFileItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: folderName,
      type: "folder",
      size: `${files.length} files`,
    };

    setUploadedFiles((prev) => [...prev, folderEntry, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const isGenerating =
    generationStatus === "preparing" || generationStatus === "generating";

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={isGenerating ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-background border rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Generation Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-background/95 z-10 flex flex-col items-center justify-center p-8">
              <div className="relative">
                <div className="size-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center animate-pulse">
                  <Loader2 className="size-10 text-purple-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-bold mt-6 text-center">
                Creating Your Course
              </h3>
              <p className="text-muted-foreground text-center mt-2 max-w-md">
                {generationMessage}
              </p>
              <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-purple-600 animate-pulse" />
                <span>Setting up your personalized learning experience...</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {generationStatus === "error" && (
            <div className="absolute inset-0 bg-background/95 z-10 flex flex-col items-center justify-center p-8">
              <div className="size-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="size-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mt-6 text-center text-red-600">
                Generation Failed
              </h3>
              <p className="text-muted-foreground text-center mt-2 max-w-md">
                {generationError}
              </p>
              <Button
                onClick={() => setGenerationStatus("idle")}
                className="mt-6"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Header */}
          <div className="border-b p-6 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-6 text-purple-600" />
                  Create New Course
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your materials or describe your course, and we'll
                  generate personalized content with AI
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-black/10"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* File Upload Section - FIRST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Upload className="size-4 text-purple-600" />
                    Course Materials (Optional)
                  </Label>
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-full">
                    <Info className="size-3" />
                    <span>AI will analyze your files</span>
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragging
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20 scale-105"
                      : "border-border hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/10"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.md,.ppt,.pptx"
                  />
                  <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFolderUpload}
                    // @ts-ignore - webkitdirectory is not in the type definitions
                    webkitdirectory=""
                    directory=""
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="size-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {isDragging
                          ? "Drop files here"
                          : "Drag & drop files or folders here"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-purple-600 hover:text-purple-700 font-medium underline"
                        >
                          browse files
                        </button>
                        {" / "}
                        <button
                          type="button"
                          onClick={() => folderInputRef.current?.click()}
                          className="text-purple-600 hover:text-purple-700 font-medium underline"
                        >
                          browse folders
                        </button>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        PDF, DOC, TXT, MD, PPT - We'll build the course around
                        your materials
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        Uploaded files ({uploadedFiles.length})
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFiles([])}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Clear all
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto rounded-lg border p-2 bg-slate-50/50 dark:bg-slate-900/20">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border transition-all hover:shadow-sm ${
                            file.type === "folder"
                              ? "border-blue-200 dark:border-blue-900"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {file.type === "folder" ? (
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Folder className="size-4 text-blue-600" />
                              </div>
                            ) : (
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <File className="size-4 text-slate-600" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-2">
                                {file.size && (
                                  <p className="text-xs text-muted-foreground">
                                    {file.size}
                                  </p>
                                )}
                                {file.path && file.path !== file.name && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    • {file.path}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Course Details
                  </span>
                </div>
              </div>
              {/* Topic */}
              <div className="space-y-2">
                <Label
                  htmlFor="topic"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <BookOpen className="size-4 text-green-600" />
                  Course Topic
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., React Fundamentals, Python for Data Science, Digital Marketing..."
                  value={formData.topic}
                  onChange={(e) => {
                    handleChange("topic", e.target.value);
                    if (errors.topic)
                      setErrors((prev) => ({ ...prev, topic: "" }));
                  }}
                  className={`h-12 text-base ${errors.topic ? "border-red-500" : ""}`}
                  required
                />
                {errors.topic && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    ⚠️ {errors.topic}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  What is the main subject or topic of your course?
                </p>
              </div>

              {/* Learning Level */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="size-4 text-blue-600" />
                  Learning Level
                  <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: "beginner", label: "Beginner", emoji: "🌱" },
                    {
                      value: "intermediate",
                      label: "Intermediate",
                      emoji: "🚀",
                    },
                    { value: "advanced", label: "Advanced", emoji: "⚡" },
                    { value: "expert", label: "Expert", emoji: "🎯" },
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleChange("level", level.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                        formData.level === level.value
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : "border-border hover:border-purple-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{level.emoji}</div>
                      <div className="text-sm font-medium">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Goal */}
              <div className="space-y-2">
                <Label
                  htmlFor="goal"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Target className="size-4 text-orange-600" />
                  Learning Goal
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="goal"
                  placeholder="e.g., Build a portfolio website, Pass certification exam, Career switch..."
                  value={formData.goal}
                  onChange={(e) => {
                    handleChange("goal", e.target.value);
                    if (errors.goal)
                      setErrors((prev) => ({ ...prev, goal: "" }));
                  }}
                  className={`h-12 text-base ${errors.goal ? "border-red-500" : ""}`}
                  required
                />
                {errors.goal && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    ⚠️ {errors.goal}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  What do you want to achieve after completing this course?
                </p>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label
                  htmlFor="targetAudience"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Users className="size-4 text-pink-600" />
                  Target Audience
                </Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., College students, Working professionals, Career changers..."
                  value={formData.targetAudience}
                  onChange={(e) =>
                    handleChange("targetAudience", e.target.value)
                  }
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Who is this course designed for? (Optional)
                </p>
              </div>

              {/* Prerequisites */}
              <div className="space-y-2">
                <Label
                  htmlFor="prerequisites"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <BookOpen className="size-4 text-indigo-600" />
                  Prerequisites
                </Label>
                <Input
                  id="prerequisites"
                  placeholder="e.g., Basic HTML/CSS, No prior experience needed..."
                  value={formData.prerequisites}
                  onChange={(e) =>
                    handleChange("prerequisites", e.target.value)
                  }
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  What knowledge should learners have before starting?
                  (Optional)
                </p>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="size-4 text-teal-600" />
                  Teaching Tone
                  <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: "professional",
                      label: "Professional",
                      desc: "Formal & structured",
                    },
                    {
                      value: "casual",
                      label: "Casual",
                      desc: "Friendly & relaxed",
                    },
                    {
                      value: "technical",
                      label: "Technical",
                      desc: "Detailed & precise",
                    },
                  ].map((tone) => (
                    <button
                      key={tone.value}
                      type="button"
                      onClick={() => handleChange("tone", tone.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                        formData.tone === tone.value
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : "border-border hover:border-purple-300"
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">
                        {tone.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tone.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Sections */}
              <div className="space-y-2">
                <Label
                  htmlFor="sectionCount"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Hash className="size-4 text-yellow-600" />
                  Number of Sections
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="sectionCount"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.sectionCount}
                    onChange={(e) => {
                      const val = Math.min(
                        10,
                        Math.max(1, parseInt(e.target.value) || 1),
                      );
                      handleChange("sectionCount", val.toString());
                    }}
                    className="h-12 text-base w-32"
                    required
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.sectionCount}
                      onChange={(e) =>
                        handleChange("sectionCount", e.target.value)
                      }
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1 section</span>
                      <span>10 sections (max)</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  How many sections/chapters should this course have?
                </p>
              </div>

              {/* Time Commitment */}
              <div className="space-y-2">
                <Label
                  htmlFor="timeCommitment"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Clock className="size-4 text-emerald-600" />
                  Daily Time Commitment
                  <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: "15", label: "15 min", emoji: "⚡" },
                    { value: "30", label: "30 min", emoji: "🎯" },
                    { value: "60", label: "1 hour", emoji: "💪" },
                    { value: "120", label: "2 hours", emoji: "🚀" },
                  ].map((time) => (
                    <button
                      key={time.value}
                      type="button"
                      onClick={() => handleChange("timeCommitment", time.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                        formData.timeCommitment === time.value
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                          : "border-border hover:border-emerald-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{time.emoji}</div>
                      <div className="text-sm font-medium">{time.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  How much time can you dedicate to learning each day?
                </p>
              </div>

              {/* Course Duration - From/To Dates */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="size-4 text-blue-600" />
                  Course Duration
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="startDate"
                      className="text-sm text-muted-foreground"
                    >
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => {
                        handleChange("startDate", e.target.value);
                        if (errors.endDate)
                          setErrors((prev) => ({ ...prev, endDate: "" }));
                      }}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="endDate"
                      className="text-sm text-muted-foreground"
                    >
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      min={formData.startDate}
                      onChange={(e) => {
                        handleChange("endDate", e.target.value);
                        if (errors.endDate)
                          setErrors((prev) => ({ ...prev, endDate: "" }));
                      }}
                      className={`h-12 ${errors.endDate ? "border-red-500" : ""}`}
                    />
                  </div>
                </div>
                {errors.endDate && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    ⚠️ {errors.endDate}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  When do you want to start and complete this course? (Optional)
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-8 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Sparkles className="size-4 mr-2" />
                    Generate Course
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
