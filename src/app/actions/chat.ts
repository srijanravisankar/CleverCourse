"use server";

/**
 * Chat Server Actions
 *
 * These server actions provide the interface between the frontend
 * and the database for chat-related operations.
 */

import { conversationRepository, messageRepository } from "@/db/repositories";
import type {
  ChatConversation,
  ChatMessage,
  ConversationWithMessages,
} from "@/db/types";

// ============================================================================
// CONVERSATION ACTIONS
// ============================================================================

/**
 * Create a new chat conversation
 */
export async function createConversation(
  courseId?: string,
  title?: string,
): Promise<ChatConversation> {
  return conversationRepository.create({
    courseId: courseId ?? null,
    title: title ?? null,
    userId: null, // Will be set when auth is implemented
  });
}

/**
 * Get a conversation by ID with all messages
 */
export async function getConversationWithMessages(
  id: string,
): Promise<ConversationWithMessages | null> {
  const conversation = await conversationRepository.findByIdWithMessages(id);
  return conversation ?? null;
}

/**
 * Get all conversations for a course
 */
export async function getCourseConversations(
  courseId: string,
): Promise<ChatConversation[]> {
  return conversationRepository.findByCourseId(courseId);
}

/**
 * Get the latest conversation (or create a new one if none exists)
 */
export async function getOrCreateConversation(
  courseId?: string,
): Promise<ChatConversation> {
  // For now, we'll just create a new conversation
  // When auth is implemented, we can look up by user
  return createConversation(courseId);
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  id: string,
  title: string,
): Promise<ChatConversation | null> {
  const conversation = await conversationRepository.update(id, { title });
  return conversation ?? null;
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(id: string): Promise<void> {
  await conversationRepository.delete(id);
}

// ============================================================================
// MESSAGE ACTIONS
// ============================================================================

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  context?: string,
): Promise<ChatMessage> {
  return messageRepository.create({
    conversationId,
    role,
    content,
    context: context ?? null,
  });
}

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  return messageRepository.findByConversationId(conversationId);
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string): Promise<void> {
  await messageRepository.delete(id);
}

/**
 * Clear all messages from a conversation
 */
export async function clearConversationMessages(
  conversationId: string,
): Promise<void> {
  await messageRepository.deleteByConversationId(conversationId);
}

// ============================================================================
// COMBINED ACTIONS
// ============================================================================

/**
 * Send a message and get the conversation updated
 * This is a helper that creates the user message and returns the conversation
 */
export async function sendUserMessage(
  conversationId: string,
  content: string,
  context?: string,
): Promise<{ message: ChatMessage; conversation: ConversationWithMessages }> {
  const message = await addMessage(conversationId, "user", content, context);
  const conversation = await getConversationWithMessages(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return { message, conversation };
}

/**
 * Add assistant response to a conversation
 */
export async function addAssistantMessage(
  conversationId: string,
  content: string,
): Promise<{ message: ChatMessage; conversation: ConversationWithMessages }> {
  const message = await addMessage(conversationId, "assistant", content);
  const conversation = await getConversationWithMessages(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return { message, conversation };
}
