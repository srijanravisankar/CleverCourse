"use server";

import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const schema: Schema = {
  description: "Course section structure with article, study material, and quiz",
  type: SchemaType.OBJECT,
  properties: {
    sectionTitle: { type: SchemaType.STRING },
    article: {
      type: SchemaType.OBJECT,
      properties: {
        pages: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              pageTitle: { type: SchemaType.STRING },
              content: { type: SchemaType.STRING, description: "Markdown content" },
            },
            required: ["pageTitle", "content"],
          },
        },
      },
      required: ["pages"],
    },
    studyMaterial: {
      type: SchemaType.OBJECT,
      properties: {
        mindMap: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        flashcards: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              front: { type: SchemaType.STRING },
              back: { type: SchemaType.STRING },
            },
            required: ["front", "back"],
          },
        },
      },
      required: ["mindMap", "flashcards"],
    },
    quiz: {
      type: SchemaType.OBJECT,
      properties: {
        mcqs: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              answer: { type: SchemaType.STRING },
            },
            required: ["question", "options", "answer"],
          },
        },
        trueFalse: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              answer: { type: SchemaType.BOOLEAN },
              explanation: { type: SchemaType.STRING },
            },
            required: ["question", "answer", "explanation"],
          },
        },
        fillUps: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              sentence: { type: SchemaType.STRING },
              missingWord: { type: SchemaType.STRING },
            },
            required: ["sentence", "missingWord"],
          },
        },
      },
      required: ["mcqs", "trueFalse", "fillUps"],
    },
  },
  required: ["sectionTitle", "article", "studyMaterial", "quiz"],
};

export async function generateCourseSection(userData: {
  topic: string;
  level: string;
  sectionNumber: number;
  totalSections: number;
  goal: string;
  tone: string;
  previousContext?: string;
}) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const contextInstruction = userData.previousContext
      ? `Context of previous coverage: ${userData.previousContext}`
      : "This is the first section.";

    const prompt = `
      Act as an elite educator. Create Section ${userData.sectionNumber} of ${userData.totalSections} for a course on "${userData.topic}".
      Target Level: ${userData.level}. Goal: ${userData.goal}. Tone: ${userData.tone}.

      ${contextInstruction}

      Detailed Requirements:
      1. Article: 3 distinct pages in Markdown.
      2. Study Material: 5 flashcards, 8 mind-map concepts.
      3. Quiz: EXACTLY 5 MCQs, 5 True/False questions, and 5 Fill-in-the-blank questions.

      Ensure logical flow and zero duplication with previous content.
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate course content.");
  }
}