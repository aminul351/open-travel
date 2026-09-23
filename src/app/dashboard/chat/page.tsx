import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { apiFetch, type ApiConversation } from "@/lib/api";

import { ChatView } from "./chat-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Messages | Open Travel",
  description: "Chat with agencies and customers in real-time.",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await searchParams;

  const convListRes = await apiFetch<{ conversations: ApiConversation[] }>(
    "/api/chat/conversations"
  ).catch(() => ({ conversations: [] }));
  const conversations = convListRes?.conversations ?? [];

  const targetId = id || (conversations.length > 0 ? conversations[0].id : null);

  let activeConversation: ApiConversation | null = null;
  if (targetId) {
    const threadRes = await apiFetch<{ conversation: ApiConversation }>(
      `/api/chat/conversations/${targetId}`
    ).catch(() => null);
    activeConversation = threadRes?.conversation ?? null;
  }

  const role = (session.user.role as "CUSTOMER" | "AGENCY" | "ADMIN") || "CUSTOMER";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === "AGENCY"
            ? "Inquiries and questions from customers regarding your services."
            : "Direct communication with travel agencies about their packages and services."}
        </p>
      </div>

      <ChatView
        initialConversations={conversations}
        initialActiveConversation={activeConversation}
        currentRole={role}
      />
    </div>
  );
}
