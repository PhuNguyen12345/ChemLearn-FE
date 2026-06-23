import React, { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link, List, ListOrdered, Quote, Upload, X } from "lucide-react";

const TOOLBAR_ACTIONS = [
  { key: "bold", label: "Bold", icon: Bold, run: (editor) => editor.chain().focus().toggleBold().run(), isActive: (editor) => editor.isActive("bold") },
  { key: "italic", label: "Italic", icon: Italic, run: (editor) => editor.chain().focus().toggleItalic().run(), isActive: (editor) => editor.isActive("italic") },
  { key: "h2", label: "Heading 2", icon: Heading2, run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (editor) => editor.isActive("heading", { level: 2 }) },
  { key: "h3", label: "Heading 3", icon: Heading3, run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (editor) => editor.isActive("heading", { level: 3 }) },
  { key: "bullet", label: "Bullets", icon: List, run: (editor) => editor.chain().focus().toggleBulletList().run(), isActive: (editor) => editor.isActive("bulletList") },
  { key: "ordered", label: "Numbered", icon: ListOrdered, run: (editor) => editor.chain().focus().toggleOrderedList().run(), isActive: (editor) => editor.isActive("orderedList") },
  { key: "quote", label: "Quote", icon: Quote, run: (editor) => editor.chain().focus().toggleBlockquote().run(), isActive: (editor) => editor.isActive("blockquote") }
];

/* ─── Image-insert popover ─── */
const ImageInsertPopover = ({ editor, onClose }) => {
  const [activeTab, setActiveTab] = useState("url"); // "url" | "upload"
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const popoverRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const insertFromUrl = () => {
    if (!url.trim()) return;
    editor.chain().focus().setImage({ src: url.trim(), alt: altText.trim() || undefined }).run();
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Tab switcher */}
      <div className="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "url"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Link className="h-3.5 w-3.5" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "upload"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
      </div>

      {/* ── URL tab ── */}
      {activeTab === "url" && (
        <div className="flex flex-col gap-2">
          <input
            type="url"
            placeholder="Paste image URL…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && insertFromUrl()}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <input
            type="text"
            placeholder="Alt text (optional)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && insertFromUrl()}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="button"
            disabled={!url.trim()}
            onClick={insertFromUrl}
            className="mt-1 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Insert Image
          </button>
        </div>
      )}

      {/* ── Upload tab (placeholder) ── */}
      {activeTab === "upload" && (
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
          <Upload className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">File upload coming soon</p>
          <p className="text-xs text-slate-400">This feature will be available in a future update.</p>
        </div>
      )}
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder = "Write lesson content..." }) => {
  const [, forceToolbarUpdate] = useState(0);
  const [showImagePopover, setShowImagePopover] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true, HTMLAttributes: { class: "rounded-lg max-w-full h-auto mx-auto my-4" } })
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[300px] prose prose-slate max-w-none rounded-b-2xl bg-white px-5 py-4 leading-7 focus:outline-none"
      }
    },
    onUpdate: ({ editor: activeEditor }) => {
      onChange?.(activeEditor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) {
      return undefined;
    }

    const refresh = () => forceToolbarUpdate((version) => version + 1);
    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);
    editor.on("focus", refresh);
    editor.on("blur", refresh);

    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("transaction", refresh);
      editor.off("focus", refresh);
      editor.off("blur", refresh);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const incoming = value || "";
    const current = editor.getHTML();
    if (incoming !== current) {
      editor.commands.setContent(incoming, false);
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Loading editor...</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="sticky top-0 z-10 flex flex-wrap gap-1.5 border-b border-slate-200 bg-slate-50/95 p-2 backdrop-blur">
        {TOOLBAR_ACTIONS.map((action) => {
          const Icon = action.icon;
          const active = action.isActive(editor);
          return (
          <button
            key={action.key}
            type="button"
            title={action.label}
            aria-label={action.label}
            aria-pressed={active}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-black transition ${
              active
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
            }`}
            onMouseDown={(event) => {
              event.preventDefault();
              action.run(editor);
            }}
          >
            <Icon className="h-4 w-4" />
          </button>
          );
        })}

        {/* Separator */}
        <div className="mx-0.5 my-1 w-px self-stretch bg-slate-200" />

        {/* Image insert button */}
        <div className="relative">
          <button
            type="button"
            title="Insert image"
            aria-label="Insert image"
            aria-pressed={showImagePopover}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-black transition ${
              showImagePopover
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
            }`}
            onMouseDown={(event) => {
              event.preventDefault();
              setShowImagePopover((prev) => !prev);
            }}
          >
            <ImagePlus className="h-4 w-4" />
          </button>

          {showImagePopover && (
            <ImageInsertPopover editor={editor} onClose={() => setShowImagePopover(false)} />
          )}
        </div>
      </div>

      <EditorContent editor={editor} />

      {!value?.trim() && (
        <div className="border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-400">{placeholder}</div>
      )}
    </div>
  );
};

export default RichTextEditor;
