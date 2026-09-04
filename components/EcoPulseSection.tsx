// components/EcoPulseSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  Radio, 
  HelpCircle, 
  MessageSquareQuote, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Flame, 
  ArrowRight,
  Globe2,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Plus
} from "lucide-react";

interface FeedItem {
  id: string;
  category: "Kenya" | "Global" | "Campus" | "Debate" | "Knowledge" | "Question";
  title: string;
  prompt: string;
  meetingInfo: string;
  authorName?: string;
  status?: string;
  likes?: number;
  dislikes?: number;
  comments?: any[];
  createdAt?: any;
}

interface QuizItem {
  id: string;
  weekNumber: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const DEFAULT_QUIZ: QuizItem = {
  id: "default-quiz",
  weekNumber: "Week 4",
  question: "Which of the following indigenous tree species is most critical for restoring high-altitude mountain water catchments in Kenya?",
  options: [
    "A. Eucalyptus grandis (Blue Gum)",
    "B. Juniperus procera (African Pencil Cedar)",
    "C. Cupressus lusitanica (Mexican Cypress)",
    "D. Pinus patula (Patula Pine)",
  ],
  correctIndex: 1,
  explanation: "Juniperus procera (African Pencil Cedar) is a native highland conifer vital for cloud water interception and catchment soil retention.",
};

export default function EcoPulseSection() {
  const { user, isSignedIn } = useUser();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem>(DEFAULT_QUIZ);
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newCategory, setNewCategory] = useState("Debate");
  const [newTitle, setNewTitle] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [submittingTopic, setSubmittingTopic] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Fetch discussions and quizzes from API endpoints
    const fetchData = async () => {
      try {
        const res = await fetch("/api/ecopulse");
        const data = await res.json();
        if (data.feedItems && data.feedItems.length > 0) {
          setFeedItems(data.feedItems);
        } else {
          setFeedItems([
            {
              id: "default-debate",
              category: "Debate",
              title: "Carbon Credit Markets: Genuine Climate Solution or Corporate Greenwashing?",
              prompt: "As Kenya positions itself as an African carbon trading hub, do forest carbon projects equitably benefit surrounding indigenous communities and grassroots conservationists, or do they primarily serve foreign industrial emitters?",
              meetingInfo: "Wednesday • 4:00 PM • Resource Centre Hall",
            },
          ]);
        }
        if (data.latestQuiz) {
          setCurrentQuiz(data.latestQuiz);
        }
      } catch (err) {
        console.error("Failed to load EcoPulse data:", err);
      }
    };

    fetchData();
  }, []);

  const handleQuizSubmit = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
    }
  };

  const handlePostTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !user) {
      alert("Please log in to submit a discussion or question.");
      return;
    }

    setSubmittingTopic(true);
    try {
      const authorDisplayName = user.fullName || user.firstName || "Club Member";
      const res = await fetch("/api/ecopulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "postTopic",
          title: newTitle.trim(),
          category: newCategory,
          prompt: newPrompt.trim(),
          authorName: authorDisplayName,
          authorId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit topic");

      setFeedItems((prev) => [data.newItem, ...prev]);
      setNewTitle("");
      setNewPrompt("");
      setShowSubmitForm(false);
      setToastMsg("Topic submitted successfully! It is now live in the feed.");
      setTimeout(() => setToastMsg(""), 5000);
    } catch (err: any) {
      alert("Failed to submit topic: " + err.message);
    } finally {
      setSubmittingTopic(false);
    }
  };

  const handleReaction = async (id: string, currentCount: number = 0, type: "likes" | "dislikes") => {
    try {
      const res = await fetch("/api/ecopulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "react", id, type, currentCount }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, [type]: data.newValue } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (id: string) => {
    const text = commentInputs[id];
    if (!text || !text.trim() || !user) {
      if (!user) alert("Please log in to leave a comment.");
      return;
    }

    try {
      const commenterName = user.fullName || user.firstName || "Member";
      const res = await fetch("/api/ecopulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addComment",
          id,
          comment: {
            userName: commenterName,
            userId: user.id,
            text: text.trim(),
            timestamp: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, comments: data.comments } : item))
        );
        setCommentInputs({ ...commentInputs, [id]: "" });
      }
    } catch (err: any) {
      alert("Failed to add comment: " + err.message);
    }
  };

  const approvedItems = feedItems.filter((i) => i.status === "Approved" || !i.status);
  const primaryDebate = approvedItems.find((i) => i.category === "Debate") || approvedItems[0];
  const newsAndDispatches = approvedItems.filter((i) => i.id !== primaryDebate?.id);

  return (
    <section id="ecopulse-section" className="py-14 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200">
              <Radio className="h-3.5 w-3.5 text-emerald-700 animate-pulse" />
              EcoPulse Dispatch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Environmental Buzz & Discourses
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Curated updates, weekly challenges, and member-submitted knowledge & questions.
            </p>
          </div>

          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{showSubmitForm ? "Close Form" : "Write a Topic / Question"}</span>
          </button>
        </div>

        {toastMsg && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg("")} className="text-emerald-700 hover:text-emerald-900 font-bold px-2">✕</button>
          </div>
        )}

        {showSubmitForm && (
          <div className="mb-12 bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-xl">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" /> Share Knowledge, History, News or Pose a Question
            </h3>
            <form onSubmit={handlePostTopic} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Debate">Weekly Debate</option>
                    <option value="Kenya">Kenya Conservation Frontline</option>
                    <option value="Global">Global Dispatch</option>
                    <option value="Knowledge">Historical Fact / New Knowledge</option>
                    <option value="Question">Community Question</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Topic Headline</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. The ecological history of Mau Forest..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Detailed Prompt / Question</label>
                <textarea
                  rows={3}
                  required
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Provide background info, context, or your question..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={submittingTopic}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
              >
                {submittingTopic ? "Submitting..." : "Submit Topic"}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between min-h-[460px]">
            {primaryDebate ? (
              <>
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                        <MessageSquareQuote className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">Meeting Topic of the Week</h3>
                        <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
                          {primaryDebate.category} Spotlight
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      <Flame className="h-3.5 w-3.5 text-orange-600" />
                      Active Debate
                    </span>
                  </div>

                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    "{primaryDebate.title}"
                  </h4>

                  <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                      Core Floor Question / Context {primaryDebate.authorName ? `(Posted by ${primaryDebate.authorName})` : ""}:
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                      {primaryDebate.prompt}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span>{primaryDebate.meetingInfo || "This Wednesday • 4:00 PM • Resource Centre Hall"}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60 self-start sm:self-auto">
                    Open Floor Discussions
                  </span>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400 text-sm">
                No active debate topic found.
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between relative overflow-hidden min-h-[460px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Award className="h-44 w-44 text-white" />
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-sm tracking-wide">Weekly Challenge Quiz</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md">
                  <Sparkles className="h-3 w-3" /> Awarded in Meeting
                </span>
              </div>

              <p className="text-xs text-emerald-200 font-medium uppercase tracking-wider mb-2">
                {currentQuiz.weekNumber} Question
              </p>
              <h4 className="text-sm sm:text-base font-bold text-white mb-4 leading-snug">
                {currentQuiz.question}
              </h4>

              <div className="space-y-2.5">
                {currentQuiz.options?.map((opt, idx) => {
                  let buttonStyle = "bg-white/10 hover:bg-white/20 border-white/10 text-emerald-50";

                  if (isSubmitted) {
                    if (idx === currentQuiz.correctIndex) {
                      buttonStyle = "bg-emerald-500 text-white border-emerald-400 font-bold";
                    } else if (idx === selectedAnswer) {
                      buttonStyle = "bg-rose-600/80 text-white border-rose-400";
                    } else {
                      buttonStyle = "bg-white/5 opacity-50 border-transparent text-emerald-200";
                    }
                  } else if (selectedAnswer === idx) {
                    buttonStyle = "bg-emerald-600 text-white border-emerald-400 font-semibold";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${buttonStyle}`}
                    >
                      <span>{opt}</span>
                      {isSubmitted && idx === currentQuiz.correctIndex && (
                        <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0 ml-2" />
                      )}
                      {isSubmitted && idx === selectedAnswer && idx !== currentQuiz.correctIndex && (
                        <XCircle className="h-4 w-4 text-white flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/10 text-xs text-emerald-100">
                  <p className="font-bold text-white mb-1">
                    {selectedAnswer === currentQuiz.correctIndex ? "Correct Answer!" : "Not quite right!"}
                  </p>
                  <p>{currentQuiz.explanation}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-800/80 flex items-center justify-between">
              <span className="text-[11px] text-emerald-300">
                Top responders acknowledged weekly
              </span>
              {!isSubmitted ? (
                <button
                  type="button"
                  disabled={selectedAnswer === null}
                  onClick={handleQuizSubmit}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition disabled:opacity-40"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedAnswer(null);
                  }}
                  className="text-xs text-emerald-300 hover:underline"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-emerald-700" />
                <h3 className="text-xl font-bold text-slate-900">Conservation Headlines & Discussion Stream</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Frontline topics, historical facts, and community questions. Like and comment on dispatches.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
              Live Feed
            </span>
          </div>

          {newsAndDispatches.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No additional dispatches currently in the feed.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {newsAndDispatches.map((article) => (
                <div
                  key={article.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/85 hover:border-emerald-300 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        article.category === "Kenya" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : article.category === "Debate"
                          ? "bg-amber-100 text-amber-800"
                          : article.category === "Knowledge"
                          ? "bg-purple-100 text-purple-800"
                          : article.category === "Question"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {article.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {article.authorName ? `By ${article.authorName}` : article.meetingInfo}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition leading-snug">
                      {article.title}
                    </h4>
                    
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {article.prompt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReaction(article.id, article.likes || 0, "likes")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition shadow-xs"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{article.likes || 0}</span>
                      </button>
                      <button
                        onClick={() => handleReaction(article.id, article.dislikes || 0, "dislikes")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition shadow-xs"
                      >
                        <ThumbsDown className="h-3 w-3" />
                        <span>{article.dislikes || 0}</span>
                      </button>
                      <span className="text-[11px] text-slate-500 ml-auto flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {article.comments?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {article.comments?.map((c: any, cIdx: number) => (
                        <div key={cIdx} className="p-2 rounded-xl bg-white border border-slate-200 text-[11px]">
                          <span className="font-bold text-emerald-800">{c.userName}: </span>
                          <span className="text-slate-600">{c.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInputs[article.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [article.id]: e.target.value })}
                        className="flex-1 p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleAddComment(article.id)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
