// components/EcoPulseSection.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
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
  Sparkles
} from "lucide-react";

interface FeedItem {
  id: string;
  category: "Kenya" | "Global" | "Campus" | "Debate";
  title: string;
  prompt: string;
  meetingInfo: string;
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

// Default fallback quiz if Firestore hasn't been populated yet
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
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem>(DEFAULT_QUIZ);
  
  // Weekly Quiz State
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // 1. Stream all active discussions and news updates in real-time
    const qFeed = query(collection(db, "discussions_feed"), orderBy("createdAt", "desc"));
    const unsubFeed = onSnapshot(qFeed, (snapshot) => {
      if (!snapshot.empty) {
        const liveItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FeedItem[];
        setFeedItems(liveItems);
      } else {
        // Sample baseline if empty
        setFeedItems([
          {
            id: "default-debate",
            category: "Debate",
            title: "Carbon Credit Markets: Genuine Climate Solution or Corporate Greenwashing?",
            prompt: "As Kenya positions itself as an African carbon trading hub, do forest carbon projects equitably benefit surrounding indigenous communities and grassroots conservationists, or do they primarily serve foreign industrial emitters?",
            meetingInfo: "Wednesday • 4:00 PM • Resource Centre Hall",
          },
          {
            id: "default-kenya",
            category: "Kenya",
            title: "Aberdare Forest Canopy Restorations Accelerate Ahead of Rains",
            prompt: "New community seed nurseries along the Nyeri buffer zone report milestone yields of indigenous saplings to shield water towers.",
            meetingInfo: "Frontline Update",
          },
          {
            id: "default-global",
            category: "Global",
            title: "Global Treaty Advances Strict Limits on Single-Use Plastic Production",
            prompt: "UN negotiators reach draft provisions enforcing producer accountability across emerging manufacturing corridors.",
            meetingInfo: "Global Dispatch",
          },
        ]);
      }
    });

    // 2. Stream latest weekly quiz
    const qQuiz = query(collection(db, "weekly_quizzes"), orderBy("createdAt", "desc"), limit(1));
    const unsubQuiz = onSnapshot(qQuiz, (snapshot) => {
      if (!snapshot.empty) {
        const quizDoc = snapshot.docs[0];
        setCurrentQuiz({
          id: quizDoc.id,
          ...quizDoc.data(),
        } as QuizItem);
        // Reset local answer selection if a new quiz is published
        setIsSubmitted(false);
        setSelectedAnswer(null);
      }
    });

    return () => {
      unsubFeed();
      unsubQuiz();
    };
  }, []);

  const handleQuizSubmit = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
    }
  };

  // Separate primary debate from news items
  const primaryDebate = feedItems.find((i) => i.category === "Debate") || feedItems[0];
  const newsAndDispatches = feedItems.filter((i) => i.id !== primaryDebate?.id);

  return (
    <section id="ecopulse-section" className="py-14 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200">
            <Radio className="h-3.5 w-3.5 text-emerald-700 animate-pulse" />
            EcoPulse Dispatch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Environmental Buzz & Discourses
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Curated updates by our Information Director, weekly challenges, and physical meeting debate topics.
          </p>
        </div>

        {/* Top Grid: Primary Meeting Debate & Weekly Quiz */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          
          {/* 1. Weekly Meeting Discussion Topic (7 cols) */}
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
                      Core Floor Question / Context:
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
                No active debate topic found. Add one from the Admin portal!
              </div>
            )}
          </div>

          {/* 2. Weekly Award Quiz (5 cols) */}
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

              {/* Quiz Options */}
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

              {/* Feedback Explanation */}
              {isSubmitted && (
                <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/10 text-xs text-emerald-100 animate-in fade-in">
                  <p className="font-bold text-white mb-1">
                    {selectedAnswer === currentQuiz.correctIndex ? "Correct Answer!" : "Not quite right!"}
                  </p>
                  <p>{currentQuiz.explanation}</p>
                </div>
              )}
            </div>

            {/* Submit CTA */}
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

        {/* 3. Ongoing Multi-Item News & Topic Feed Stream */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-emerald-700" />
                <h3 className="text-xl font-bold text-slate-900">Conservation Headlines & Discussion Stream</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Frontline topics and dispatches updated live by the Information Director.
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
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        article.category === "Kenya" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : article.category === "Debate"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {article.category}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {article.meetingInfo}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition leading-snug">
                      {article.title}
                    </h4>
                    
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {article.prompt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center text-emerald-700 text-xs font-semibold gap-1 group-hover:gap-1.5 transition-all">
                    <span>Meeting discussion ready</span>
                    <ArrowRight className="h-3 w-3" />
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
