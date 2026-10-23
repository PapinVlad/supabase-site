'use strict';
// Finished code for the Group B Supabase tutorial (COMP10020).
// Adapted from the Supabase JavaScript reference: createClient, signInWithPassword,
// select with embedded tables and postgres_changes. The schema, policies, rule checks
// and page are our own.
// ---------- Step 5: connect to your project ----------
const { url, key } = window.APP_CONFIG;
if (key.startsWith('sb_secret_')) throw new Error('Never put a secret key in a web page.');
// Named db, not supabase: the script tag already defines a global called supabase.
const db = window.supabase.createClient(url, key);

const $ = id => document.getElementById(id);
let user = null;      // the signed-in user, or null
let channel = null;   // the Realtime channel (step 8)

function show(message, isError = false) {
  $('status').textContent = message;
  $('status').className = isError ? 'error' : '';
}
function explain(error) {
  return [error.code, error.message, error.details, error.hint].filter(Boolean).join(' · ');
}

// ---------- Step 5: sign in and out ----------
$('loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const { error } = await db.auth.signInWithPassword({
    email: $('email').value.trim(),
    password: $('password').value
  });
  $('password').value = '';
  if (error) show(explain(error), true);
});

$('signOut').addEventListener('click', () => db.auth.signOut());

// Runs on page load, after sign-in, after sign-out and when the token is refreshed.
// Keep this callback short and synchronous; do the real work just after it.
db.auth.onAuthStateChange((_event, session) => {
  setTimeout(() => setUser(session?.user ?? null), 0);
});

async function setUser(next) {
  if (next?.id === user?.id) return;   // same user (e.g. token refresh): nothing to redraw
  user = next;
  $('loginForm').hidden = Boolean(user);
  $('appSection').hidden = !user;
  if (!user) {
    stopLive();
    $('tasks').replaceChildren();
    show('Signed out.');
    return;
  }
  $('who').textContent = `${user.email} · ID ${user.id}`;
  show('Signed in.');
  await loadProjects();
  await loadTasks();
  startLive();
}

show('Ready. Sign in with one of your test users.');

// ---------- Step 6: read the shared projects ----------
async function loadProjects() {
  const { data, error } = await db.from('demo_projects').select('id, name').order('name');
  if (error) return show(explain(error), true);
  $('project').replaceChildren(...data.map(p => new Option(p.name, p.id)));
}

// ---------- Step 6: add a task ----------
$('taskForm').addEventListener('submit', async event => {
  event.preventDefault();
  const { error } = await db.from('demo_tasks').insert({
    project_id: $('project').value,
    owner_id: user.id,
    title: $('title').value.trim()
  });
  if (error) return show(explain(error), true);
  $('title').value = '';
  show('Task saved.');
  await loadTasks();
});

// ---------- Step 6: list tasks with their project name ----------
async function loadTasks() {
  // No owner filter: Row Level Security decides which rows come back.
  const { data, error } = await db.from('demo_tasks')
    .select('id, title, created_at, demo_projects(name)')
    .order('created_at', { ascending: false });
  if (error) return show(explain(error), true);
  $('tasks').replaceChildren(...data.map(task => {
    const li = document.createElement('li');
    li.textContent = `${task.title} (${task.demo_projects?.name ?? 'no project'}) · ${task.id}`;
    return li;
  }));
  $('count').textContent = data.length;
  $('json').textContent = JSON.stringify(data, null, 2);
}

// ---------- Step 7: check the rules on purpose ----------
function result(text, isError = false) {
  $('result').textContent = text;
  $('result').className = isError ? 'error' : '';
}

$('badProject').addEventListener('click', async () => {
  const { error } = await db.from('demo_tasks').insert({
    project_id: '00000000-0000-0000-0000-000000000000',
    owner_id: user.id,
    title: 'Bad project test'
  });
  result(error ? `Rejected as expected (want 23503):\n${explain(error)}` : 'Unexpected: the row was saved.', !error);
});

$('readOther').addEventListener('click', async () => {
  const { data, error } = await db.from('demo_tasks')
    .select('id, title')
    .eq('id', $('otherTask').value.trim());
  if (error) return result(explain(error), true);
  result(`Rows returned: ${data.length}\n${JSON.stringify(data, null, 2)}`);
});

$('forgeOwner').addEventListener('click', async () => {
  const { error } = await db.from('demo_tasks').insert({
    project_id: $('project').value,
    owner_id: $('otherUser').value.trim(),
    title: 'Forged owner test'
  });
  result(error ? `Rejected as expected (want 42501):\n${explain(error)}` : 'Unexpected: the row was saved.', !error);
});

// ---------- Step 8: live updates with Realtime ----------
function startLive() {
  stopLive();
  channel = db.channel('tasks-live')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'demo_tasks' },
      () => {
        $('events').textContent = Number($('events').textContent) + 1;
        loadTasks();                     // fresh read, filtered by RLS again
      })
    .subscribe(state => {
      $('live').textContent = state === 'SUBSCRIBED' ? '● Live' : state;
    });
}

function stopLive() {
  if (channel) db.removeChannel(channel);
  channel = null;
  $('live').textContent = 'Offline';
}
