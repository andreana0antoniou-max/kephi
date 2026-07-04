"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/lib/types";

export default function MessageThread({
  bookingRequestId,
}: {
  bookingRequestId: string;
}) {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      if (user) {
        supabase
          .from("message_reads")
          .upsert(
            {
              booking_request_id: bookingRequestId,
              user_id: user.id,
              last_read_at: new Date().toISOString(),
            },
            { onConflict: "booking_request_id,user_id" }
          )
          .then(() => {});
      }
    });

    supabase
      .from("messages")
      .select("*")
      .eq("booking_request_id", bookingRequestId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data);
      });

    const channel = supabase
      .channel(`messages:${bookingRequestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_request_id=eq.${bookingRequestId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, bookingRequestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !userId) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      booking_request_id: bookingRequestId,
      sender_id: userId,
      body: body.trim(),
    });

    if (!error) setBody("");
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[60vh] bg-white rounded-kephi card-shadow overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <p className="text-ink/50 text-sm text-center mt-10">
            No messages yet — say hello!
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine ? "bg-tangerine text-white" : "bg-ink/5 text-ink"
                }`}
              >
                <p className="whitespace-pre-line">{m.body}</p>
                <p
                  className={`text-[11px] mt-1 ${
                    mine ? "text-white/70" : "text-ink/40"
                  }`}
                >
                  {new Date(m.created_at).toLocaleString([], {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-ink/10">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-ink/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="rounded-full px-5 py-2.5 bg-tangerine text-white font-bold hover:bg-ink transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
