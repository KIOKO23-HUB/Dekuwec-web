// components/NotificationsTab.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Bell, Calendar } from "lucide-react";

export default function NotificationsTab() {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  useEffect(() => {
    const qBroadcasts = query(collection(db, "site_notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(qBroadcasts, (snapshot) => {
      setBroadcasts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-white">Global Notifications</h1>
        <p className="text-xs text-slate-400 mt-1">Official club broadcasts, urgent alerts, and updates sent to all members.</p>
      </div>

      {broadcasts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
          <Bell className="h-8 w-8 mx-auto text-slate-600" />
          <p className="text-xs">No global notifications posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((n) => (
            <div key={n.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-emerald-400" /> {n.title}
                </h3>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {n.createdAt ? new Date(n.createdAt?.toDate?.() || n.createdAt).toLocaleString() : "Recent"}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
              {n.imageUrl && (
                <div className="h-48 rounded-2xl overflow-hidden border border-slate-800 mt-3">
                  <img src={n.imageUrl} alt="Attachment" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
