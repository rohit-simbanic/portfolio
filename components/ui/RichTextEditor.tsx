"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Link as LinkIcon,
  Link2Off as LinkOffIcon,
  RemoveFormatting as ClearIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Code as CodeIcon
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Write description..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    bulletList: false,
    orderedList: false,
  });

  // Sync value from parent when it changes, but only if it's different from the actual DOM content
  // to avoid resetting selection and cursor position.
  useEffect(() => {
    if (editorRef.current) {
      const currentHTML = editorRef.current.innerHTML;
      if (currentHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // If the editor is functionally empty (just a trailing break tag or empty tags), trigger empty string
      if (html === "<p><br></p>" || html === "<br>" || html.trim() === "") {
        onChange("");
      } else {
        onChange(html);
      }
    }
    updateActiveStyles();
  };

  const updateActiveStyles = () => {
    if (typeof document !== "undefined") {
      setActiveStyles({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        bulletList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
      });
    }
  };

  const executeCommand = (command: string, arg: string = "") => {
    if (typeof document !== "undefined") {
      document.execCommand(command, false, arg);
      handleInput();
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  };

  const insertLink = () => {
    const url = prompt("Enter the URL:", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const insertInlineCode = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();

      if (selectedText) {
        const codeEl = document.createElement("code");
        codeEl.className = "bg-cream-200/50 dark:bg-neutral-800 text-citrus-500 px-1.5 py-0.5 rounded font-mono text-xs";
        codeEl.textContent = selectedText;
        range.deleteContents();
        range.insertNode(codeEl);
        
        // Move selection to after the inserted node
        const newRange = document.createRange();
        newRange.setStartAfter(codeEl);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        handleInput();
      } else {
        const codeEl = document.createElement("code");
        codeEl.className = "bg-cream-200/50 dark:bg-neutral-800 text-citrus-500 px-1.5 py-0.5 rounded font-mono text-xs";
        codeEl.innerHTML = "&#8203;"; // zero-width space
        range.insertNode(codeEl);

        const newRange = document.createRange();
        newRange.setStart(codeEl.firstChild!, 1);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        handleInput();
      }
    }
  };

  return (
    <div className="w-full border border-cream-200 dark:border-neutral-800 rounded-2xl overflow-hidden focus-within:border-citrus-400 dark:focus-within:border-citrus-400/80 transition-all bg-cream-50/50 dark:bg-neutral-900/50 backdrop-blur-sm">
      {/* ── TOOLBAR ── */}
      <div 
        className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-cream-200 dark:border-neutral-800 bg-cream-100/30 dark:bg-neutral-900/30"
        onMouseUp={updateActiveStyles}
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand("bold");
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-none ${
            activeStyles.bold
              ? "bg-citrus-500/10 text-citrus-500"
              : "text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white"
          }`}
          title="Bold"
        >
          <BoldIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand("italic");
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-none ${
            activeStyles.italic
              ? "bg-citrus-500/10 text-citrus-500"
              : "text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white"
          }`}
          title="Italic"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand("underline");
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-none ${
            activeStyles.underline
              ? "bg-citrus-500/10 text-citrus-500"
              : "text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white"
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-cream-200 dark:bg-neutral-800 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand("insertUnorderedList");
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-none ${
            activeStyles.bulletList
              ? "bg-citrus-500/10 text-citrus-500"
              : "text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white"
          }`}
          title="Bullet List"
        >
          <ListIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand("insertOrderedList");
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-none ${
            activeStyles.orderedList
              ? "bg-citrus-500/10 text-citrus-500"
              : "text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white"
          }`}
          title="Numbered List"
        >
          <ListOrderedIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-cream-200 dark:bg-neutral-800 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            insertLink();
          }}
          className="p-1.5 rounded-lg text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white transition-colors cursor-none"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand("unlink");
          }}
          className="p-1.5 rounded-lg text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white transition-colors cursor-none"
          title="Remove Link"
        >
          <LinkOffIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            insertInlineCode();
          }}
          className="p-1.5 rounded-lg text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white transition-colors cursor-none"
          title="Inline Code"
        >
          <CodeIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-cream-200 dark:bg-neutral-800 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand("removeFormat");
          }}
          className="p-1.5 rounded-lg text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white transition-colors cursor-none"
          title="Clear Formatting"
        >
          <ClearIcon className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand("undo");
          }}
          className="p-1.5 rounded-lg text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white transition-colors cursor-none"
          title="Undo"
        >
          <UndoIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand("redo");
          }}
          className="p-1.5 rounded-lg text-ink-600 dark:text-neutral-400 hover:bg-cream-100 dark:hover:bg-neutral-800 hover:text-ink-900 dark:hover:text-white transition-colors cursor-none"
          title="Redo"
        >
          <RedoIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ── EDITABLE CONTENT AREA ── */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          onKeyUp={updateActiveStyles}
          onMouseUp={updateActiveStyles}
          className="min-h-[140px] max-h-[300px] overflow-y-auto px-4 py-3 outline-none text-sm text-ink-800 dark:text-neutral-200 leading-relaxed font-body"
          style={{
            wordBreak: "break-word",
          }}
          data-placeholder={placeholder}
        />
        {/* Placeholder Style */}
        <style jsx global>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: rgba(var(--ink-400), 0.5);
            cursor: text;
          }
        `}</style>
      </div>
    </div>
  );
}
