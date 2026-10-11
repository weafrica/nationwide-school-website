import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useContent } from '../lib/ContentContext';
import { supabase } from '../lib/supabaseClient';
import { contentFields, pageRoutes } from '../lib/contentFields';
import { uploadSiteImage } from '../lib/uploadImage';
import PortalLayout from './PortalLayout';

// ───────────── grouping ─────────────

function groupByPage() {
  const pages = {};
  for (const field of contentFields) {
    pages[field.page] ??= {};
    pages[field.page][field.section] ??= [];
    pages[field.page][field.section].push(field);
  }
  return pages;
}

const PAGES = groupByPage();
const PAGE_NAMES = Object.keys(PAGES);

// ───────────── small shared pieces ─────────────

function StatusNote({ status, message }) {
  return (
    <span aria-live="polite" className="text-sm">
      {status === 'saving' && <span className="text-ink/60">Saving…</span>}
      {status === 'saved' && <span className="text-green-600">✓ Saved — it&rsquo;s live on the site</span>}
      {status === 'error' && <span className="text-red-600">{message || 'That didn’t save. Please try again.'}</span>}
    </span>
  );
}

const primaryButton =
  'rounded-sm px-4 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50';

// ───────────── one editable field ─────────────

function FieldEditor({ field, saved, onSaved }) {
  const [value, setValue] = useState(saved);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  // If the saved value changes from outside (for example after a restore), follow it.
  useEffect(() => { setValue(saved); }, [saved]);

  const dirty = value !== saved;
  const isLong = field.type === 'text' && (field.default.length > 70 || saved.length > 70 || value.length > 70);

  const flashSaved = () => {
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2500);
  };

  async function store(newValue) {
    setStatus('saving');
    setMessage('');
    const { error } = await supabase.from('site_content').upsert({
      key: field.key,
      type: field.type,
      value: newValue,
      page: field.page,
      section: field.section,
      label: field.label,
    });
    if (error) {
      setStatus('error');
      return false;
    }
    await onSaved();
    flashSaved();
    return true;
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be chosen again later
    if (!file) return;
    setStatus('saving');
    setMessage('');
    try {
      const url = await uploadSiteImage(file, field.key);
      await store(url);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  const card = 'rounded-sm border border-purple-100 bg-surface p-4';

  if (field.type === 'image') {
    return (
      <div className={card}>
        <p className="text-sm font-semibold text-ink">{field.label}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {saved ? (
            <img src={saved} alt="" className="h-20 w-28 rounded-sm border border-purple-100 bg-white object-contain" />
          ) : (
            <div className="flex h-20 w-28 items-center justify-center rounded-sm border border-dashed border-purple-100 text-xs text-ink/50">
              No picture
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <label className={`${primaryButton} cursor-pointer bg-gold-500 text-purple-900 hover:bg-gold-600`}>
              {saved ? 'Change picture' : 'Choose a picture'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {saved && !field.required && (
              <button
                type="button"
                onClick={() => store('')}
                className={`${primaryButton} border border-purple-100 text-ink/70 hover:bg-lavender-50`}
              >
                Remove picture
              </button>
            )}
            {field.required && saved !== field.default && (
              <button
                type="button"
                onClick={() => store(field.default)}
                className={`${primaryButton} border border-purple-100 text-ink/70 hover:bg-lavender-50`}
              >
                Restore original
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Big photos are shrunk automatically. The picture goes live the moment it finishes uploading.
        </p>
        <div className="mt-2"><StatusNote status={status} message={message} /></div>
      </div>
    );
  }

  return (
    <div className={card}>
      <label className="block">
        <span className="text-sm font-semibold text-ink">{field.label}</span>
        {isLong ? (
          <textarea
            className="input mt-2 min-h-[96px]"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : (
          <input className="input mt-2" value={value} onChange={(e) => setValue(e.target.value)} />
        )}
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => store(value)}
          disabled={!dirty || status === 'saving'}
          className={`${primaryButton} ${dirty ? 'bg-gold-500 text-purple-900 hover:bg-gold-600' : 'bg-lavender-50 text-ink/60'}`}
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => setValue(saved)}
            className="text-sm text-ink/60 underline hover:text-ink"
          >
            Undo
          </button>
        )}
        {!dirty && saved !== field.default && (
          <button
            type="button"
            onClick={() => store(field.default)}
            className="text-sm text-ink/60 underline hover:text-ink"
          >
            Restore original wording
          </button>
        )}
        <StatusNote status={status} message={message} />
      </div>
    </div>
  );
}

// ───────────── news posts ─────────────

const todayLabel = () =>
  new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

function NewsPostEditor({ post, onChanged }) {
  const isNew = !post;
  const blank = { post_date: todayLabel(), tag: '', title: '', body: '', image_url: null, published: true };
  const [draft, setDraft] = useState(post || blank);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const update = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));
  const dirty = isNew || JSON.stringify(draft) !== JSON.stringify(post);

  const fail = (text) => { setStatus('error'); setMessage(text); };

  async function save() {
    if (!draft.title.trim()) { fail('Please give the post a title.'); return; }
    setStatus('saving');
    setMessage('');
    const row = {
      post_date: draft.post_date.trim(),
      tag: draft.tag.trim(),
      title: draft.title.trim(),
      body: draft.body.trim(),
      image_url: draft.image_url || null,
      published: draft.published,
    };
    const { error } = isNew
      ? await supabase.from('news_posts').insert(row)
      : await supabase.from('news_posts').update(row).eq('id', post.id);
    if (error) { fail('That didn’t save. Please try again.'); return; }
    if (isNew) setDraft({ ...blank, post_date: todayLabel() });
    else setDraft((d) => ({ ...d, ...row }));
    setStatus('saved');
    await onChanged();
    setTimeout(() => setStatus('idle'), 2500);
  }

  async function remove() {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    const { error } = await supabase.from('news_posts').delete().eq('id', post.id);
    if (error) { fail('That couldn’t be deleted. Please try again.'); return; }
    await onChanged();
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setStatus('saving');
    setMessage('');
    try {
      const url = await uploadSiteImage(file, 'news');
      setDraft((d) => ({ ...d, image_url: url }));
      setStatus('idle');
    } catch (err) {
      fail(err.message);
    }
  }

  return (
    <div className="rounded-sm border border-purple-100 bg-surface p-4">
      {isNew && <p className="font-serif text-lg text-purple-900">Add a news post</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Date label</span>
          <input className="input mt-1.5" value={draft.post_date} onChange={update('post_date')} placeholder="e.g. 14 March 2026" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Category</span>
          <input className="input mt-1.5" value={draft.tag} onChange={update('tag')} placeholder="e.g. Sport, Admissions" />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="text-sm font-semibold text-ink">Title</span>
        <input className="input mt-1.5" value={draft.title} onChange={update('title')} />
      </label>
      <label className="mt-3 block">
        <span className="text-sm font-semibold text-ink">Story</span>
        <textarea className="input mt-1.5 min-h-[110px]" value={draft.body} onChange={update('body')} />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {draft.image_url && (
          <img src={draft.image_url} alt="" className="h-16 w-24 rounded-sm border border-purple-100 object-cover" />
        )}
        <label className={`${primaryButton} cursor-pointer border border-purple-100 text-ink/80 hover:bg-lavender-50`}>
          {draft.image_url ? 'Change picture' : 'Add a picture (optional)'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        {draft.image_url && (
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, image_url: null }))}
            className="text-sm text-ink/60 underline hover:text-ink"
          >
            Remove picture
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || status === 'saving'}
          className={`${primaryButton} ${dirty ? 'bg-gold-500 text-purple-900 hover:bg-gold-600' : 'bg-lavender-50 text-ink/60'}`}
        >
          {isNew ? 'Publish post' : 'Save changes'}
        </button>
        {!isNew && (
          <>
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.from('news_posts').update({ published: !post.published }).eq('id', post.id);
                if (error) fail('That didn’t save. Please try again.');
                else await onChanged();
              }}
              className={`${primaryButton} border border-purple-100 text-ink/80 hover:bg-lavender-50`}
            >
              {post.published ? 'Hide from site' : 'Show on site'}
            </button>
            <button
              type="button"
              onClick={remove}
              className={`${primaryButton} border border-red-300 text-red-700 hover:bg-red-50`}
            >
              Delete
            </button>
            {!post.published && <span className="text-sm text-gold-600">Hidden — visitors can’t see this post</span>}
          </>
        )}
        <StatusNote status={status} message={message} />
      </div>
    </div>
  );
}

function NewsManager() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (loadError) setError('The news posts could not be loaded.');
    else { setError(''); setPosts(data); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mt-10">
      <h2 className="font-serif text-2xl text-purple-900">News posts</h2>
      <p className="mt-1 text-sm text-ink/70">
        Add a post and it appears at the top of the News page. You can edit, hide or delete any post.
      </p>
      <div className="mt-5 space-y-4">
        <NewsPostEditor post={null} onChanged={load} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {posts === null && !error && <p className="text-sm text-ink/60">Loading posts…</p>}
        {(posts || []).map((post) => (
          <NewsPostEditor key={`${post.id}-${post.published}`} post={post} onChanged={load} />
        ))}
      </div>
    </div>
  );
}

// ───────────── the page ─────────────

export default function AdminContent() {
  const { role, loading: authLoading } = useAuth();
  const { get, loading: contentLoading, refresh } = useContent();
  const [activePage, setActivePage] = useState(PAGE_NAMES[1]); // start on Home
  const [query, setQuery] = useState('');

  if (authLoading) return null;
  if (!['admin', 'principal'].includes(role)) return <Navigate to="/portal" replace />;

  const needle = query.trim().toLowerCase();
  const sections = Object.entries(PAGES[activePage] || {})
    .map(([name, fields]) => [
      name,
      needle
        ? fields.filter((f) => f.label.toLowerCase().includes(needle) || get(f.key).toLowerCase().includes(needle))
        : fields,
    ])
    .filter(([, fields]) => fields.length > 0);

  return (
    <PortalLayout eyebrow="Admin portal" title="Edit website content">
      <Link to="/portal/dashboard" className="text-sm font-semibold text-purple-600 hover:text-purple-900">
        &larr; Back to administration
      </Link>
      <p className="mt-4 max-w-2xl text-ink/70">
        Pick a page, open a section, change the wording or the picture, and press <strong>Save</strong>.
        Each change goes live straight away. Nothing is lost — you can always bring back the original wording.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-purple-100 pb-4">
        {PAGE_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => { setActivePage(name); setQuery(''); }}
            className={`rounded-sm px-4 py-2 text-sm font-semibold ${
              activePage === name ? 'bg-purple-900 text-white' : 'text-ink/70 hover:bg-lavender-50'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search the ${activePage} page…`}
          className="input max-w-xs"
        />
        <a
          href={pageRoutes[activePage]}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-purple-600 hover:text-purple-900"
        >
          View this page on the site &nearr;
        </a>
      </div>

      {contentLoading ? (
        <p className="mt-8 text-ink/60">Loading the current content…</p>
      ) : (
        <div className="mt-6 space-y-4">
          {sections.length === 0 && <p className="text-ink/60">Nothing matches “{query}”.</p>}
          {sections.map(([name, fields], index) => (
            <details
              key={`${activePage}-${name}`}
              open={index === 0 || Boolean(needle)}
              className="group rounded-sm border border-purple-100"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 font-serif text-lg text-purple-900">
                <span>{name}</span>
                <span className="font-sans text-xs font-normal text-ink/50">{fields.length} to edit</span>
              </summary>
              <div className="space-y-3 border-t border-purple-100 p-4">
                {fields.map((field) => (
                  <FieldEditor key={field.key} field={field} saved={get(field.key)} onSaved={refresh} />
                ))}
              </div>
            </details>
          ))}
          {activePage === 'News' && !needle && <NewsManager />}
        </div>
      )}
    </PortalLayout>
  );
}
