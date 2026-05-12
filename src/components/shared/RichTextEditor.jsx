import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const TOOLBAR_ACTIONS = [
  { key: "bold", label: "Bold", run: (editor) => editor.chain().focus().toggleBold().run(), isActive: (editor) => editor.isActive("bold") },
  { key: "italic", label: "Italic", run: (editor) => editor.chain().focus().toggleItalic().run(), isActive: (editor) => editor.isActive("italic") },
  { key: "h2", label: "H2", run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (editor) => editor.isActive("heading", { level: 2 }) },
  { key: "h3", label: "H3", run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (editor) => editor.isActive("heading", { level: 3 }) },
  { key: "bullet", label: "Bullets", run: (editor) => editor.chain().focus().toggleBulletList().run(), isActive: (editor) => editor.isActive("bulletList") },
  { key: "ordered", label: "Numbered", run: (editor) => editor.chain().focus().toggleOrderedList().run(), isActive: (editor) => editor.isActive("orderedList") },
  { key: "quote", label: "Quote", run: (editor) => editor.chain().focus().toggleBlockquote().run(), isActive: (editor) => editor.isActive("blockquote") }
];

const RichTextEditor = ({ value, onChange, placeholder = "Write lesson content..." }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-[220px] prose max-w-none rounded-md border border-slate-300 bg-white px-3 py-2 focus:outline-none"
      }
    },
    onUpdate: ({ editor: activeEditor }) => {
      onChange?.(activeEditor.getHTML());
    }
  });

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
    return <div className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">Loading editor...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${action.isActive(editor) ? "border-indigo-600 bg-indigo-600 text-white shadow-sm" : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-white"}`}
            onMouseDown={(event) => {
              event.preventDefault();
              action.run(editor);
            }}
          >
            {action.label}
          </button>
        ))}
      </div>

      <EditorContent editor={editor} />

      {!value?.trim() && (
        <div className="text-xs text-slate-500">{placeholder}</div>
      )}
    </div>
  );
};

export default RichTextEditor;
