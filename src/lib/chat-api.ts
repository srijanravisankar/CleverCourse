"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ChatRequest {
  message: string;
  context?: string;
  conversationHistory?: Array<{ role: "user" | "model"; parts: string }>;
}

export interface ChatResponse {
  response: string;
  error?: string;
}

/**
 * Send a message to Gemini AI and get a response
 * @param request Chat request with message, optional context, and conversation history
 * @returns Chat response with AI-generated text
 */
export async function sendChatMessage(
  request: ChatRequest,
): Promise<ChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build the prompt with context if provided
    let prompt = request.message;
    if (request.context) {
      prompt = `Based on the following context:\n\n"${request.context}"\n\nUser question: ${request.message}`;
    }

    // Start a chat session if there's conversation history
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      const chat = model.startChat({
        history: request.conversationHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return { response: response.text() };
    }

    // Otherwise, just send a single message
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { response: response.text() };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return {
      response: "",
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while processing your request.",
    };
  }
}

/**
 * Send a message to Gemini AI with streaming response
 * @param request Chat request with message and optional context
 * @returns Async generator that yields chunks of the response
 */
export async function* streamChatMessage(
  request: ChatRequest,
): AsyncGenerator<string, void, unknown> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let prompt = request.message;
    if (request.context) {
      prompt = `Based on the following context:\n\n"${request.context}"\n\nUser question: ${request.message}`;
    }

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error) {
    console.error("Error streaming chat message:", error);
    yield "Sorry, I encountered an error. Please try again.";
  }
}
