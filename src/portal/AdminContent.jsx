import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useContent } from '../lib/ContentContext';
import { supabase } from '../lib/supabaseClient';
import { contentFields } from '../lib/contentFields';

function groupFields() {
  const pages = {};
  for (const f of contentFields) {
    if (!pages[f.page]) pages[f.page] = {};
    if (!pages[f.page][f.section]) pages[f.page][f.section] = [];
    pages[f.page][f.section].push(f);
  }
  return pages;
}

function FieldEditor({ field, currentValue, onSaved }) {
  const [value, setValue] = useState(currentValue);
  const [status, setStatus] = useState('idle');
  const isLong = field.type === 'text' && currentValue && currentValue.length > 80;

  async function saveText() {
    setStatus('saving');
    const { error } = await supabase.from('site_content').upsert({
      key: field.key, type: 'text', value, page: field.page, section: field.section, label: field.label,
    });
    if (error) { setStatus('error'); return; }
    setStatus('saved');
    onSaved();
    setTimeout(() => setStatus('idle'), 1500);
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('saving');
    const path = `${field.key.replace(/\./g, '-')}-${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('site-images').upload(path, file, { upsert: true });
    if (uploadErr) { setStatus('error'); return; }
    const { data: urlData } = supabase.storage.from('site-images').getPublicUrl(path);
    const { error: saveErr } = await supabase.from('site_content').upsert({
      key: field.key, type: 'image', value: urlData.publicUrl, page: field.page, section: field.section, label: field.label,
    });
    if (saveErr) { setStatus('error'); return; }
    setValue(urlData.publicUrl);
    setStatus('saved');
    onSaved();
    setTimeout(() => setStatus('idle'), 1500);
  }

  if (field.type === 'image') {
    return (
      <div className="rounded-sm border border-purple-100 bg-surface p-4">
        <p className="text-sm font-semibold text-ink">{field.label}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <img src={value} alt="" className="h-16 w-16 rounded-sm border border-purple-100 bg-white object-contain" />
          <label className="cursor-pointer rounded-sm border border-purple-100 px-4 py-2 text-sm font-semibold text-purple-900 hover:bg-lavender-50 dark:text-lilac">
            Change image
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          {status === 'saving' && <span className="text-sm text-ink/60">Uploading\u2026</span>}
          {status === 'saved' && <span className="text-sm text-green-600">Saved</span>}
          {status === 'error' && <span className="text-sm text-red-600">Couldn't save, try again</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-purple-100 bg-surface p-4">
      <p className="text-sm font-semibold text-ink">{field.label}</p>
      {isLong ? (
        <textarea className="input mt-2 min-h-[90px]" value={value} onChange={(e) => setValue(e.target.value)} />
      ) : (
        <input className="input mt-2" value={value} onChange={(e) => setValue(e.target.value)} />
      )}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={saveText}
          disabled={status === 'saving'}
          className="rounded-sm bg-purple-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving\u2026' : 'Save'}
        </button>
        {status === 'saved' && <span className="text-sm text-green-600">Saved</span>}
        {status === 'error' && <span className="text-sm text-red-600">Couldn't save, try again</span>}
      </div>
    </div>
  );
}

export default function AdminContent() {
  const { role, loading: authLoading } = useAuth();
  const { get, loading: contentLoading, refresh } = useContent();
  const [activePage, setActivePage] = useState('Home');

  if (authLoading) return null;
  if (!role || !['admin', 'principal'].includes(role)) {
    return <Navigate to="/portal" replace />;
  }

  const grouped = groupFields();
  const pageNames = Object.keys(grouped);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-serif text-3xl text-purple-900 dark:text-lilac">Edit site content</h1>
      <p className="mt-2 text-ink/70">
        Change any text or image below. Each one saves on its own \u2014 click Save (or pick a new
        image) and it updates the live site right away.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-purple-100 pb-4">
        {pageNames.map((p) => (
          <button
            key={p}
            onClick={() => setActivePage(p)}
            className={`rounded-sm px-4 py-2 text-sm font-semibold ${activePage === p ? 'bg-purple-900 text-white' : 'text-ink/70 hover:bg-lavender-50'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {contentLoading ? (
        <p className="mt-8 text-ink/60">Loading current content\u2026</p>
      ) : (
        Object.entries(grouped[activePage] || {}).map(([section, fields]) => (
          <div key={section} className="mt-8">
            <h2 className="font-serif text-xl text-purple-900 dark:text-lilac">{section}</h2>
            <div className="mt-4 space-y-4">
              {fields.map((field) => (
                <FieldEditor key={field.key} field={field} currentValue={get(field.key, field.default)} onSaved={refresh} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
