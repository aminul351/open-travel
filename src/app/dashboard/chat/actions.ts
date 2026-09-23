"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { apiFetch, ApiError, type ApiConversation, type ApiMessage } from "@/lib/api";

export type StartChatResult = {
  ok?: boolean;
  conversationId?: string;
  error?: string;
};

export type SendMessageResult = {
  ok?: boolean;
  message?: ApiMessage;
  error?: string;
};

export async function startConversationAction(
  serviceId: string,
  initialMessage?: string
): Promise<StartChatResult> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Please sign in to contact the agency." };
  }

  try {
    const result = await apiFetch<{ conversation: ApiConversation }>(
      "/api/chat/conversations",
      {
        method: "POST",
        body: {
          serviceId,
          text: initialMessage?.trim() || undefined,
        },
      }
    );

    revalidatePath("/dashboard/chat");
    return { ok: true, conversationId: result.conversation.id };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Failed to start conversation. Please try again." };
  }
}

export async function sendMessageAction(
  conversationId: string,
  text: string
): Promise<SendMessageResult> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Please sign in to send messages." };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "Message cannot be empty." };
  }

  try {
    const result = await apiFetch<{ message: ApiMessage }>(
      `/api/chat/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: { text: trimmed },
      }
    );

    revalidatePath("/dashboard/chat");
    return { ok: true, message: result.message };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Failed to send message." };
  }
}

export async function fetchConversationAction(conversationId: string): Promise<{
  conversation?: ApiConversation;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  try {
    const result = await apiFetch<{ conversation: ApiConversation }>(
      `/api/chat/conversations/${conversationId}`
    );
    return { conversation: result.conversation };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Failed to load conversation." };
  }
}
