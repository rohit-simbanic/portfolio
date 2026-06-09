"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { supabase, supabaseAdmin } from "./supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// ─────────────────────────────────────────────────────────────
// 1. CRYPTO SESSION MANAGEMENT
// ─────────────────────────────────────────────────────────────
function generateSessionToken(expiry: number): string {
  const data = `${expiry}:${ADMIN_PASSWORD}`;
  const signature = crypto.createHmac("sha256", ADMIN_PASSWORD).update(data).digest("hex");
  return `${expiry}.${signature}`;
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("admin_session");
  if (!sessionCookie) return false;

  const token = sessionCookie.value;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [expiryStr, signature] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || expiry < Date.now()) return false;

  const data = `${expiry}:${ADMIN_PASSWORD}`;
  const expectedSignature = crypto.createHmac("sha256", ADMIN_PASSWORD).update(data).digest("hex");
  return signature === expectedSignature;
}

// ─────────────────────────────────────────────────────────────
// 2. AUTHENTICATION ACTIONS
// ─────────────────────────────────────────────────────────────
export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: "Incorrect admin password" };
  }

  // Create a 24h session cookie
  const expiry = Date.now() + 1000 * 60 * 60 * 24;
  const token = generateSessionToken(expiry);

  cookies().set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true };
}

export async function logoutAdmin(): Promise<void> {
  cookies().delete("admin_session");
}

// ─────────────────────────────────────────────────────────────
// 3. FALLBACK DATA MAP (Original frontend content)
// ─────────────────────────────────────────────────────────────
const FALLBACK_CONTENT: Record<string, any> = {
  hero: {
    name: "Rohit",
    lastName: "Mondal.",
    roles: [
      "Full-Stack Developer",
      "UI/UX Enthusiast",
      "Open Source Contributor",
      "Problem Solver"
    ],
    bio: "I craft pixel-perfect interfaces and bulletproof backends. Passionate about turning complex problems into elegant, user-first experiences.",
    badgeText: "Available for hire"
  },
  about: {
    location: "Bengaluru, India",
    bioParagraphs: [
      "I'm a full-stack developer based in Bengaluru, India with a love for building things that live on the internet. I started my coding journey at 14, hacking together Minecraft mods, and never looked back.",
      "Today, I work across the entire stack—from architecting databases and REST APIs, to building polished React interfaces that feel native. I'm particularly passionate about developer experience, web performance, and accessible design.",
      "When I'm not pushing commits, you'll find me on hiking trails, experimenting with espresso recipes, or contributing to open-source projects."
    ],
    facts: [
      { emoji: "🎓", label: "B.S. Computer Science", sub: "UC Berkeley, 2019" },
      { emoji: "☕", label: "Coffee Consumed", sub: "~2,847 cups & counting" },
      { emoji: "🌍", label: "Time Zones Worked In", sub: "PST, EST, CET, IST" },
      { emoji: "📦", label: "npm Packages Published", sub: "7 open-source libs" }
    ],
    philosophy: {
      ship: "early & often",
      code: "readable first",
      users: "always"
    }
  },
  skills: {
    skillGroups: [
      {
        category: "Frontend",
        color: "bg-citrus-400",
        textColor: "text-citrus-600",
        bgColor: "bg-citrus-400/10",
        skills: [
          { name: "React / Next.js", level: 95 },
          { name: "TypeScript", level: 90 },
          { name: "Tailwind CSS", level: 92 },
          { name: "Framer Motion", level: 80 }
        ]
      },
      {
        category: "Backend",
        color: "bg-sage-500",
        textColor: "text-sage-600",
        bgColor: "bg-sage-400/10",
        skills: [
          { name: "Node.js / Express", level: 88 },
          { name: "MongoDB", level: 82 },
          { name: "REST API", level: 78 },
          { name: "Redis/Dragonfly", level: 72 }
        ]
      },
      {
        category: "Tools & Cloud",
        color: "bg-sky-500",
        textColor: "text-sky-600",
        bgColor: "bg-sky-400/10",
        skills: [
          { name: "AWS / Vercel", level: 85 },
          { name: "Docker", level: 80 },
          { name: "Git / CI/CD", level: 90 },
          { name: "Figma", level: 75 }
        ]
      }
    ],
    techPills: [
      "React", "Next.js", "TypeScript", "Node.js", "PostgreSQL",
      "Redis", "GraphQL", "Docker", "AWS", "Tailwind", "Prisma",
      "Jest", "Cypress", "Figma", "Git", "Linux"
    ]
  },
  projects: [
    {
      title: "Versa — Design System",
      description: "A comprehensive React component library with 80+ components, full a11y support, dark mode, and a Storybook playground. Used by 3 startups in production.",
      tags: ["React", "TypeScript", "Storybook", "Radix UI"],
      category: "Open Source",
      accent: "bg-citrus-400",
      link: "https://github.com/octocat/Spoon-Knife",
      featured: true,
      year: "2024",
      image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&q=80"
    },
    {
      title: "Fieldr — SaaS Platform",
      description: "Field service management platform with real-time scheduling, route optimization, invoicing, and mobile-first technician app.",
      tags: ["Next.js", "PostgreSQL", "Mapbox", "Stripe"],
      category: "SaaS",
      accent: "bg-emerald-500",
      link: "https://github.com",
      featured: true,
      year: "2024",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
    },
    {
      title: "Pulse — Analytics Dashboard",
      description: "Real-time analytics dashboard with customizable widgets, AI-powered insights, and team collaboration. Processes 10M+ events/day.",
      tags: ["React", "D3.js", "Redis", "WebSockets"],
      category: "Data",
      accent: "bg-sky-500",
      link: "https://github.com",
      featured: true,
      year: "2023",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
    },
    {
      title: "Snippr — Code Sharing",
      description: "Beautiful code snippet sharing tool with syntax highlighting, version history, and team workspaces.",
      tags: ["Next.js", "Prisma", "Vercel"],
      category: "Tool",
      accent: "bg-rose-400",
      link: "https://github.com",
      featured: false,
      year: "2023",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80"
    },
    {
      title: "Budgetr — Finance Tracker",
      description: "Personal finance app with bank sync, smart categorization, and goal tracking. 2k+ active users.",
      tags: ["React Native", "Plaid API", "Node.js"],
      category: "Mobile",
      accent: "bg-violet-500",
      link: "https://github.com",
      featured: false,
      year: "2022",
      image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&q=80"
    },
    {
      title: "Writr — Blog CMS",
      description: "Headless CMS tailored for developer blogs, with MDX support, SEO toolkit, and one-click Vercel deploy.",
      tags: ["Next.js", "MDX", "Tailwind", "Vercel"],
      category: "Open Source",
      accent: "bg-amber-400",
      link: "https://github.com",
      featured: false,
      year: "2022",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
    },
    {
      title: "Vaultkey",
      description: "Self-hosted password manager with end-to-end encryption, browser extensions, and team sharing capabilities.",
      tags: ["Rust", "React", "SQLite", "Docker"],
      category: "Open Source",
      accent: "bg-emerald-500",
      link: "https://github.com",
      featured: false,
      year: "2023",
      image: "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&q=80"
    },
    {
      title: "Pixelsnap",
      description: "Lightweight screenshot annotation tool for macOS with instant cloud uploads and shareable links.",
      tags: ["Swift", "CloudKit", "AppKit"],
      category: "Tool",
      accent: "bg-rose-500",
      link: "https://github.com",
      featured: false,
      year: "2023",
      image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80"
    },
    {
      title: "Formlayer",
      description: "API-first form backend with spam filtering, webhooks, file uploads, and a dashboard for submissions.",
      tags: ["Node.js", "PostgreSQL", "Redis", "Stripe"],
      category: "SaaS",
      accent: "bg-violet-500",
      link: "https://github.com",
      featured: false,
      year: "2022",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80"
    },
    {
      title: "Driftwood",
      description: "Minimalist habit tracker with streak visualizations, daily reminders, and offline-first sync.",
      tags: ["Flutter", "Dart", "Hive", "Firebase"],
      category: "Mobile",
      accent: "bg-sky-500",
      link: "https://github.com",
      featured: false,
      year: "2024",
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80"
    },
    {
      title: "Chartpilot",
      description: "Dashboard builder that turns SQL queries into embeddable, auto-refreshing charts and reports.",
      tags: ["Python", "FastAPI", "D3.js", "DuckDB"],
      category: "Open Source",
      accent: "bg-teal-500",
      link: "https://github.com",
      featured: false,
      year: "2024",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
    }
  ],
  experience: [
    {
      role: "Senior Full-Stack Engineer",
      company: "Stripe",
      period: "2022 — Present",
      type: "Full-time",
      description: "Leading frontend architecture for Stripe's merchant dashboard. Built real-time fraud detection UI processing 5M+ transactions/day. Mentored 4 junior engineers.",
      highlights: ["React", "TypeScript", "Go", "gRPC"],
      color: "bg-citrus-400",
      dot: "#E8890A",
      tag: "#C47208",
      tagBg: "#FEF3DC",
      project1Url: "https://github.com/octocat/Spoon-Knife",
      project2Url: "",
      project3Url: "",
      project4Url: "",
      project5Url: ""
    },
    {
      role: "Full-Stack Developer",
      company: "Linear",
      period: "2020 — 2022",
      type: "Full-time",
      description: "Contributed core features to Linear's project management tool. Owned the notification system and integrations layer (GitHub, Slack, Figma).",
      highlights: ["React", "GraphQL", "Electron", "PostgreSQL"],
      color: "bg-sage-500",
      dot: "#5A9470",
      tag: "#3D7354",
      tagBg: "#EAF3E8",
      project1Url: "",
      project2Url: "",
      project3Url: "",
      project4Url: "",
      project5Url: ""
    },
    {
      role: "Frontend Engineer",
      company: "Vercel",
      period: "2019 — 2020",
      type: "Full-time",
      description: "Worked on the Vercel dashboard and CLI tooling. Improved deploy pipeline UI, reducing perceived latency by 40% through optimistic updates and skeleton screens.",
      highlights: ["Next.js", "Node.js", "TypeScript"],
      color: "bg-sky-500",
      dot: "#4A90C4",
      tag: "#2E6FA8",
      tagBg: "#E6F1FB",
      project1Url: "",
      project2Url: "",
      project3Url: "",
      project4Url: "",
      project5Url: ""
    },
    {
      role: "Software Engineering Intern",
      company: "Figma",
      period: "Summer 2018",
      type: "Internship",
      description: "Shipped a prototype for collaborative cursor presence in Figma's canvas. Presented to the full engineering team at demo day.",
      highlights: ["TypeScript", "WebSockets", "Canvas API"],
      color: "bg-rose-400",
      dot: "#D4644A",
      tag: "#B54A30",
      tagBg: "#FAECE7",
      project1Url: "",
      project2Url: "",
      project3Url: "",
      project4Url: "",
      project5Url: ""
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// 4. DATABASE QUERIES & UTILITIES
// ─────────────────────────────────────────────────────────────
export async function getSiteContent(key: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .single();

    if (error || !data) {
      return FALLBACK_CONTENT[key];
    }
    return data.value;
  } catch (e) {
    return FALLBACK_CONTENT[key];
  }
}

export async function getAllSiteContent(): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  const keys = Object.keys(FALLBACK_CONTENT);

  for (const key of keys) {
    result[key] = await getSiteContent(key);
  }

  return result;
}

export async function updateSiteContent(
  key: string,
  value: any
): Promise<{ success: boolean; error?: string }> {
  // 1. Authorize session
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    // 2. Perform upsert inside Supabase (using admin client to bypass user RLS policies)
    const { error } = await supabaseAdmin.from("site_content").upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

    if (error) {
      console.error(`DB Update Error for ${key}:`, error);
      return { success: false, error: error.message };
    }

    // 3. Clear landing page cache
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "An unexpected error occurred" };
  }
}

// Seeder to populate Database initially (for user ease)
export async function seedSiteDatabase(): Promise<{ success: boolean; seededCount?: number; error?: string }> {
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    let seededCount = 0;
    for (const key of Object.keys(FALLBACK_CONTENT)) {
      const { data } = await supabaseAdmin
        .from("site_content")
        .select("key")
        .eq("key", key)
        .single();

      if (!data) {
        await supabaseAdmin.from("site_content").insert({
          key,
          value: FALLBACK_CONTENT[key],
          updated_at: new Date().toISOString()
        });
        seededCount++;
      }
    }
    revalidatePath("/");
    return { success: true, seededCount };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 5. GITHUB REPOSITORY INTEGRATION ACTIONS
// ─────────────────────────────────────────────────────────────
function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  const cleanUrl = url.trim().replace(/\/$/, "").replace(/\.git$/, "");
  const parts = cleanUrl.split("github.com/");
  if (parts.length < 2) return null;
  const pathParts = parts[1].split("/");
  if (pathParts.length < 2) return null;
  return { owner: pathParts[0], repo: pathParts[1] };
}

function determineCategory(repoInfo: any): string {
  const description = (repoInfo.description || "").toLowerCase();
  const topics = (repoInfo.topics || []).map((t: string) => t.toLowerCase());
  const language = (repoInfo.language || "").toLowerCase();

  // 1. Check Mobile indicators
  if (
    topics.includes("mobile") ||
    topics.includes("ios") ||
    topics.includes("android") ||
    topics.includes("flutter") ||
    topics.includes("react-native") ||
    topics.includes("swift") ||
    topics.includes("kotlin") ||
    language === "swift" ||
    language === "kotlin" ||
    description.includes("mobile app") ||
    description.includes("ios app") ||
    description.includes("android app")
  ) {
    return "Mobile";
  }

  // 2. Check SaaS indicators
  if (
    topics.includes("saas") ||
    topics.includes("platform") ||
    topics.includes("billing") ||
    topics.includes("subscription") ||
    topics.includes("crm") ||
    description.includes("saas") ||
    description.includes("subscription platform") ||
    description.includes("management platform")
  ) {
    return "SaaS";
  }

  // 3. Check Data indicators
  if (
    topics.includes("data") ||
    topics.includes("analytics") ||
    topics.includes("dashboard") ||
    topics.includes("database") ||
    topics.includes("sql") ||
    topics.includes("charts") ||
    topics.includes("d3") ||
    language === "python" ||
    topics.includes("machine-learning") ||
    topics.includes("ai") ||
    description.includes("analytics") ||
    description.includes("dashboard") ||
    description.includes("database")
  ) {
    return "Data";
  }

  // 4. Check Tool indicators
  if (
    topics.includes("tool") ||
    topics.includes("cli") ||
    topics.includes("utility") ||
    topics.includes("library") ||
    topics.includes("linter") ||
    topics.includes("extension") ||
    description.includes("command-line") ||
    description.includes("utility") ||
    description.includes("helper tool") ||
    description.includes("library for")
  ) {
    return "Tool";
  }

  // 5. Default to Open Source
  return "Open Source";
}

export async function fetchGithubRepoMetadata(
  githubUrl: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) return { success: false, error: "Unauthorized access" };

  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) return { success: false, error: "Invalid GitHub URL format" };

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Nextjs-Portfolio-Agent",
  };
  if (process.env.GITHUB_PAT) {
    headers["Authorization"] = `token ${process.env.GITHUB_PAT}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return { success: false, error: `GitHub API error: ${res.statusText} (${res.status})` };
    }
    const repoInfo = await res.json();
    
    // Construct dynamic tags: use repo topics/tags if present, otherwise fallback to the primary language
    const extractedTags = repoInfo.topics && repoInfo.topics.length > 0
      ? repoInfo.topics
      : (repoInfo.language ? [repoInfo.language] : ["Open Source"]);

    // Generate automatic high-quality repository open-graph image link
    const dynamicImage = `https://opengraph.githubassets.com/1/${owner}/${repo}`;

    return {
      success: true,
      data: {
        title: repoInfo.name
          ? repoInfo.name.charAt(0).toUpperCase() + repoInfo.name.slice(1).replace(/[-_]/g, " ")
          : "",
        description: repoInfo.description || "",
        tags: extractedTags,
        year: repoInfo.created_at
          ? repoInfo.created_at.slice(0, 4)
          : new Date().getFullYear().toString(),
        category: determineCategory(repoInfo),
        image: dynamicImage,
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Network error fetching metadata" };
  }
}



export async function fetchGithubRepoTree(
  githubUrl: string,
  path: string = ""
): Promise<{ success: boolean; nodes?: any[]; error?: string }> {
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) return { success: false, error: "Invalid GitHub URL format" };

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Nextjs-Portfolio-Agent",
  };
  if (process.env.GITHUB_PAT) {
    headers["Authorization"] = `token ${process.env.GITHUB_PAT}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return { success: false, error: `Failed to load repo files: ${res.statusText} (${res.status})` };
    }
    const items = await res.json();
    if (!Array.isArray(items)) {
      return { success: false, error: "Requested path is not a directory" };
    }

    const nodes = items.map((item: any) => ({
      name: item.name,
      path: item.path,
      type: item.type === "dir" ? "dir" : "file",
      size: item.size,
    }));

    // Sort: directories first, then files alphabetically
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "dir" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return { success: true, nodes };
  } catch (e: any) {
    return { success: false, error: e.message || "Network error fetching repository tree" };
  }
}

export async function fetchGithubFileContent(
  githubUrl: string,
  filePath: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) return { success: false, error: "Invalid GitHub URL format" };

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "Nextjs-Portfolio-Agent",
  };
  if (process.env.GITHUB_PAT) {
    headers["Authorization"] = `token ${process.env.GITHUB_PAT}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return { success: false, error: `Failed to load file contents: ${res.statusText} (${res.status})` };
    }

    const content = await res.text();
    return { success: true, content };
  } catch (e: any) {
    return { success: false, error: e.message || "Network error fetching file content" };
  }
}

// ─────────────────────────────────────────────────────────────
// 6. RESUME FILE MANAGEMENT ACTIONS
// ─────────────────────────────────────────────────────────────
export async function uploadResumeAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; filename?: string; error?: string }> {
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    // Validate size (limit to 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { success: false, error: "File size exceeds the 5MB limit" };
    }

    // Validate content types: pdf, doc, docx
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "doc", "docx"];

    if (!allowedTypes.includes(file.type) || !extension || !allowedExtensions.includes(extension)) {
      return {
        success: false,
        error: "Invalid file type. Only PDF and Microsoft Word (.doc, .docx) files are allowed.",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bucketName = "assets";

    // 1. Ensure storage bucket exists
    const { error: getBucketError } = await supabaseAdmin.storage.getBucket(bucketName);
    if (getBucketError) {
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: allowedTypes,
      });
      if (createBucketError) {
        console.warn("Failed to create bucket programmatically:", createBucketError);
      }
    }

    // 2. Upload to Supabase Storage
    const filePath = `resumes/resume-${Date.now()}.${extension}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage Upload Error:", uploadError);
      return { success: false, error: `Upload to storage failed: ${uploadError.message}` };
    }

    // 3. Get Public URL
    const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath);
    if (!urlData || !urlData.publicUrl) {
      return { success: false, error: "Failed to resolve public URL for uploaded resume." };
    }

    const publicUrl = urlData.publicUrl;

    // 4. Save metadata in site_content table
    const resumeInfo = {
      url: publicUrl,
      filename: file.name,
      contentType: file.type,
      uploadedAt: new Date().toISOString(),
      storagePath: filePath,
    };

    const { error: dbError } = await supabaseAdmin.from("site_content").upsert(
      { key: "resume", value: resumeInfo, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

    if (dbError) {
      console.error("DB Upsert Error:", dbError);
      return { success: false, error: `Failed to save resume details to database: ${dbError.message}` };
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      url: publicUrl,
      filename: file.name,
    };
  } catch (error: any) {
    console.error("Upload resume exception:", error);
    return { success: false, error: error.message || "An unexpected error occurred during upload" };
  }
}

export async function deleteResumeAction(): Promise<{ success: boolean; error?: string }> {
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    // 1. Fetch current resume to get storage path
    const { data: currentData } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "resume")
      .single();

    if (currentData && currentData.value) {
      const resumeInfo = currentData.value;
      if (resumeInfo.storagePath) {
        const { error: storageDeleteError } = await supabaseAdmin.storage
          .from("assets")
          .remove([resumeInfo.storagePath]);
        if (storageDeleteError) {
          console.warn("Storage deletion warning:", storageDeleteError);
        }
      }
    }

    // 2. Delete DB key
    const { error: deleteError } = await supabaseAdmin
      .from("site_content")
      .delete()
      .eq("key", "resume");

    if (deleteError) {
      console.error("DB Deletion Error:", deleteError);
      return { success: false, error: `Failed to remove resume details: ${deleteError.message}` };
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: any) {
    console.error("Delete resume exception:", error);
    return { success: false, error: error.message || "An unexpected error occurred during deletion" };
  }
}

