"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Folder, File, ArrowLeft, ExternalLink, Terminal, Loader2, AlertCircle } from "lucide-react";
import { fetchGithubRepoTree, fetchGithubFileContent } from "@/lib/actions";
import { clsx } from "clsx";

type Props = {
  githubUrl: string;
  secondaryGithubUrl?: string;
  repo3Url?: string;
  repo4Url?: string;
  repo5Url?: string;
  liveLink?: string;
  projectName: string;
  onClose: () => void;
};

type FileNode = {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
};

function RepoWorkspace({
  githubUrl,
  repoLabel,
  isSplit,
}: {
  githubUrl: string;
  repoLabel: string;
  isSplit: boolean;
}) {
  const [pathHistory, setPathHistory] = useState<string[]>([""]);
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  const [loadingTree, setLoadingTree] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile responsive views: on mobile, we show either file tree or code pane
  const [mobileView, setMobileView] = useState<"explorer" | "editor">("explorer");

  const currentPath = pathHistory[pathHistory.length - 1];

  // Load directory tree
  const loadTree = async (path: string) => {
    setLoadingTree(true);
    setError(null);
    try {
      const res = await fetchGithubRepoTree(githubUrl, path);
      if (res.success && res.nodes) {
        setNodes(res.nodes);
      } else {
        setError(res.error || "Failed to load directory files.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setLoadingTree(false);
    }
  };

  // Load file content
  const loadFile = async (filePath: string) => {
    setLoadingFile(true);
    setError(null);
    try {
      const res = await fetchGithubFileContent(githubUrl, filePath);
      if (res.success && res.content !== undefined) {
        setFileContent(res.content);
        setSelectedFile(filePath);
        if (window.innerWidth < 768) {
          setMobileView("editor");
        }
      } else {
        setError(res.error || "Failed to read file content.");
      }
    } catch (e) {
      setError("An unexpected error occurred reading the file.");
    } finally {
      setLoadingFile(false);
    }
  };

  useEffect(() => {
    loadTree(currentPath);
  }, [currentPath, githubUrl]);

  useEffect(() => {
    setPathHistory([""]);
    setSelectedFile(null);
    setFileContent("");
  }, [githubUrl]);

  // Handle folder navigation
  const handleFolderClick = (path: string) => {
    setPathHistory((prev) => [...prev, path]);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    const updated = pathHistory.slice(0, index + 1);
    setPathHistory(updated);
  };

  // Navigate back one directory level
  const handleGoBack = () => {
    if (pathHistory.length > 1) {
      setPathHistory((prev) => prev.slice(0, -1));
    }
  };

  // Extract parsed repo display name (e.g. "octocat/Spoon-Knife")
  const repoName = githubUrl.split("github.com/").pop()?.replace(/\/$/, "") || githubUrl;

  return (
    <div className={clsx("flex-1 flex flex-col min-w-0 overflow-hidden", isSplit && "md:w-1/2")}>
      {/* Repo Label Subheader */}
      <div className="bg-[#151515] border-b border-neutral-800 px-6 py-2 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-citrus-500 truncate">
          📂 {repoLabel}: <span className="text-neutral-300 font-normal">{repoName}</span>
        </span>
      </div>

      {/* ── PATH BREADCRUMBS ── */}
      <div className="flex items-center gap-2 px-6 py-2.5 bg-[#181818] border-b border-neutral-800 text-xs overflow-x-auto whitespace-nowrap font-mono select-none">
        {pathHistory.length > 1 && (
          <button
            onClick={handleGoBack}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded mr-1"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => handleBreadcrumbClick(0)}
          className="text-neutral-400 hover:text-citrus-500"
        >
          root
        </button>

        {pathHistory.map((path, idx) => {
          if (idx === 0) return null;
          const segments = path.split("/");
          const name = segments[segments.length - 1];
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-neutral-600">/</span>
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={clsx(
                  idx === pathHistory.length - 1
                    ? "text-neutral-200 font-medium"
                    : "text-neutral-400 hover:text-citrus-500"
                )}
              >
                {name}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── MAIN CONTENTS VIEW ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: FILE EXPLORER (Visible always on desktop, toggled on mobile) */}
        <div
          className={clsx(
            "w-full border-r border-neutral-800 bg-[#121212] overflow-y-auto flex flex-col md:flex",
            isSplit ? "md:w-[180px] sm:w-[240px]" : "md:w-80",
            mobileView === "explorer" ? "flex" : "hidden"
          )}
        >
          {loadingTree ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-citrus-500" />
              <span className="font-mono text-xs">Loading tree...</span>
            </div>
          ) : error && !selectedFile ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <div>
                <h3 className="text-xs font-semibold text-neutral-200">Failed to load repository</h3>
                <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed max-w-xs mx-auto">
                  {error.includes("404") || error.includes("403")
                    ? "Ensure GITHUB_PAT with full repo scope is configured in your .env.local file."
                    : error}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {nodes.length === 0 && (
                <p className="text-xs font-mono text-neutral-600 p-3 italic text-center">Empty directory</p>
              )}
              {nodes.map((node) => (
                <button
                  key={node.path}
                  onClick={() =>
                    node.type === "dir" ? handleFolderClick(node.path) : loadFile(node.path)
                  }
                  className={clsx(
                    "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-mono transition-all group",
                    selectedFile === node.path
                      ? "bg-citrus-500/10 text-citrus-500 border border-citrus-500/20"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 border border-transparent"
                  )}
                >
                  {node.type === "dir" ? (
                    <Folder className="w-3.5 h-3.5 text-citrus-500/80 group-hover:text-citrus-500 transition-colors flex-shrink-0" />
                  ) : (
                    <File className="w-3.5 h-3.5 text-sky-400/80 group-hover:text-sky-400 transition-colors flex-shrink-0" />
                  )}
                  <span className="truncate flex-1 ml-1.5">{node.name}</span>
                  {node.size !== undefined && node.type === "file" && (
                    <span className="text-[10px] text-neutral-600 group-hover:text-neutral-500 font-mono">
                      {(node.size / 1024).toFixed(1)}k
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: EDITOR PANEL (Visible always on desktop, toggled on mobile) */}
        <div
          className={clsx(
            "flex-1 flex flex-col bg-[#1E1E1E] overflow-hidden md:flex",
            mobileView === "editor" ? "flex" : "hidden"
          )}
        >
          {/* Mobile Header: Back button */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-[#1A1A1A]">
            <button
              onClick={() => setMobileView("explorer")}
              className="flex items-center gap-1.5 text-xs text-citrus-500 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Files List
            </button>
            {selectedFile && (
              <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[150px]">
                {selectedFile.split("/").pop()}
              </span>
            )}
          </div>

          {loadingFile ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-citrus-500" />
              <span className="font-mono text-xs">Fetching file content...</span>
            </div>
          ) : selectedFile ? (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* File actions header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-neutral-800/80 bg-[#161616] text-xs">
                <span className="font-mono text-neutral-400 select-none truncate max-w-xs">
                  📄 {selectedFile.split("/").pop()}
                </span>
                <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest bg-neutral-900 px-2 py-0.5 border border-neutral-800/40 rounded-lg select-none">
                  🔒 Protected
                </span>
              </div>

              {/* Main Code Pre block */}
              <div className="flex-1 p-4 overflow-auto font-mono text-xs text-neutral-200 leading-relaxed bg-[#1E1E1E] select-none">
                <pre className="overflow-visible select-none">
                  <code className="select-none">{fileContent}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8 text-center select-none">
              <Terminal className="w-10 h-10 text-neutral-700 mb-3 animate-pulse" />
              <h3 className="text-xs font-semibold text-neutral-300">No file selected</h3>
              <p className="text-[10px] text-neutral-500 mt-2 max-w-xs leading-relaxed">
                Select a file from the sidebar to inspect its code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CodeViewerModal({
  githubUrl,
  secondaryGithubUrl,
  repo3Url,
  repo4Url,
  repo5Url,
  liveLink,
  projectName,
  onClose,
}: Props) {
  useEffect(() => {
    document.documentElement.classList.add("code-viewer-open");
    return () => {
      document.documentElement.classList.remove("code-viewer-open");
    };
  }, []);

  useEffect(() => {
    // 1. Prevent right-click context menu inside the modal
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCopy = (e.key === "c" || e.key === "C") && (isMac ? e.metaKey : e.ctrlKey);
      const isSelectAll = (e.key === "a" || e.key === "A") && (isMac ? e.metaKey : e.ctrlKey);
      const isSave = (e.key === "s" || e.key === "S") && (isMac ? e.metaKey : e.ctrlKey);
      const isPrint = (e.key === "p" || e.key === "P") && (isMac ? e.metaKey : e.ctrlKey);
      const isSource = (e.key === "u" || e.key === "U") && (isMac ? e.metaKey : e.ctrlKey);
      const isInspect =
        e.key === "F12" ||
        ((e.key === "i" || e.key === "I" || e.key === "j" || e.key === "J") &&
          e.shiftKey &&
          (isMac ? e.metaKey : e.ctrlKey));

      if (isCopy || isSelectAll || isSave || isPrint || isSource || isInspect) {
        e.preventDefault();
      }
    };

    // 3. Prevent standard clipboard copy events
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 4. Prevent drag start
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("dragstart", handleDragStart);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  const repos = [
    { url: githubUrl, label: "Primary" },
    { url: secondaryGithubUrl, label: "Repo 2" },
    { url: repo3Url, label: "Repo 3" },
    { url: repo4Url, label: "Repo 4" },
    { url: repo5Url, label: "Repo 5" }
  ].filter((r) => !!r.url) as { url: string; label: string }[];

  const hasMultiple = repos.length > 1;

  const [leftRepoIdx, setLeftRepoIdx] = useState(0);
  const [rightRepoIdx, setRightRepoIdx] = useState(hasMultiple ? 1 : 0);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-6 bg-black/70 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={clsx(
          "relative w-full h-full md:h-[85vh] bg-[#141414] md:border border-neutral-800 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10",
          hasMultiple ? "md:max-w-7xl" : "md:max-w-6xl"
        )}
      >
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-citrus-500/10 border border-citrus-400/20 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-citrus-500" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-neutral-100 text-sm leading-snug">
                {projectName} <span className="font-mono text-xs text-neutral-500 font-light">Code Inspector</span>
              </h2>
              <p className="font-mono text-[10px] text-neutral-500 hidden sm:block truncate max-w-2xl">
                {repos.map((r) => `${r.label}: ${r.url.split("github.com/").pop()}`).join("  |  ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {liveLink && (
              <a
                href={liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-citrus-500 hover:bg-citrus-600 text-[#1A1208] text-xs font-semibold shadow-[0_0_12px_rgba(244,160,36,0.35)] transition-all duration-300 hover:scale-[1.02] cursor-none animate-pulse"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Live Demo
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-200 bg-neutral-800/40 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all"
              aria-label="Close Code Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-neutral-800">
          <div className={clsx("flex-1 flex flex-col min-w-0 overflow-hidden", hasMultiple && "md:w-1/2")}>
            {hasMultiple && (
              <div className="bg-[#121212] border-b border-neutral-800/80 px-4 py-2 flex flex-wrap gap-1.5 items-center select-none">
                <span className="text-[10px] font-mono text-neutral-500 mr-2 uppercase tracking-wider">Compare Left:</span>
                {repos.map((repo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLeftRepoIdx(idx)}
                    className={clsx(
                      "px-2.5 py-1 text-[10px] font-mono rounded-lg transition-all border cursor-none",
                      leftRepoIdx === idx
                        ? "bg-citrus-500/10 text-citrus-500 border-citrus-500/30 font-semibold"
                        : "text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 border-transparent hover:bg-neutral-800"
                    )}
                  >
                    {repo.label}
                  </button>
                ))}
              </div>
            )}
            <RepoWorkspace
              githubUrl={repos[leftRepoIdx].url}
              repoLabel={repos[leftRepoIdx].label}
              isSplit={hasMultiple}
            />
          </div>

          {hasMultiple && (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:w-1/2">
              <div className="bg-[#121212] border-b border-neutral-800/80 px-4 py-2 flex flex-wrap gap-1.5 items-center select-none">
                <span className="text-[10px] font-mono text-neutral-500 mr-2 uppercase tracking-wider">Compare Right:</span>
                {repos.map((repo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRightRepoIdx(idx)}
                    className={clsx(
                      "px-2.5 py-1 text-[10px] font-mono rounded-lg transition-all border cursor-none",
                      rightRepoIdx === idx
                        ? "bg-citrus-500/10 text-citrus-500 border-citrus-500/30 font-semibold"
                        : "text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 border-transparent hover:bg-neutral-800"
                    )}
                  >
                    {repo.label}
                  </button>
                ))}
              </div>
              <RepoWorkspace
                githubUrl={repos[rightRepoIdx].url}
                repoLabel={repos[rightRepoIdx].label}
                isSplit={true}
              />
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-800 bg-[#1A1A1A] text-xs flex-wrap gap-4 select-none">
          <span className="text-neutral-500 font-mono">
            Powered by Secure GitHub API Proxy
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            {repos.map((repo, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-neutral-700">|</span>}
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-citrus-500 hover:text-citrus-400 font-semibold cursor-none"
                >
                  {repo.label} GitHub
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </React.Fragment>
            ))}
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
