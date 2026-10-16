// Pinged once a day by Vercel (see "crons" in vercel.json). The free Supabase
// plan pauses a project that has been idle for a week, which takes the news
// page, forms and portal offline. A daily request keeps it awake.
//
// It only reads one harmless row of public content with the same public key
// the website already uses, so nothing private is touched.
export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    res.status(500).json({ ok: false, error: 'The Supabase settings are missing on the server.' });
    return;
  }

  try {
    const response = await fetch(`${url}/rest/v1/site_content?select=key&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    res.status(response.ok ? 200 : 502).json({
      ok: response.ok,
      supabaseStatus: response.status,
      at: new Date().toISOString(),
    });
  } catch (error) {
    res.status(502).json({ ok: false, error: String(error) });
  }
}
