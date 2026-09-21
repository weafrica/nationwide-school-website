// Admin-only Edge Function: creates a student's login in one step.
//
// Why this has to be an Edge Function and not frontend code: creating an
// auth user with a set password requires the Supabase *service role* key,
// which must never be shipped to the browser (anyone could read it out of
// the page and create/delete any account on the site). This function
// holds that key server-side and only runs the specific, narrow action
// "create one student login" — the frontend admin panel calls this
// function over HTTPS with the *admin's own* login token, and the
// function itself checks that the caller is actually an admin before
// doing anything.
//
// Deploy with: supabase functions deploy create-student
// (see the README in this folder, or Supabase Dashboard → Edge Functions
// → Deploy new function → paste this file, if you'd rather not use the CLI)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function randomPassword() {
  // 10 characters, easy to read aloud/write down for a young learner —
  // no ambiguous characters like 0/O or 1/l/I.
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const callerToken = authHeader.replace('Bearer ', '');
    if (!callerToken) {
      return new Response(JSON.stringify({ error: 'Not signed in.' }), { status: 401, headers: cors });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify the caller is who their token says, then check their role.
    const { data: callerUser, error: callerErr } = await admin.auth.getUser(callerToken);
    if (callerErr || !callerUser?.user) {
      return new Response(JSON.stringify({ error: 'Invalid session.' }), { status: 401, headers: cors });
    }
    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', callerUser.user.id)
      .single();
    if (!callerProfile || !['admin', 'principal'].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ error: 'Only an admin or principal can create student logins.' }), { status: 403, headers: cors });
    }

    const body = await req.json();
    const { fullName, grade, dateOfBirth, parentName, parentPhone, parentEmail } = body;
    if (!fullName || !grade) {
      return new Response(JSON.stringify({ error: 'fullName and grade are required.' }), { status: 400, headers: cors });
    }

    // Student number: year + 4 random digits, checked for uniqueness.
    const year = new Date().getFullYear();
    let studentNumber = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `${year}${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: existing } = await admin.from('students').select('user_id').eq('student_number', candidate).maybeSingle();
      if (!existing) { studentNumber = candidate; break; }
    }
    if (!studentNumber) {
      return new Response(JSON.stringify({ error: 'Could not generate a unique student number, try again.' }), { status: 500, headers: cors });
    }

    // Synthetic login email — this is a login identifier, not a real
    // inbox. Students log in with it plus their password; nothing is
    // ever sent there.
    const loginEmail = `s${studentNumber}@login.nationwideschool.internal`;
    const password = randomPassword();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, preset_role: 'student' },
    });
    if (createErr || !created?.user) {
      return new Response(JSON.stringify({ error: createErr?.message || 'Could not create the login.' }), { status: 500, headers: cors });
    }

    // The trigger in 001_schema.sql already inserted a `profiles` row
    // with role='student' (from preset_role above). Now attach the
    // student-specific record and flag that they must change their
    // password on first login.
    const { error: studentErr } = await admin.from('students').insert({
      user_id: created.user.id,
      student_number: studentNumber,
      grade,
      date_of_birth: dateOfBirth || null,
      parent_name: parentName || null,
      parent_phone: parentPhone || null,
      parent_email: parentEmail || null,
    });
    if (studentErr) {
      return new Response(JSON.stringify({ error: studentErr.message }), { status: 500, headers: cors });
    }
    await admin.from('profiles').update({ must_change_password: true }).eq('id', created.user.id);

    return new Response(
      JSON.stringify({ studentNumber, loginUsername: loginEmail, password }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: cors });
  }
});
