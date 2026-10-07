import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('site_content').select('key, value');
    if (!error && data) {
      const map = {};
      for (const row of data) map[row.key] = row.value;
      setContent(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const get = useCallback((key, fallback) => content[key] ?? fallback, [content]);

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
