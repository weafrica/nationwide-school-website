import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { defaults } from './contentFields';

const ContentContext = createContext(null);

// The last content we fetched is kept in the browser so that a returning
// visitor sees the edited wording straight away instead of a flash of the
// original. It is replaced with fresh content on every page load.
const CACHE_KEY = 'site_content_cache_v1';

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(readCache);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('site_content').select('key, value');
    if (!error && data) {
      const map = {};
      for (const row of data) map[row.key] = row.value;
      setContent(map);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(map));
      } catch {
        // storage full or blocked — the site still works, just without the cache
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // An edited value wins; otherwise the original wording from contentFields.
  // (An empty string counts as an edit — that is how a photo is removed.)
  const get = useCallback(
    (key, fallback = '') => content[key] ?? defaults[key] ?? fallback,
    [content],
  );

  return (
    <ContentContext.Provider value={{ get, loading, refresh: load }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within a ContentProvider');
  return ctx;
}
