import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useContent } from '../lib/ContentContext';

export default function News() {
  const { get } = useContent();
  const [posts, setPosts] = useState(null); // null = still loading
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('news_posts')
      .select('id, post_date, tag, title, body, image_url')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setFailed(true);
        setPosts(data || []);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">{get('news.hero.eyebrow')}</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            {get('news.hero.title')}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        {posts === null && <p className="text-ink/60">Loading news…</p>}
        {posts !== null && failed && (
          <p className="text-ink/60">The news couldn&rsquo;t be loaded just now. Please try again in a moment.</p>
        )}
        {posts !== null && !failed && posts.length === 0 && (
          <p className="text-ink/60">No news to show yet — please check back soon.</p>
        )}
        <div className="space-y-10">
          {(posts || []).map((p) => (
            <article key={p.id} className="border-t border-purple-100 pt-8">
              {p.image_url && (
                <img src={p.image_url} alt="" className="mb-5 max-h-80 w-full rounded-sm object-cover" />
              )}
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                {p.post_date && <span className="text-gold-600">{p.post_date}</span>}
                {p.tag && <span className="rounded-full bg-lavender-50 px-2.5 py-1 text-purple-900">{p.tag}</span>}
              </div>
              <h2 className="mt-3 font-serif text-2xl text-purple-900">{p.title}</h2>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink/75">{p.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
