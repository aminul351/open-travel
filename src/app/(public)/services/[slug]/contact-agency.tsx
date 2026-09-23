"use client";

import { useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { startConversationAction } from "@/app/dashboard/chat/actions";

export function ContactAgencyButton({
  serviceId,
  serviceTitle,
  agencyName,
  isSignedIn,
  isCustomer,
}: {
  serviceId: string;
  serviceTitle: string;
  agencyName: string;
  isSignedIn: boolean;
  isCustomer: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    `Hi ${agencyName}, I'm interested in "${serviceTitle}" and would like more information.`
  );
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    if (!isSignedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!isCustomer) {
      toast.error("Only customer accounts can initiate inquiries with agencies.");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await startConversationAction(serviceId, message);
      if (res.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }

      toast.success("Message sent to agency!");
      setOpen(false);
      router.push(`/dashboard/chat?id=${res.conversationId}`);
    } catch {
      toast.error("Failed to send message. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        size="lg"
      >
        <MessageSquare className="size-4" />
        Contact Agency
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">Message {agencyName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Regarding <span className="font-medium text-foreground">{serviceTitle}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about dates, availability, custom requests, etc."
                rows={4}
                required
                className="resize-none"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !message.trim()} className="gap-2">
                  <Send className="size-4" />
                  {loading ? "Sending..." : "Send inquiry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
