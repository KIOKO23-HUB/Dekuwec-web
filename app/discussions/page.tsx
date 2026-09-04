// app/discussions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { Plus, ThumbsUp, ThumbsDown, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function DiscussionsPage() {
  const { user } = useUser();
  const [topics, setTopics] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Debate");
  const [prompt, setPrompt] = useState("");
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/discussions");
      const data = await res.json();
      if (data.topics) setTopics(data.topics);
    } catch (err) {
      console.error("Failed to fetch discussions:", err);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handlePostTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a discussion.");
      return;
    }

    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          prompt: prompt.trim(),
          authorName: user.fullName || user.username || "Club Member",
          authorId: user.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit topic");

      setTitle("");
      setPrompt("");
      setSuccessMsg("Topic submitted successfully! It will appear publicly once approved.");
      setTimeout(() => setSuccessMsg(""), 5000);
      fetchTopics();
    } catch (err: any) {
      alert("Failed to submit topic: " + err.message);
    }
  };

  const handleReaction = async (id: string, type: "likes" | "dislikes") => {
    try {
      await fetch(`/api/discussions/${id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      fetchTopics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (id: string) => {
    const text = commentInputs[id];
    if (!text || !text.trim() || !user) return;

    try {
      await fetch(`/api/discussions/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.fullName || user.username || "Member",
          text: text.trim(),
        }),
      });
      setCommentInputs({ ...commentInputs, [id]: "" });
      fetchTopics();
    } catch (err: any) {
      alert("Failed to add comment: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100">
      <Navbar />

      <main className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">EcoPulse Discussions & News</h1>
            <p className="text-xs text-slate-400 mt-1">Share conservation knowledge, history, or pose questions for the community.</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submission Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-400" /> Propose a Topic or Ask a Question
          </h3>
          <form onSubmit={handlePostTopic} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white outline-none"
                >
                  <option value="Debate">Weekly Debate</option>
                  <option value="Kenya">Kenya Conservation Frontline</option>
                  <option value="Knowledge">Historical Fact / New Knowledge</option>
                  <option value="Question">Community Question</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Topic Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The ecological impact of Mau Forest restoration..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Detailed Prompt / Question</label>
              <textarea
                rows={3}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Provide background info, context, or your question..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              Submit for Admin Approval
            </button>
          </form>
        </div>

        {/* Live Topics Stream */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-300 text-sm">Community Discussions Feed</h3>
          {topics.filter((t) => t.status === "Approved" || !t.status).length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No active discussions approved yet.</p>
          ) : (
            topics
              .filter((t) => t.status === "Approved" || !t.status)
              .map((item) => (
                <div key={item._id || item.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400">Posted by <strong className="text-white">{item.authorName || "Member"}</strong></span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-white text-base">{item.title}</h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.prompt}</p>
                  </div>

                  {/* Likes / Dislikes */}
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleReaction(item._id || item.id, "likes")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-emerald-400 transition"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{item.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(item._id || item.id, "dislikes")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-rose-400 transition"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span>{item.dislikes || 0}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> Comments ({item.comments?.length || 0})
                    </p>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {item.comments?.map((c: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                          <span className="font-bold text-emerald-400">{c.userName}: </span>
                          <span className="text-slate-300">{c.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a live comment..."
                        value={commentInputs[item._id || item.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [item._id || item.id]: e.target.value })}
                        className="flex-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(item._id || item.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </main>
    </div>
  );
}
