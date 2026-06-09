"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutAdmin, updateSiteContent, seedSiteDatabase, fetchGithubRepoMetadata, uploadResumeAction, deleteResumeAction } from "@/lib/actions";
import { LogOut, Save, Database, Plus, Trash2, Check, AlertCircle, Upload, FileText } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";

type Props = {
  initialContent: Record<string, any>;
};

function CommaSeparatedInput({
  initialValues,
  onChange,
  className = "w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none",
  placeholder = "",
}: {
  initialValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (initialValues) {
      setValue(initialValues.join(", "));
    }
  }, [initialValues]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        const parsed = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        onChange(parsed);
      }}
      className={className}
      placeholder={placeholder}
    />
  );
}

export default function AdminDashboard({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState("Hero & About");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeDeleting, setResumeDeleting] = useState(false);
  const router = useRouter();

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;

    setResumeUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await uploadResumeAction(formData);
      if (res.success && res.url) {
        triggerToast("Resume uploaded successfully!");
        setContent((prev) => ({
          ...prev,
          resume: {
            url: res.url,
            filename: res.filename || resumeFile.name,
            uploadedAt: new Date().toISOString(),
          },
        }));
        setResumeFile(null);
        const fileInput = document.getElementById("resume-file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        triggerToast(res.error || "Failed to upload resume", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "An error occurred during upload", "error");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!confirm("Are you sure you want to revert to the default resume? This will delete the uploaded file from database and storage.")) {
      return;
    }

    setResumeDeleting(true);
    try {
      const res = await deleteResumeAction();
      if (res.success) {
        triggerToast("Custom resume deleted. Reverted to default.");
        setContent((prev) => {
          const next = { ...prev };
          delete next.resume;
          return next;
        });
      } else {
        triggerToast(res.error || "Failed to delete resume", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "An error occurred during deletion", "error");
    } finally {
      setResumeDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/admin/login");
    router.refresh();
  };

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async (key: string) => {
    setLoading(key);
    try {
      const result = await updateSiteContent(key, content[key]);
      if (result.success) {
        triggerToast(`Successfully saved ${key} section!`);
      } else {
        triggerToast(result.error || `Failed to save ${key}`, "error");
      }
    } catch (e) {
      triggerToast("An error occurred during save", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleSeed = async () => {
    setLoading("seed");
    try {
      const result = await seedSiteDatabase();
      if (result.success) {
        triggerToast(
          result.seededCount && result.seededCount > 0
            ? `Seeded ${result.seededCount} default sections in Supabase!`
            : "Database already fully seeded!"
        );
        router.refresh();
      } else {
        triggerToast(result.error || "Failed to seed database", "error");
      }
    } catch (e) {
      triggerToast("An error occurred during seeding", "error");
    } finally {
      setLoading(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // HERO & ABOUT MUTATORS
  // ─────────────────────────────────────────────────────────────
  const updateHero = (field: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const updateAbout = (field: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      about: { ...prev.about, [field]: value },
    }));
  };

  const updateAboutFact = (index: number, field: string, value: string) => {
    const updatedFacts = [...content.about.facts];
    updatedFacts[index] = { ...updatedFacts[index], [field]: value };
    updateAbout("facts", updatedFacts);
  };

  const updatePhilosophy = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        philosophy: { ...prev.about.philosophy, [field]: value },
      },
    }));
  };

  // ─────────────────────────────────────────────────────────────
  // SKILLS MUTATORS
  // ─────────────────────────────────────────────────────────────
  const updateSkillGroup = (groupIndex: number, skillIndex: number, field: string, value: any) => {
    const updatedGroups = [...content.skills.skillGroups];
    const updatedSkills = [...updatedGroups[groupIndex].skills];
    updatedSkills[skillIndex] = { ...updatedSkills[skillIndex], [field]: value };
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], skills: updatedSkills };
    setContent((prev) => ({
      ...prev,
      skills: { ...prev.skills, skillGroups: updatedGroups },
    }));
  };

  const addSkill = (groupIndex: number) => {
    const updatedGroups = [...content.skills.skillGroups];
    updatedGroups[groupIndex].skills.push({ name: "New Skill", level: 80 });
    setContent((prev) => ({
      ...prev,
      skills: { ...prev.skills, skillGroups: updatedGroups },
    }));
  };

  const deleteSkill = (groupIndex: number, skillIndex: number) => {
    const updatedGroups = [...content.skills.skillGroups];
    updatedGroups[groupIndex].skills.splice(skillIndex, 1);
    setContent((prev) => ({
      ...prev,
      skills: { ...prev.skills, skillGroups: updatedGroups },
    }));
  };

  // ─────────────────────────────────────────────────────────────
  // PROJECTS MUTATORS (CRUD)
  // ─────────────────────────────────────────────────────────────
  const updateProject = (index: number, field: string, value: any) => {
    const updatedProjects = [...content.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setContent((prev) => ({ ...prev, projects: updatedProjects }));
  };

  const addProject = () => {
    const newProject = {
      title: "New Project",
      description: "Project Description goes here.",
      tags: ["React", "TypeScript"],
      category: "SaaS",
      accent: "bg-citrus-400",
      link: "https://github.com",
      hasSecondaryLink: false,
      secondaryLink: "",
      liveLink: "",
      featured: false,
      year: new Date().getFullYear().toString(),
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    };
    setContent((prev) => ({ ...prev, projects: [newProject, ...prev.projects] }));
  };

  const deleteProject = (index: number) => {
    const updatedProjects = [...content.projects];
    updatedProjects.splice(index, 1);
    setContent((prev) => ({ ...prev, projects: updatedProjects }));
  };

  const handleAutoFill = async (index: number, url: string) => {
    if (!url) return;
    const key = `autofill-${index}`;
    setLoading(key);
    try {
      const res = await fetchGithubRepoMetadata(url);
      if (res.success && res.data) {
        const metadata = res.data;
        const updatedProjects = [...content.projects];
        updatedProjects[index] = {
          ...updatedProjects[index],
          title: metadata.title || updatedProjects[index].title,
          description: metadata.description || updatedProjects[index].description,
          tags: metadata.tags && metadata.tags.length > 0 ? metadata.tags : updatedProjects[index].tags,
          year: metadata.year || updatedProjects[index].year,
          category: metadata.category || updatedProjects[index].category,
          image: metadata.image || updatedProjects[index].image,
          _lastAutofilledLink: url,
        };
        setContent((prev) => ({ ...prev, projects: updatedProjects }));
        triggerToast("Successfully auto-filled project info from GitHub!");
      } else {
        triggerToast(res.error || "Failed to fetch repository metadata", "error");
      }
    } catch (e) {
      triggerToast("An error occurred during auto-fill", "error");
    } finally {
      setLoading(null);
    }
  };


  // ─────────────────────────────────────────────────────────────
  // EXPERIENCE MUTATORS (CRUD)
  // ─────────────────────────────────────────────────────────────
  const updateExperience = (index: number, field: string, value: any) => {
    const updatedExperience = [...content.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setContent((prev) => ({ ...prev, experience: updatedExperience }));
  };

  const addExperience = () => {
    const newJob = {
      role: "Software Engineer",
      company: "Company Name",
      period: `${new Date().getFullYear()} — Present`,
      type: "Full-time",
      description: "Responsibilities and achievements description.",
      highlights: ["React", "Node.js"],
      color: "bg-citrus-400",
      dot: "#E8890A",
      tag: "#C47208",
      tagBg: "#FEF3DC",
      project1Url: "",
      project2Url: "",
      project3Url: "",
      project4Url: "",
      project5Url: "",
    };
    setContent((prev) => ({ ...prev, experience: [newJob, ...prev.experience] }));
  };

  const deleteExperience = (index: number) => {
    const updatedExperience = [...content.experience];
    updatedExperience.splice(index, 1);
    setContent((prev) => ({ ...prev, experience: updatedExperience }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-[220px] pb-12">
      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-cream-200 mb-10">
        <div>
          <span className="font-mono text-xs text-citrus-500 tracking-widest uppercase block mb-1">
            Admin Area
          </span>
          <h1 className="font-display text-4xl font-bold text-ink-900">
            Portfolio Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={loading !== null}
            className="flex items-center gap-2 bg-cream-50 hover:bg-cream-200 border border-cream-200 px-4 py-2.5 rounded-full text-xs font-mono font-medium transition-all"
            title="Seeds default local assets to database if table is empty"
          >
            <Database className="w-3.5 h-3.5" />
            Seed Database
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-full text-xs font-mono font-medium transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* ── TABS NAVIGATION ── */}
      <nav className="flex flex-nowrap gap-2 overflow-x-auto pb-4 border-b border-cream-200/50 mb-8">
        {["Hero & About", "Skills", "Projects", "Experience"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-ink-900 text-cream-50"
                : "bg-cream-50 text-ink-600 hover:bg-cream-200 border border-cream-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* ── MAIN TABS CONTENT ── */}
      <div className="space-y-8">
        {/* 1. HERO & ABOUT TAB */}
        {activeTab === "Hero & About" && (
          <div className="space-y-8">
            {/* Hero section editor */}
            <div className="bg-cream-50 border border-cream-200 rounded-3xl p-4 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-6 border-b border-cream-200 mb-6">
                <h2 className="font-display text-xl font-bold">Hero Section</h2>
                <button
                  onClick={() => handleSave("hero")}
                  disabled={loading !== null}
                  className="flex items-center gap-2 bg-ink-900 text-cream-50 hover:bg-citrus-500 hover:text-ink-900 text-xs px-4 py-2 rounded-full font-semibold transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {loading === "hero" ? "Saving..." : "Save Hero"}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-ink-600 mb-2">First Name</label>
                  <input
                    type="text"
                    value={content.hero.name || ""}
                    onChange={(e) => updateHero("name", e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-ink-600 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={content.hero.lastName || ""}
                    onChange={(e) => updateHero("lastName", e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-ink-600 mb-2">Badge Text</label>
                  <input
                    type="text"
                    value={content.hero.badgeText || ""}
                    onChange={(e) => updateHero("badgeText", e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-ink-600 mb-2">Roles (comma-separated)</label>
                  <CommaSeparatedInput
                    initialValues={content.hero.roles || []}
                    onChange={(vals) => updateHero("roles", vals)}
                    className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-4 py-2.5 text-sm outline-none"
                    placeholder="Full-Stack Developer, UI/UX Designer"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-ink-600 mb-2">Bio Description</label>
                  <textarea
                    rows={3}
                    value={content.hero.bio || ""}
                    onChange={(e) => updateHero("bio", e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl p-4 text-sm outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* About section editor */}
            <div className="bg-cream-50 border border-cream-200 rounded-3xl p-4 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-6 border-b border-cream-200 mb-6">
                <h2 className="font-display text-xl font-bold">About Section</h2>
                <button
                  onClick={() => handleSave("about")}
                  disabled={loading !== null}
                  className="flex items-center gap-2 bg-ink-900 text-cream-50 hover:bg-citrus-500 hover:text-ink-900 text-xs px-4 py-2 rounded-full font-semibold transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {loading === "about" ? "Saving..." : "Save About"}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-ink-600 mb-2">Location</label>
                  <input
                    type="text"
                    value={content.about.location || ""}
                    onChange={(e) => updateAbout("location", e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-ink-600 mb-2">Bio Paragraphs</label>
                  {content.about.bioParagraphs &&
                    content.about.bioParagraphs.map((para: string, idx: number) => (
                      <div key={idx} className="mb-3">
                        <textarea
                          rows={3}
                          value={para}
                          onChange={(e) => {
                            const copy = [...content.about.bioParagraphs];
                            copy[idx] = e.target.value;
                            updateAbout("bioParagraphs", copy);
                          }}
                          className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl p-4 text-sm outline-none resize-none"
                        />
                      </div>
                    ))}
                </div>

                {/* Facts grid */}
                <div>
                  <label className="block text-xs font-mono uppercase text-ink-600 mb-4">Quick Facts</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {content.about.facts &&
                      content.about.facts.map((fact: any, idx: number) => (
                        <div key={idx} className="bg-cream-50 border border-cream-200 rounded-2xl p-4 space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={fact.emoji || ""}
                              onChange={(e) => updateAboutFact(idx, "emoji", e.target.value)}
                              className="w-10 text-center bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-lg py-1 text-sm outline-none"
                              placeholder="Emoji"
                            />
                            <input
                              type="text"
                              value={fact.label || ""}
                              onChange={(e) => updateAboutFact(idx, "label", e.target.value)}
                              className="flex-1 bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-lg px-3 py-1 text-sm outline-none"
                              placeholder="Label"
                            />
                          </div>
                          <input
                            type="text"
                            value={fact.sub || ""}
                            onChange={(e) => updateAboutFact(idx, "sub", e.target.value)}
                            className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-lg px-3 py-1 text-xs outline-none"
                            placeholder="Sub-label (e.g. Berkeley, 2019)"
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Philosophy (terminal) */}
                <div className="border-t border-cream-200 pt-6">
                  <label className="block text-xs font-mono uppercase text-ink-600 mb-4">Code Terminal Philosophy</label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-ink-400 mb-1">Ship</label>
                      <input
                        type="text"
                        value={content.about.philosophy?.ship || ""}
                        onChange={(e) => updatePhilosophy("ship", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-4 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-400 mb-1">Code</label>
                      <input
                        type="text"
                        value={content.about.philosophy?.code || ""}
                        onChange={(e) => updatePhilosophy("code", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-4 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-400 mb-1">Users</label>
                      <input
                        type="text"
                        value={content.about.philosophy?.users || ""}
                        onChange={(e) => updatePhilosophy("users", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-4 py-2.5 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume upload editor */}
            <div className="bg-cream-50 border border-cream-200 rounded-3xl p-4 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-6 border-b border-cream-200 mb-6">
                <h2 className="font-display text-xl font-bold">Resume Management</h2>
                <span className="font-mono text-xs text-citrus-500 uppercase tracking-wider">
                  PDF or Word Document
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
                  <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 text-citrus-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-ink-900">Current Active Resume</h3>
                      {content.resume && content.resume.url ? (
                        <div className="mt-1">
                          <p className="text-xs text-ink-600 font-mono break-all">{content.resume.filename}</p>
                          <p className="text-[10px] text-ink-400 mt-0.5">
                            Uploaded on: {new Date(content.resume.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-ink-400 mt-1">
                          Using local default resume (<span className="font-mono">/public/resume.pdf</span>)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <a
                      href="/resume.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full border border-cream-200 hover:border-ink-800 text-ink-800 hover:text-ink-900 text-xs font-semibold font-mono transition-all cursor-none"
                    >
                      Preview Resume ↗
                    </a>
                    {content.resume && content.resume.url && (
                      <button
                        onClick={handleResumeDelete}
                        disabled={resumeDeleting}
                        className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 text-xs font-semibold transition-all cursor-none disabled:opacity-50"
                      >
                        {resumeDeleting ? "Reverting..." : "Revert to Default"}
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleResumeUpload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-ink-600 mb-2">
                      Upload New Resume (Max 5MB)
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        id="resume-file-input"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setResumeFile(file);
                        }}
                        className="flex-1 bg-cream-50 border border-cream-200 text-ink-900 rounded-xl px-4 py-2 text-sm outline-none cursor-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-citrus-500/10 file:text-citrus-600 hover:file:bg-citrus-500/20"
                      />
                      <button
                        type="submit"
                        disabled={!resumeFile || resumeUploading}
                        className="flex items-center justify-center gap-2 bg-ink-900 text-cream-50 hover:bg-citrus-500 hover:text-ink-900 disabled:opacity-40 disabled:hover:bg-ink-900 disabled:hover:text-cream-50 px-6 py-2 rounded-xl text-xs font-semibold transition-all cursor-none"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {resumeUploading ? "Uploading..." : "Upload File"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 2. SKILLS TAB */}
        {activeTab === "Skills" && (
          <div className="bg-cream-50 border border-cream-200 rounded-3xl p-4 sm:p-8 shadow-sm">
            <div className="sticky top-[64px] sm:top-[80px] z-30 bg-cream-50/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-cream-200 mb-6 pt-2">
              <h2 className="font-display text-xl font-bold">Skills Management</h2>
              <button
                onClick={() => handleSave("skills")}
                disabled={loading !== null}
                className="flex items-center gap-2 bg-ink-900 text-cream-50 hover:bg-citrus-500 hover:text-ink-900 text-xs px-4 py-2 rounded-full font-semibold transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {loading === "skills" ? "Saving..." : "Save Skills"}
              </button>
            </div>

            <div className="space-y-8">
              {/* Skill Categories */}
              {content.skills.skillGroups &&
                content.skills.skillGroups.map((group: any, groupIdx: number) => (
                  <div key={groupIdx} className="border border-cream-200 rounded-2xl p-4 sm:p-6 bg-cream-50">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-200/50">
                      <h3 className="font-display font-semibold text-ink-900">{group.category} Category</h3>
                      <button
                        onClick={() => addSkill(groupIdx)}
                        className="flex items-center gap-1.5 text-xs text-citrus-600 hover:text-citrus-500 font-mono"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Skill
                      </button>
                    </div>

                    <div className="space-y-4">
                      {group.skills.map((skill: any, skillIdx: number) => (
                        <div key={skillIdx} className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => updateSkillGroup(groupIdx, skillIdx, "name", e.target.value)}
                              className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-4 py-2 text-sm outline-none"
                              placeholder="Skill Name"
                            />
                          </div>
                          <div className="flex items-center gap-3 w-40">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={skill.level}
                              onChange={(e) =>
                                updateSkillGroup(groupIdx, skillIdx, "level", parseInt(e.target.value) || 0)
                              }
                              className="w-16 bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-2.5 py-2 text-sm text-center outline-none"
                            />
                            <span className="text-xs font-mono text-ink-400">% level</span>
                          </div>
                          <button
                            onClick={() => deleteSkill(groupIdx, skillIdx)}
                            className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl self-start md:self-auto transition-colors"
                            aria-label="Delete Skill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              {/* Tech pills section */}
              <div className="border-t border-cream-200 pt-6">
                <label className="block text-xs font-mono uppercase text-ink-600 mb-2">
                  Additional Tech Pills (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={content.skills.techPills ? content.skills.techPills.join(", ") : ""}
                  onChange={(e) =>
                    setContent((prev: any) => ({
                      ...prev,
                      skills: {
                        ...prev.skills,
                        techPills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      },
                    }))
                  }
                  className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl p-4 text-sm outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. PROJECTS TAB */}
        {activeTab === "Projects" && (
          <div className="bg-cream-50 border border-cream-200 rounded-3xl p-4 sm:p-8 shadow-sm">
            <div className="sticky top-[64px] sm:top-[80px] z-30 bg-cream-50/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-cream-200 mb-6 pt-2">
              <div>
                <h2 className="font-display text-xl font-bold">Projects List</h2>
                <p className="text-xs text-ink-400 mt-1 font-mono">{content.projects.length} Total Projects</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addProject}
                  className="flex items-center gap-1.5 bg-cream-50 hover:bg-cream-200 border border-cream-200 text-ink-900 text-xs px-4 py-2 rounded-full font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Project
                </button>
                <button
                  onClick={() => handleSave("projects")}
                  disabled={loading !== null}
                  className="flex items-center gap-2 bg-ink-900 text-cream-50 hover:bg-citrus-500 hover:text-ink-900 text-xs px-4 py-2 rounded-full font-semibold transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {loading === "projects" ? "Saving..." : "Save Projects"}
                </button>
              </div>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {content.projects.map((proj: any, idx: number) => (
                <div key={idx} className="bg-cream-50 border border-cream-200 rounded-2xl p-4 sm:p-6 relative">
                  <button
                    onClick={() => deleteProject(idx)}
                    className="absolute top-6 right-6 p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={proj.title || ""}
                        onChange={(e) => updateProject(idx, "title", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Category</label>
                      <select
                        value={proj.category || "Open Source"}
                        onChange={(e) => updateProject(idx, "category", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                      >
                        <option>Open Source</option>
                        <option>SaaS</option>
                        <option>Data</option>
                        <option>Tool</option>
                        <option>Mobile</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Year</label>
                      <input
                        type="text"
                        value={proj.year || ""}
                        onChange={(e) => updateProject(idx, "year", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-mono uppercase text-ink-400">GitHub / Live Link</label>
                        {proj.link && proj.link.includes("github.com") && (
                          <button
                            type="button"
                            onClick={() => handleAutoFill(idx, proj.link)}
                            disabled={loading === `autofill-${idx}`}
                            className="text-[9px] font-mono text-citrus-600 hover:text-citrus-500 font-semibold uppercase cursor-none"
                          >
                            {loading === `autofill-${idx}` ? "Extracting..." : "⚡ Auto-Fill Info"}
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={proj.link || ""}
                        onChange={(e) => updateProject(idx, "link", e.target.value)}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val && val.includes("github.com") && val !== proj._lastAutofilledLink) {
                            handleAutoFill(idx, val);
                          }
                        }}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                        placeholder="https://github.com/owner/repo"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Project Live Demo Link (Optional)</label>
                      <input
                        type="text"
                        value={proj.liveLink || ""}
                        onChange={(e) => updateProject(idx, "liveLink", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                        placeholder="https://myproject.com"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3 mt-1">
                      <label className="flex items-center gap-2 text-xs text-ink-800 font-mono">
                        <input
                          type="checkbox"
                          checked={!!proj.hasSecondaryLink}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const updatedProjects = [...content.projects];
                            updatedProjects[idx] = {
                              ...updatedProjects[idx],
                              hasSecondaryLink: checked,
                              secondaryLink: checked ? (updatedProjects[idx].secondaryLink || "") : "",
                            };
                            setContent((prev) => ({ ...prev, projects: updatedProjects }));
                          }}
                          className="w-4 h-4 rounded text-citrus-500 focus:ring-citrus-400"
                        />
                        Requires secondary GitHub repository?
                      </label>

                      {proj.hasSecondaryLink && (
                        <div className="pl-6 border-l-2 border-citrus-500/20 space-y-2">
                          <label className="block text-[10px] font-mono uppercase text-ink-400">Secondary GitHub Repository Link</label>
                          <input
                            type="text"
                            value={proj.secondaryLink || ""}
                            onChange={(e) => updateProject(idx, "secondaryLink", e.target.value)}
                            className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                            placeholder="https://github.com/owner/repo-secondary"
                          />
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={proj.image || ""}
                        onChange={(e) => updateProject(idx, "image", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Tags (comma-separated)</label>
                      <CommaSeparatedInput
                        initialValues={proj.tags || []}
                        onChange={(vals) => updateProject(idx, "tags", vals)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                        placeholder="React, Next.js, TypeScript"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={proj.description || ""}
                        onChange={(e) => updateProject(idx, "description", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl p-3 text-sm outline-none resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-ink-800 cursor-none">
                        <input
                          type="checkbox"
                          checked={!!proj.featured}
                          onChange={(e) => updateProject(idx, "featured", e.target.checked)}
                          className="w-4 h-4 rounded text-citrus-500 focus:ring-citrus-400 cursor-none"
                        />
                        Featured Project (Main Section)
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. EXPERIENCE TAB */}
        {activeTab === "Experience" && (
          <div className="bg-cream-50 border border-cream-200 rounded-3xl p-4 sm:p-8 shadow-sm">
            <div className="sticky top-[64px] sm:top-[80px] z-30 bg-cream-50/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-cream-200 mb-6 pt-2">
              <div>
                <h2 className="font-display text-xl font-bold">Work History</h2>
                <p className="text-xs text-ink-400 mt-1 font-mono">{content.experience.length} Experience nodes</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addExperience}
                  className="flex items-center gap-1.5 bg-cream-50 hover:bg-cream-200 border border-cream-200 text-ink-900 text-xs px-4 py-2 rounded-full font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Experience
                </button>
                <button
                  onClick={() => handleSave("experience")}
                  disabled={loading !== null}
                  className="flex items-center gap-2 bg-ink-900 text-cream-50 hover:bg-citrus-500 hover:text-ink-900 text-xs px-4 py-2 rounded-full font-semibold transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {loading === "experience" ? "Saving..." : "Save Experience"}
                </button>
              </div>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {content.experience.map((job: any, idx: number) => (
                <div key={idx} className="bg-cream-50 border border-cream-200 rounded-2xl p-4 sm:p-6 relative">
                  <button
                    onClick={() => deleteExperience(idx)}
                    className="absolute top-6 right-6 p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Role Title</label>
                      <input
                        type="text"
                        value={job.role || ""}
                        onChange={(e) => updateExperience(idx, "role", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={job.company || ""}
                        onChange={(e) => updateExperience(idx, "company", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Duration Period</label>
                      <input
                        type="text"
                        value={job.period || ""}
                        onChange={(e) => updateExperience(idx, "period", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Highlights (comma-separated)</label>
                      <CommaSeparatedInput
                        initialValues={job.highlights || []}
                        onChange={(vals) => updateExperience(idx, "highlights", vals)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                        placeholder="React, TypeScript, Go"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Project 1 GitHub URL</label>
                      <input
                        type="text"
                        value={job.project1Url || ""}
                        onChange={(e) => updateExperience(idx, "project1Url", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                        placeholder="https://github.com/owner/repo"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Project 2 GitHub URL</label>
                      <input
                        type="text"
                        value={job.project2Url || ""}
                        onChange={(e) => updateExperience(idx, "project2Url", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                        placeholder="https://github.com/owner/repo"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Project 3 GitHub URL</label>
                      <input
                        type="text"
                        value={job.project3Url || ""}
                        onChange={(e) => updateExperience(idx, "project3Url", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                        placeholder="https://github.com/owner/repo"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Project 4 GitHub URL</label>
                      <input
                        type="text"
                        value={job.project4Url || ""}
                        onChange={(e) => updateExperience(idx, "project4Url", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                        placeholder="https://github.com/owner/repo"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Project 5 GitHub URL</label>
                      <input
                        type="text"
                        value={job.project5Url || ""}
                        onChange={(e) => updateExperience(idx, "project5Url", e.target.value)}
                        className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-xl px-3 py-2 text-sm outline-none"
                        placeholder="https://github.com/owner/repo"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono uppercase text-ink-400 mb-1">Description</label>
                      <RichTextEditor
                        value={job.description || ""}
                        onChange={(val) => updateExperience(idx, "description", val)}
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── TOAST NOTIFICATIONS ── */}
      {message && (
        <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 bg-cream-50 border border-cream-200 px-6 py-4 rounded-2xl shadow-2xl animate-slide-up">
          {message.type === "success" ? (
            <Check className="w-5 h-5 text-green-500 bg-green-50 border border-green-200 rounded-full p-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 bg-rose-50 border border-rose-200 rounded-full p-0.5" />
          )}
          <span className="text-sm font-medium text-ink-900">{message.text}</span>
        </div>
      )}
    </div>
  );
}
