// components/MessagesTab.tsx
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where, updateDoc, doc, addDoc } from "firebase/firestore";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;
    const qMsgs = query(
      collection(db, "member_messages"),
      where("recipientUid", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(qMsgs, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (msgId: string) => {
    try {
      await updateDoc(doc(db, "member_messages", msgId), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (originalMsg: any) => {
    const text = replyText[originalMsg.id];
    if (!text || !text.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "member_messages"), {
        recipientUid: originalMsg.senderUid || originalMsg.senderEmail,
        recipientEmail: originalMsg.senderEmail,
        recipientName: originalMsg.senderName,
        senderName: auth.currentUser.displayName || "Club Member",
        senderEmail: auth.currentUser.email,
        senderUid: auth.currentUser.uid,
        message: text.trim(),
        createdAt: new Date().toISOString(),
        read: false,
      });

      setSuccessMsg("Reply sent successfully!");
      setReplyText({ ...replyText, [originalMsg.id]: "" });
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert("Failed to send reply: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-white">Direct Messages Inbox</h1>
        <p className="text-xs text-slate-400 mt-1">Private communications sent specifically to you from members or administrators.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
          <MessageSquare className="h-8 w-8 mx-auto text-slate-600" />
          <p className="text-xs">No direct messages received yet.</p>
        </div>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            onClick={() => !m.read && handleMarkAsRead(m.id)}
            className={`bg-slate-900 border rounded-3xl p-6 shadow-lg space-y-3 transition ${
              !m.read ? "border-emerald-500/50 bg-slate-900/90" : "border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {m.senderName ? m.senderName[0].toUpperCase() : "M"}
                </span>
                <div>
                  <h4 className="font-black text-white text-sm">{m.senderName}</h4>
                  <p className="text-[10px] text-slate-400">{m.senderEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!m.read && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black animate-pulse">
                    New
                  </span>
                )}
                <span className="text-[11px] text-slate-500">
                  {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200">
              {m.message}
            </div>

            <div className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder={`Reply to ${m.senderName}...`}
                value={replyText[m.id] || ""}
                onChange={(e) => setReplyText({ ...replyText, [m.id]: e.target.value })}
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
              />
              <button
                onClick={() => handleSendReply(m)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}