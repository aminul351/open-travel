"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  CheckCheck,
  ExternalLink,
  MessageSquare,
  Package,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ApiConversation, ApiMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import { fetchConversationAction, sendMessageAction } from "./actions";

export function ChatView({
  initialConversations,
  initialActiveConversation,
  currentRole,
}: {
  initialConversations: ApiConversation[];
  initialActiveConversation?: ApiConversation | null;
  currentRole: "CUSTOMER" | "AGENCY" | "ADMIN";
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ApiConversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(
    initialActiveConversation?.id ?? initialConversations[0]?.id ?? null
  );
  const [activeConversation, setActiveConversation] = useState<ApiConversation | null>(
    initialActiveConversation ?? null
  );
  const [messages, setMessages] = useState<ApiMessage[]>(
    initialActiveConversation?.messages ?? []
  );
  const [inputText, setInputText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loadingThread, setLoadingThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation details when activeId changes
  useEffect(() => {
    if (!activeId) return;

    let isMounted = true;
    setLoadingThread(true);

    fetchConversationAction(activeId).then((res) => {
      if (!isMounted) return;
      setLoadingThread(false);
      if (res.conversation) {
        setActiveConversation(res.conversation);
        setMessages(res.conversation.messages ?? []);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeId]);

  // Periodic polling for incoming messages in the active thread
  useEffect(() => {
    if (!activeId) return;

    const interval = setInterval(() => {
      fetchConversationAction(activeId).then((res) => {
        if (res.conversation) {
          setActiveConversation(res.conversation);
          setMessages((prev) => {
            const incoming = res.conversation?.messages ?? [];
            if (incoming.length !== prev.length) {
              return incoming;
            }
            return prev;
          });
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeId]);

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText("");

    // Optimistic message append
    const optimisticMessage: ApiMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeId,
      senderRole: currentRole === "AGENCY" ? "AGENCY" : "CUSTOMER",
      text: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    startTransition(async () => {
      const res = await sendMessageAction(activeId, textToSend);
      if (res.error) {
        toast.error(res.error);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      } else if (res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? res.message! : m))
        );
        // Update lastPreview in sidebar list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  lastPreview: textToSend,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      }
    });
  };

  const handleRefresh = async () => {
    if (!activeId) return;
    setLoadingThread(true);
    const res = await fetchConversationAction(activeId);
    setLoadingThread(false);
    if (res.conversation) {
      setActiveConversation(res.conversation);
      setMessages(res.conversation.messages ?? []);
      toast.success("Messages updated");
    }
  };

  return (
    <Card className="flex h-[720px] max-h-[82vh] overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg">
      {/* Sidebar Conversation List */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 flex flex-col border-r border-border/70 bg-card transition-all",
          activeId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="size-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">Inquiries</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-muted-foreground">Live</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {conversations.length === 0 ? (
            <div className="p-10 text-center text-xs text-muted-foreground">
              <p>No conversations yet.</p>
              <p className="mt-1 text-[11px]">
                {currentRole === "AGENCY"
                  ? "When travelers contact you about listings, conversations will appear here."
                  : "When you contact an agency regarding a tour, your messages will appear here."}
              </p>
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = c.id === activeId;
              const initials = (c.otherName || "U")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                  }}
                  className={cn(
                    "w-full text-left p-4 transition-all flex items-start gap-3 border-l-3 hover:bg-muted/40",
                    isSelected
                      ? "bg-primary/5 border-l-primary"
                      : "border-l-transparent"
                  )}
                >
                  <Avatar className="size-10 mt-0.5 ring-2 ring-border/60 shrink-0">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-sm text-foreground truncate">
                        {c.otherName}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {c.updatedAt ? formatDate(c.updatedAt) : ""}
                      </span>
                    </div>
                    {c.service?.title && (
                      <p className="text-xs text-primary font-semibold truncate mt-0.5">
                        {c.service.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {c.lastPreview || "No messages yet"}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 shrink-0">
                      {c.unread}
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Thread */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-background",
          !activeId ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden size-8 rounded-lg"
                  onClick={() => setActiveId(null)}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground leading-none">
                      {activeConversation.otherName}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold border-primary/20 bg-primary/10 text-primary capitalize px-2 py-0"
                    >
                      {currentRole === "AGENCY" ? "Traveler" : "Partner Agency"}
                    </Badge>
                  </div>

                  {activeConversation.service && (
                    <Link
                      href={`/services/${activeConversation.service.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1 font-medium"
                    >
                      <Package className="size-3" />
                      <span>{activeConversation.service.title}</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={loadingThread}
                  className="size-8 rounded-lg"
                  title="Refresh messages"
                >
                  <RefreshCw
                    className={`size-4 text-muted-foreground ${loadingThread ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/15">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                    <Sparkles className="size-5" />
                  </div>
                  <p className="font-medium text-foreground text-sm">Start your conversation</p>
                  <p className="mt-0.5">Type a question or message below to begin chatting.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine =
                    (currentRole === "AGENCY" && m.senderRole === "AGENCY") ||
                    (currentRole === "CUSTOMER" && m.senderRole === "CUSTOMER");

                  return (
                    <div
                      key={m.id}
                      className={cn("flex flex-col", isMine ? "items-end" : "items-start")}
                    >
                      <div className="text-[10px] text-muted-foreground mb-1 px-1">
                        {isMine ? "You" : activeConversation.otherName} • {formatDate(m.createdAt)}
                      </div>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs leading-relaxed",
                          isMine
                            ? "bg-gradient-to-r from-primary to-blue-600 text-white rounded-br-xs font-normal"
                            : "bg-card text-foreground rounded-bl-xs border border-border/80"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t border-border/60 p-3.5 bg-card"
            >
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write your message... (press Enter to send)"
                disabled={isPending || loadingThread}
                className="flex-1 h-10 rounded-xl border-border/80 text-xs sm:text-sm bg-muted/20"
                autoFocus
              />
              <Button
                type="submit"
                disabled={isPending || !inputText.trim() || loadingThread}
                size="default"
                className="gap-1.5 rounded-xl h-10 px-4 font-semibold shadow-xs"
              >
                <Send className="size-3.5" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
              <MessageSquare className="size-6" />
            </div>
            <p className="font-bold text-base text-foreground">No conversation selected</p>
            <p className="text-xs mt-1 max-w-xs">
              Select an inquiry from the sidebar or click &quot;Contact Agency&quot; on any service to start a conversation.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
