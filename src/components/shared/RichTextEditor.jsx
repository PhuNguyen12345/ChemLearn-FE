import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, List, ListOrdered, Quote } from "lucide-react";

const TOOLBAR_ACTIONS = [
  { key: "bold", label: "Bold", icon: Bold, run: (editor) => editor.chain().focus().toggleBold().run(), isActive: (editor) => editor.isActive("bold") },
  { key: "italic", label: "Italic", icon: Italic, run: (editor) => editor.chain().focus().toggleItalic().run(), isActive: (editor) => editor.isActive("italic") },
  { key: "h2", label: "Heading 2", icon: Heading2, run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (editor) => editor.isActive("heading", { level: 2 }) },
  { key: "h3", label: "Heading 3", icon: Heading3, run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (editor) => editor.isActive("heading", { level: 3 }) },
  { key: "bullet", label: "Bullets", icon: List, run: (editor) => editor.chain().focus().toggleBulletList().run(), isActive: (editor) => editor.isActive("bulletList") },
  { key: "ordered", label: "Numbered", icon: ListOrdered, run: (editor) => editor.chain().focus().toggleOrderedList().run(), isActive: (editor) => editor.isActive("orderedList") },
  { key: "quote", label: "Quote", icon: Quote, run: (editor) => editor.chain().focus().toggleBlockquote().run(), isActive: (editor) => editor.isActive("blockquote") }
];

const RichTextEditor = ({ value, onChange, placeholder = "Write lesson content..." }) => {
  const [, forceToolbarUpdate] = useState(0);
  const editor = useEditor({
    extensions: [StarterKit],
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
      </div>

      <EditorContent editor={editor} />

      {!value?.trim() && (
        <div className="border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-400">{placeholder}</div>
      )}
    </div>
  );
};

export default RichTextEditor;
