import React, { useEffect, useState } from 'react';
import { getAdminChapters, createAdminChapter } from '../../../lib/api';

const AdminStudyZoneTab = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminChapters();
        setChapters(data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load chapters');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCreate = async (payload) => {
    try {
      const created = await createAdminChapter(payload);
      setChapters((prev) => [created, ...prev]);
      setShowCreate(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create chapter');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black">Admin Study Zone</h2>
        <div>
          <button
            className="rounded-md bg-indigo-600 text-white px-3 py-2 font-bold"
            type="button"
            onClick={() => setShowCreate((s) => !s)}
          >
            {showCreate ? 'Close' : 'Create Chapter'}
          </button>
        </div>
      </div>

      {showCreate && <ChapterCreateForm onCreate={handleCreate} />}

      {loading && <div className="text-sm text-slate-500">Loading chapters...</div>}
      {error && <div className="text-sm text-rose-600">{error}</div>}

      <div className="mt-4 space-y-3">
        {chapters.map((c) => (
          <div key={c.id} className="rounded-lg border p-3 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-black">{c.title}</div>
                <div className="text-xs text-slate-500 mt-1">{c.description}</div>
              </div>
              <div className="text-xs text-slate-400">{(c.lessons || []).length} lessons</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChapterCreateForm = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 mb-4">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter title" className="w-full rounded-md border px-3 py-2" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="w-full rounded-md border px-3 py-2" rows={3} />
      <div>
        <button className="rounded-md bg-indigo-600 text-white px-3 py-2 font-bold" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
      </div>
    </form>
  );
};

export default AdminStudyZoneTab;
