"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Project {
  id: string;
  title?: string;
  description?: string;
  category?: string; // 'Images', 'Videos', 'Concept Art', 'Music'
  mediaUrl?: string; // URL for image, video, or audio
  coverArtUrl?: string; // URL for audio cover art
  mediaType?: "image" | "video" | "audio";
  promptUsed?: string;
  toolUsed?: string;
  tags?: string;
  date?: string;
}

interface Profile {
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  email?: string;
  instagram?: string;
  twitter?: string;
  portraitImage?: string;
  tools?: string;
}

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [adminTab, setAdminTab] = useState<"profile" | "project">("project");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile>({
    name: "Aura AI",
    title: "AI VISUAL",
    subtitle: "DIRECTOR",
    description: "Exploring the latent space. Crafting hyper-realistic images and cinematic videos through advanced prompt engineering and generative models.",
    email: "create@example.com",
    portraitImage: "",
    tools: "Midjourney v6, Runway Gen-2, Stable Diffusion XL, Pika Labs",
  });

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Form states for Projects
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("Images");
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [formCoverArtUrl, setFormCoverArtUrl] = useState("");
  const [formMediaType, setFormMediaType] = useState<"image" | "video" | "audio">("image");
  const [formPromptUsed, setFormPromptUsed] = useState("");
  const [formToolUsed, setFormToolUsed] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formDate, setFormDate] = useState("");
  
  const [mediaMode, setMediaMode] = useState<"url" | "upload">("url");
  const [coverArtMode, setCoverArtMode] = useState<"url" | "upload">("url");

  // Form states for Profile
  const [editProfile, setEditProfile] = useState<Profile>(profile);
  const [profileImageMode, setProfileImageMode] = useState<"url" | "upload">("url");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, profileRes] = await Promise.all([fetch("/api/projects"), fetch("/api/profile")]);

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(Array.isArray(data) ? data : []);
        }
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data && Object.keys(data).length > 0) {
            setProfile(data);
            setEditProfile(data);
          }
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Keep under 5MB for database performance.");
        return;
      }
      const base64 = await convertToBase64(file);
      setter(base64);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "LAZARUS") {
      setIsAdmin(true);
      setShowLogin(false);
    }
    setPasswordInput("");
  };

  const handleLogout = () => {
    setIsAdmin(false);
    cancelEdit();
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      title: formTitle,
      description: formDesc,
      category: formCategory,
      mediaUrl: formMediaUrl,
      coverArtUrl: formMediaType === "audio" ? formCoverArtUrl : "",
      mediaType: formMediaType,
      promptUsed: formPromptUsed,
      toolUsed: formToolUsed,
      tags: formTags,
      date: formDate,
    };

    try {
      const method = editingProjectId ? "PUT" : "POST";
      const body = editingProjectId ? { id: editingProjectId, ...projectData } : projectData;

      const response = await fetch("/api/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingProjectId) {
          setProjects(projects.map((p) => (p.id === editingProjectId ? data.project : p)));
        } else {
          setProjects([...projects, data.project]);
        }
        cancelEdit();
      } else {
        alert("Failed to save project.");
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const startEditProject = (project: Project) => {
    setAdminTab("project");
    setEditingProjectId(project.id);
    setFormTitle(project.title || "");
    setFormDesc(project.description || "");
    setFormCategory(project.category || "Images");
    setFormMediaUrl(project.mediaUrl || "");
    setFormCoverArtUrl(project.coverArtUrl || "");
    setFormMediaType(project.mediaType || "image");
    setFormPromptUsed(project.promptUsed || "");
    setFormToolUsed(project.toolUsed || "");
    setFormTags(project.tags || "");
    setFormDate(project.date || "");
    
    setMediaMode(project.mediaUrl?.startsWith("data:") ? "upload" : "url");
    setCoverArtMode(project.coverArtUrl?.startsWith("data:") ? "upload" : "url");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setFormTitle("");
    setFormDesc("");
    setFormCategory("Images");
    setFormMediaUrl("");
    setFormCoverArtUrl("");
    setFormMediaType("image");
    setFormPromptUsed("");
    setFormToolUsed("");
    setFormTags("");
    setFormDate("");
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      const response = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectToDelete }),
      });
      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectToDelete));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setProjectToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProfile),
      });
      if (response.ok) {
        setProfile(editProfile);
        alert("Profile updated!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const categories = ["All", "Images", "Videos", "Concept Art", "Music"];
  const filteredProjects = activeFilter === "All" ? projects : projects.filter((p) => p.category === activeFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-fuchsia-500 selection:text-white pb-24">
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
            <p className="text-zinc-400 text-sm mb-6">Are you sure you want to delete this creation? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => { setDeleteModalOpen(false); setProjectToDelete(null); }} className="px-4 py-2 text-sm font-bold text-zinc-300 hover:text-white transition">
                Cancel
              </button>
              <button onClick={confirmDeleteProject} className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-zinc-900 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold tracking-[0.2em] text-fuchsia-500 uppercase">{profile.name || "AI.STUDIO"}</div>

        <div className="flex items-center gap-4">
          {!isAdmin ? (
            <div className="flex items-center gap-2">
              {showLogin && (
                <form onSubmit={handleLogin} className="flex">
                  <input type="password" autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="bg-transparent border-b border-zinc-700 text-sm px-2 py-1 focus:outline-none focus:border-fuchsia-500 transition w-32" />
                  <button type="submit" className="text-zinc-500 hover:text-fuchsia-500 px-2">
                    Go
                  </button>
                </form>
              )}
              <button onClick={() => setShowLogin(!showLogin)} className="text-zinc-600 hover:text-zinc-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="text-xs border border-fuchsia-500 text-fuchsia-500 px-4 py-2 rounded-full hover:bg-fuchsia-500 hover:text-white transition">
              Lock Editor
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* HERO SECTION */}
        <section className="flex flex-col md:flex-row items-center justify-between mb-24 gap-12">
          {isLoading ? (
            <div className="w-full md:w-1/2 space-y-6 animate-pulse">
              <div className="h-20 w-3/4 bg-zinc-900 rounded"></div>
              <div className="h-4 w-1/2 bg-zinc-900 rounded"></div>
            </div>
          ) : (
            <div className="w-full md:w-1/2 space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600 tracking-tighter">
                {profile.title} <br />
                <span className="text-zinc-100 font-serif italic font-light">{profile.subtitle}</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">{profile.description}</p>

              <div className="flex flex-wrap gap-2 pt-2">
                {profile.tools?.split(",").map((tool, i) => (
                  <span key={i} className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1 text-fuchsia-400 rounded-full">
                    {tool.trim()}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 pt-6">
                {profile.instagram && (
                  <a href={profile.instagram} className="text-zinc-500 hover:text-fuchsia-500 transition-colors uppercase tracking-widest text-xs font-bold">
                    Instagram
                  </a>
                )}
                {profile.twitter && (
                  <a href={profile.twitter} className="text-zinc-500 hover:text-fuchsia-500 transition-colors uppercase tracking-widest text-xs font-bold">
                    Twitter/X
                  </a>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="text-zinc-500 hover:text-fuchsia-500 transition-colors uppercase tracking-widest text-xs font-bold">
                    Contact
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            {isLoading ? <div className="w-72 h-72 bg-zinc-900 rounded-2xl animate-pulse"></div> : <div className="w-72 h-72 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 relative z-10 shadow-2xl">{profile.portraitImage ? <Image src={profile.portraitImage} alt="Profile" fill className="object-cover" /> : <div className="flex items-center justify-center h-full text-zinc-700 text-sm">Add Portrait</div>}</div>}
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <h2 className="text-3xl font-light">
              <span className="font-bold text-white">GENERATIVE</span> GALLERY
            </h2>

            {/* Filtering Navigation */}
            <div className="flex flex-wrap gap-2 bg-zinc-900/50 p-1 rounded-full border border-zinc-800 w-full md:w-auto">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 md:px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex-1 md:flex-none ${activeFilter === cat ? "bg-fuchsia-600 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-zinc-600">Loading generative art...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-32 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">Gallery is empty.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
              {filteredProjects.map((project) => (
                <div key={project.id} className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-fuchsia-500/50 transition-all duration-500 flex flex-col">
                  {/* Media Area */}
                  {project.mediaUrl && (
                    <div className="w-full aspect-[4/3] bg-black relative overflow-hidden flex flex-col">
                      {project.mediaType === "video" ? (
                        <video src={project.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : project.mediaType === "audio" ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-end">
                           {project.coverArtUrl ? (
                             <Image src={project.coverArtUrl} alt={project.title || "Cover Art"} fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                           ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-zinc-700 text-xs">No Cover Art</div>
                           )}
                           <div className="z-10 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                             <audio src={project.mediaUrl} controls className="w-full h-10 outline-none rounded-full" />
                           </div>
                        </div>
                      ) : (
                        <Image src={project.mediaUrl} alt={project.title || "AI Art"} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      )}
                      <span className="absolute top-3 right-3 text-[10px] bg-black/60 px-3 py-1 text-zinc-300 rounded-full uppercase tracking-widest backdrop-blur-md z-20">{project.category}</span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{project.title || "Untitled"}</h3>
                      {project.toolUsed && <span className="text-[10px] text-fuchsia-400 bg-fuchsia-500/10 px-2 py-1 rounded border border-fuchsia-500/20">{project.toolUsed}</span>}
                    </div>

                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                    {/* AI Prompt Section */}
                    {project.promptUsed && (
                      <div className="mb-4 bg-black/50 p-3 rounded-lg border border-zinc-800/50">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Prompt</p>
                        <p className="text-xs text-zinc-300 font-mono line-clamp-3">{project.promptUsed}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                      {project.tags?.split(",").map(
                        (tag, i) =>
                          tag.trim() && (
                            <span key={i} className="text-[10px] text-zinc-500 uppercase">
                              #{tag.trim()}
                            </span>
                          )
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="absolute top-3 left-3 flex gap-2 z-30">
                      <button onClick={() => startEditProject(project)} className="bg-white text-black p-2 rounded-full shadow hover:bg-zinc-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteClick(project.id)} className="bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ADMIN WORKSPACE */}
        {isAdmin && (
          <div className="mt-32 pt-10 border-t border-zinc-800 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950 px-4 text-xs font-bold text-fuchsia-500 tracking-widest uppercase">Admin Area</div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
              <button onClick={() => setAdminTab("project")} className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${adminTab === "project" ? "bg-fuchsia-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}>
                Manage Media
              </button>
              <button onClick={() => setAdminTab("profile")} className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${adminTab === "profile" ? "bg-fuchsia-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}>
                Edit Profile
              </button>
            </div>

            {adminTab === "project" && (
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 rounded-2xl max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-white">{editingProjectId ? "Edit Creation" : "Upload New Creation"}</h2>
                <form onSubmit={handleSaveProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Title</label>
                    <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Category</label>
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition">
                      <option value="Images">Images</option>
                      <option value="Videos">Videos</option>
                      <option value="Concept Art">Concept Art</option>
                      <option value="Music">Music</option>
                    </select>
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Media Upload / Link</label>
                    <div className="flex flex-col md:flex-row gap-2">
                      <select value={formMediaType} onChange={(e) => setFormMediaType(e.target.value as "image" | "video" | "audio")} className="bg-black border border-zinc-800 p-3 text-white rounded-xl focus:outline-none">
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                      </select>
                      {mediaMode === "url" ? <input type="url" placeholder="https://..." value={formMediaUrl} onChange={(e) => setFormMediaUrl(e.target.value)} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" /> : <input type="file" accept="image/*,video/*,audio/*" onChange={(e) => handleFileUpload(e, setFormMediaUrl)} className="bg-black border border-zinc-800 p-2 text-zinc-400 w-full rounded-xl file:bg-fuchsia-600 file:text-white file:border-0 file:py-1 file:px-3 file:rounded-lg focus:outline-none" />}
                      <button type="button" onClick={() => setMediaMode(mediaMode === "url" ? "upload" : "url")} className="bg-zinc-800 px-4 py-3 md:py-0 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-700 whitespace-nowrap">
                        Toggle Mode
                      </button>
                    </div>
                  </div>

                  {formMediaType === "audio" && (
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">Cover Art Upload / Link</label>
                      <div className="flex flex-col md:flex-row gap-2">
                        {coverArtMode === "url" ? <input type="url" placeholder="https://..." value={formCoverArtUrl} onChange={(e) => setFormCoverArtUrl(e.target.value)} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" /> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setFormCoverArtUrl)} className="bg-black border border-zinc-800 p-2 text-zinc-400 w-full rounded-xl file:bg-fuchsia-600 file:text-white file:border-0 file:py-1 file:px-3 file:rounded-lg focus:outline-none" />}
                        <button type="button" onClick={() => setCoverArtMode(coverArtMode === "url" ? "upload" : "url")} className="bg-zinc-800 px-4 py-3 md:py-0 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-700 whitespace-nowrap">
                          Toggle Mode
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">AI Prompt Used</label>
                    <textarea value={formPromptUsed} onChange={(e) => setFormPromptUsed(e.target.value)} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition font-mono text-sm" rows={2} placeholder="/imagine prompt: ..."></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">AI Tool (e.g., Suno, Midjourney)</label>
                    <input type="text" value={formToolUsed} onChange={(e) => setFormToolUsed(e.target.value)} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Tags</label>
                    <input type="text" placeholder="synthwave, electronic, neon..." value={formTags} onChange={(e) => setFormTags(e.target.value)} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Description / Notes</label>
                    <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" rows={3}></textarea>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4 mt-4">
                    <button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg w-full md:w-auto text-center">
                      Save Media
                    </button>
                    {editingProjectId && (
                      <button type="button" onClick={cancelEdit} className="bg-zinc-800 text-white px-8 py-3 rounded-xl hover:bg-zinc-700 transition w-full md:w-auto text-center">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {adminTab === "profile" && (
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 rounded-2xl max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-white">Artist Profile</h2>
                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Alias / Name</label>
                    <input type="text" value={editProfile.name || ""} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Main Title</label>
                    <input type="text" value={editProfile.title || ""} onChange={(e) => setEditProfile({ ...editProfile, title: e.target.value })} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Subtitle</label>
                    <input type="text" value={editProfile.subtitle || ""} onChange={(e) => setEditProfile({ ...editProfile, subtitle: e.target.value })} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Contact Email</label>
                    <input type="email" value={editProfile.email || ""} onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Bio / Vision</label>
                    <textarea value={editProfile.description || ""} onChange={(e) => setEditProfile({ ...editProfile, description: e.target.value })} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" rows={3}></textarea>
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Primary Tools (Comma Separated)</label>
                    <input type="text" value={editProfile.tools || ""} onChange={(e) => setEditProfile({ ...editProfile, tools: e.target.value })} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Instagram URL</label>
                    <input type="url" value={editProfile.instagram || ""} onChange={(e) => setEditProfile({ ...editProfile, instagram: e.target.value })} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Twitter/X URL</label>
                    <input type="url" value={editProfile.twitter || ""} onChange={(e) => setEditProfile({ ...editProfile, twitter: e.target.value })} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Profile Portrait</label>
                    <div className="flex flex-col md:flex-row gap-2">
                      {profileImageMode === "url" ? <input type="url" placeholder="https://..." value={editProfile.portraitImage || ""} onChange={(e) => setEditProfile({ ...editProfile, portraitImage: e.target.value })} className="bg-black border border-zinc-800 p-3 text-white w-full rounded-xl focus:border-fuchsia-500 focus:outline-none transition" /> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (val) => setEditProfile({ ...editProfile, portraitImage: val }))} className="bg-black border border-zinc-800 p-2 text-zinc-400 w-full rounded-xl file:bg-fuchsia-600 file:text-white file:border-0 file:py-1 file:px-3 file:rounded-lg focus:outline-none" />}
                      <button type="button" onClick={() => setProfileImageMode(profileImageMode === "url" ? "upload" : "url")} className="bg-zinc-800 px-4 py-3 md:py-0 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-700 whitespace-nowrap">
                        Toggle Mode
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-4">
                    <button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg w-full md:w-auto text-center">
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
