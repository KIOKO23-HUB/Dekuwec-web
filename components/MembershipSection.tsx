// components/MembershipSection.tsx
"use client";

import { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { 
  Users, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Clock, 
  UploadCloud, 
  Plus, 
  CheckCircle2, 
  BookOpen, 
  GraduationCap,
  Activity,
  Trash2,
  AlertCircle
} from "lucide-react";

// The official pre-registered 64 members
const OFFICIAL_MEMBERS = [
  "Edith Asachita", "Neema Kimutai", "Trecy Kipchoge", "Orville Awour", "Margaret Karongo", 
  "Samuel Ndicu", "Phillip Theuri", "Mercy Njoki", "Joyline Selim", "Babra Cherop", 
  "Clinton Kiptoo", "Charles Nderitu", "Amanda Matata", "Lincoln Mureithi", "Daniel Smith", 
  "John Muchai", "Claire Njeri", "Sophia Kinyua", "Elijah Isaac", "Kelvin Maina", 
  "Michael Kiborom", "Victor Mbau", "Manasse koech", "Curtis kioko", "Hannah Macharia", 
  "Keith Bundi", "Victoria Cherotich", "Eoudiah Kiptoon", "Elizabeth Nduli", "Harrison Kimwaki", 
  "George kimani", "Hazeline okendo", "John Wamui", "Emmanuel Muron", "Patricia Lenanyangera", 
  "Bonface Njogu", "Nedi kavwaiza", "Zac", "Abigael Chebet", "Ian Wambua", "Peter Komen", 
  "Grace Chebet", "Andrew Sawe", "Elijah mutua", "Robert Nderitu", "Mercy mutheu", 
  "Winnie njeri", "Regina", "Annabel Odege", "Leonidah kiboror", "Lewis Njuguna", 
  "Bett Kimutai", "Jael Oketch", "Elvis Muyai", "Maureen Chepngeno", "Leonidas Mbogo", 
  "Jael Oketch", "Titus kibos", "Hezron Pkemoi", "Felistas kome", "Lodio josephat", 
  "Celestine kiptoo", "Tom alando", "Lennis gitau"
];

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  course: string;
  year: string;
  status: "Approved" | "Pending";
  activities: string[];
}

export default function MembershipSection() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [liveApprovedMembers, setLiveApprovedMembers] = useState<UserProfile[]>([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState<"directory" | "profile">("directory");
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newActivity, setNewActivity] = useState("");

  // Profile Form States
  const [editCourse, setEditCourse] = useState("");
  const [editYear, setEditYear] = useState("");

  // 1. Listen for Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document in Firestore
        const userRef = doc(db, "members", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setEditCourse(data.course || "");
          setEditYear(data.year || "");
        } else {
          // First-time login: Create pending profile
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || "New Member",
            email: currentUser.email || "",
            photoURL: currentUser.photoURL || "",
            course: "",
            year: "",
            status: "Pending", // Requires admin approval to show on board
            activities: [],
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
        }
        setActiveTab("profile");
      } else {
        setProfile(null);
        setActiveTab("directory");
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Live Approved Members from Firestore
  useEffect(() => {
    const q = query(collection(db, "members"), where("status", "==", "Approved"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const approved = snapshot.docs.map((d) => d.data() as UserProfile);
      setLiveApprovedMembers(approved);
    });
    return () => unsubscribe();
  }, []);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab("directory");
  };

  // Profile Actions
  const handleUpdateProfile = async () => {
    if (!user || !profile) return;
    setIsUpdating(true);
    try {
      const userRef = doc(db, "members", user.uid);
      await updateDoc(userRef, {
        course: editCourse.trim(),
        year: editYear.trim(),
      });
      setProfile({ ...profile, course: editCourse.trim(), year: editYear.trim() });
    } catch (err) {
      console.error("Failed to update profile", err);
    }
    setIsUpdating(false);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !newActivity.trim()) return;
    try {
      const userRef = doc(db, "members", user.uid);
      const updatedActivities = [...profile.activities, newActivity.trim()];
      await updateDoc(userRef, { activities: updatedActivities });
      setProfile({ ...profile, activities: updatedActivities });
      setNewActivity("");
    } catch (err) {
      console.error("Failed to add activity", err);
    }
  };

  const handleDeleteActivity = async (idxToDelete: number) => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, "members", user.uid);
      const updatedActivities = profile.activities.filter((_, idx) => idx !== idxToDelete);
      await updateDoc(userRef, { activities: updatedActivities });
      setProfile({ ...profile, activities: updatedActivities });
    } catch (err) {
      console.error("Failed to delete activity", err);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user || !profile) return;
    setUploadingImage(true);
    try {
      const fileRef = ref(storage, `member_avatars/${user.uid}_${Date.now()}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => console.error("Upload error", error),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const userRef = doc(db, "members", user.uid);
          await updateDoc(userRef, { photoURL: downloadUrl });
          setProfile({ ...profile, photoURL: downloadUrl });
          setUploadingImage(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingImage(false);
    }
  };

  return (
    <section id="membership-section" className="py-14 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200">
              <Users className="h-3.5 w-3.5 text-emerald-700" />
              Club Registry
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Membership Portal
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
              Access the official registry of DEKUWEC students, log your environmental activities, and manage your membership profile.
            </p>
          </div>

          <div className="flex bg-slate-200/80 p-1.5 rounded-2xl flex-shrink-0">
            <button
              onClick={() => setActiveTab("directory")}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition ${
                activeTab === "directory" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4" />
              Public Board
            </button>
            <button
              onClick={() => {
                if (!user) handleGoogleLogin();
                else setActiveTab("profile");
              }}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition ${
                activeTab === "profile" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              {user ? "My Profile" : "Login / Join"}
            </button>
          </div>
        </div>

        {/* ======================= TAB: PUBLIC DIRECTORY ======================= */}
        {activeTab === "directory" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-emerald-950 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Official Membership Board
                </h3>
                <p className="text-emerald-200 text-xs sm:text-sm mt-1">
                  Registered participants for the academic year.
                </p>
              </div>
              <div className="bg-emerald-900/60 border border-emerald-700/50 px-4 py-2 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-widest">Total Roster</p>
                <p className="text-2xl font-black">{OFFICIAL_MEMBERS.length + liveApprovedMembers.length}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                
                {/* Dynamically Approved Firebase Members */}
                {liveApprovedMembers.map((member) => (
                  <div key={member.uid} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50 transition group">
                    {member.photoURL ? (
                      <img src={member.photoURL} alt={member.displayName} className="h-10 w-10 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {member.displayName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate group-hover:text-emerald-700 transition">
                        {member.displayName}
                      </p>
                      {member.course && (
                        <p className="text-[10px] text-slate-500 truncate">{member.course}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Legacy Official Array Members */}
                {OFFICIAL_MEMBERS.map((name, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50 transition group">
                    <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                      {name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate group-hover:text-emerald-700 transition">
                        {name}
                      </p>
                      <p className="text-[10px] text-slate-400">Registered</p>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: PERSONAL PROFILE ======================= */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto">
            {!user || !profile ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Student Login Required</h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto mb-8 text-sm">
                  Sign in using your Google account or university email to view your status, update records, and log activities.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition"
                >
                  Continue with Google
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6">
                    <button onClick={handleLogout} className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1.5 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg transition">
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 mt-6 sm:mt-0">
                    
                    {/* Avatar Upload */}
                    <div className="relative group">
                      <div className="h-28 w-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 flex-shrink-0">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-emerald-100 text-emerald-700 text-3xl font-black">
                            {profile.displayName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity backdrop-blur-xs">
                        <UploadCloud className="h-6 w-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase">{uploadingImage ? "Wait..." : "Upload"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }} />
                      </label>
                    </div>

                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-2xl font-black text-slate-900">{profile.displayName}</h3>
                      <p className="text-sm text-slate-500 font-medium">{profile.email}</p>
                      
                      <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                        {profile.status === "Approved" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approved Member
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="h-3.5 w-3.5" /> Pending Admin Approval
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Academic Details Form */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                    <h4 className="font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <GraduationCap className="h-5 w-5 text-emerald-600" />
                      Academic Profile
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Course / Degree</label>
                        <div className="relative">
                          <BookOpen className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={editCourse}
                            onChange={(e) => setEditCourse(e.target.value)}
                            placeholder="e.g. B.Sc. Mechanical Engineering"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Year of Study</label>
                        <select
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        >
                          <option value="">Select Year...</option>
                          <option value="Year 1">Year 1</option>
                          <option value="Year 2">Year 2</option>
                          <option value="Year 3">Year 3</option>
                          <option value="Year 4">Year 4</option>
                          <option value="Year 5">Year 5</option>
                        </select>
                      </div>

                      <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                        className="w-full py-3 mt-2 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition flex justify-center"
                      >
                        {isUpdating ? "Saving..." : "Save Details"}
                      </button>
                    </div>
                  </div>

                  {/* Activity Log Form */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col">
                    <h4 className="font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      My Event Log
                    </h4>

                    <form onSubmit={handleAddActivity} className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        placeholder="e.g. Aberdare Hike, Tree Planting..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button type="submit" className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 rounded-xl transition">
                        <Plus className="h-5 w-5" />
                      </button>
                    </form>

                    <div className="flex-1 overflow-y-auto max-h-[200px] pr-1 space-y-2">
                      {profile.activities.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center">
                          <AlertCircle className="h-6 w-6 mb-2 opacity-50" />
                          No activities logged yet.
                        </div>
                      ) : (
                        profile.activities.map((act, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                            <span className="text-sm font-medium text-slate-700">{act}</span>
                            <button
                              onClick={() => handleDeleteActivity(idx)}
                              className="text-slate-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
