import React, { useState } from 'react';
import { createAdminLesson, updateAdminLesson } from '../../../lib/api';

const AdminLessonEditor = ({ chapterId, existing = null, onSaved }) => {
  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (existing?.id) {
        const updated = await updateAdminLesson(existing.id, { title, content, chapterId });
        onSaved && onSaved(updated);
      } else {
        const created = await createAdminLesson({ title, content, chapterId });
        onSaved && onSaved(created);
      }
    } catch (err) {
      // ignore for now
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" className="w-full rounded-md border px-3 py-2" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="HTML content" className="w-full rounded-md border px-3 py-2" rows={6} />
      <div>
        <button className="rounded-md bg-indigo-600 text-white px-3 py-2 font-bold" type="submit" disabled={saving}>{saving ? 'Saving...' : existing?.id ? 'Update Lesson' : 'Create Lesson'}</button>
      </div>
    </form>
  );
};

export default AdminLessonEditor;
