'use strict';
const el = id => document.getElementById(id);
let db;
let authClient;
let activeSession = null;
let authRevision = 0;
let sessionReady = false;
let sessionQueue = Promise.resolve();
// One session source for REST and Realtime, including cross-tab notifications.
function receiveSession(session) {
  const previousUser = activeSession?.user?.id;
  activeSession = session?.access_token ? session : null;
  const revision = ++authRevision;
  if (previousUser !== activeSession?.user?.id) {
    sessionReady = false;
    queryNumber++; // Invalidate reads immediately, before the deferred callback.
  }
  // Never await SDK operations inside the synchronous Auth callback.
  setTimeout(() => {
    sessionQueue = sessionQueue.then(async () => {
      if (revision !== authRevision) return;
      const next = activeSession;
      const changed = currentUser?.id !== next?.user?.id;
      if (changed || !next) showAccount(next?.user || null);
      if (!next) {
        sessionReady = false;
        status('Signed out. Sign in in either window.');
        return;
      }
      await db.realtime.setAuth(next.access_token);
      if (revision !== authRevision) return;
      if (sessionReady && !changed) return; // Token refreshed, no need to reset UI.
      await loadProjects();
      if (revision !== authRevision) return;
      startLive();
      await loadTasks();
      if (revision !== authRevision) return;
      sessionReady = true;
      status('Signed in. Database reads succeeded.');
    }).catch(error => {
      if (revision !== authRevision) return;
      sessionReady = false;
      status(describe(error), true);
    });
  }, 0);
}
let currentUser = null;
let liveChannel = null;
let liveEpoch = 0;
let queryNumber = 0;
let eventCount = 0;
const highlights = new Map();
function liveState(text, state = '') {
  el('liveBadge').textContent = text;
  el('liveBadge').dataset.state = state;
}
function logEvent(text) {
  const line = new Date().toLocaleTimeString('en-GB') + '  ' + text;
  el('eventLog').textContent = [line, ...el('eventLog').textContent.split('\n')].slice(0, 8).join('\n');
}
function stopLive() {
  liveEpoch++;
  const previous = liveChannel;
  liveChannel = null;
  if (previous) void db.removeChannel(previous);
}
function startLive() {
  stopLive();
  if (!currentUser) { liveState('Signed out'); return; }
  const epoch = liveEpoch;
  liveState('Connecting…');
  liveChannel = db.channel('demo-tasks-' + currentUser.id)
    // Deliberately no owner filter: existing SELECT RLS authorises row delivery.
    // Only INSERT events are included; no claim is made about DELETE behaviour.
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'demo_tasks' }, payload => {
      if (epoch !== liveEpoch) return;
      eventCount++;
      el('eventCount').textContent = String(eventCount);
      highlights.set(payload.new.id, Date.now() + 3500);
      logEvent('INSERT received → reading authorised rows');
      loadTasks().catch(error => { if (epoch === liveEpoch) status(describe(error), true); });
    })
    .subscribe((state, error) => {
      if (epoch !== liveEpoch) return;
      if (state === 'SUBSCRIBED') {
        liveState('● Live connected', 'live');
        logEvent('Subscribed. Create a task in the other window.');
        // Reconcile data after (re)connecting, including any missed events.
        loadTasks().catch(error => { if (epoch === liveEpoch) status(describe(error), true); });
      } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(state)) {
        liveState('Live feed unavailable', 'error');
        logEvent(state + (error?.message ? ': ' + error.message : '') + '. Manual refresh remains available.');
      }
    });
}
function status(message, error = false) {
  el('status').textContent = message;
  el('status').className = error ? 'error' : '';
}
function describe(error) {
  return [error.code, error.message, error.details, error.hint].filter(Boolean).join('\n');
}
async function action(work) {
  document.querySelectorAll('button').forEach(b => b.disabled = true);
  try { await work(); }
  catch (error) { console.error(error); status(describe(error), true); }
  finally { document.querySelectorAll('button').forEach(b => b.disabled = false); }
}
function showAccount(user) {
  stopLive();
  queryNumber++;
  currentUser = user;
  highlights.clear(); eventCount = 0;
  el('eventCount').textContent = '0'; el('taskCount').textContent = '0';
  el('eventLog').textContent = 'Waiting for a connection.';
  liveState(user ? 'Not connected yet' : 'Signed out');
  el('loginSection').hidden = !!user;
  for (const id of ['accountSection', 'taskSection', 'testSection', 'liveSection']) el(id).hidden = !user;
  el('identity').textContent = user ? `${user.email} | User ID: ${user.id}` : '';
  el('tasks').replaceChildren();
  el('json').textContent = '[]';
  el('testResult').textContent = 'No check has run yet.';
}
async function loadProjects() {
  const revision = authRevision;
  const { data, error } = await db.from('demo_projects').select('id,name').order('name');
  if (revision !== authRevision) return;
  if (error) throw error;
  el('project').replaceChildren();
  for (const row of data) {
    const option = document.createElement('option');
    option.value = row.id; option.textContent = row.name;
    el('project').append(option);
  }
  if (!data.length) throw new Error('No projects returned. Check setup.sql and project access.');
}
async function loadTasks() {
  const request = ++queryNumber;
  const revision = authRevision;
  const userId = currentUser?.id;
  if (!userId) return;
  // No owner filter here. PostgreSQL RLS determines which rows can be read.
  // The foreign key allows the API to embed each task's project name.
  const { data, error } = await db.from('demo_tasks')
    .select('id,title,owner_id,created_at,demo_projects(name)')
    .order('created_at', { ascending: false });
  if (revision !== authRevision || request !== queryNumber || currentUser?.id !== userId) return;
  if (error) throw error;
  el('taskCount').textContent = String(data.length);
  el('tasks').replaceChildren();
  for (const task of data) {
    const li = document.createElement('li');
    const title = document.createElement('strong'); title.textContent = task.title;
    const detail = document.createElement('small');
    detail.textContent = `${task.demo_projects?.name || 'Project not visible'} | Task ID: ${task.id}`;
    const label = document.createElement('span'); label.className = 'project-label';
    label.textContent = task.demo_projects?.name || 'Project';
    if ((highlights.get(task.id) || 0) > Date.now()) li.classList.add('fresh');
    else highlights.delete(task.id);
    li.append(label, title, detail); el('tasks').append(li);
  }
  if (!data.length) {
    const li = document.createElement('li'); li.textContent = 'No tasks visible to this user yet.';
    el('tasks').append(li);
  }
  el('json').textContent = JSON.stringify(data, null, 2);
}
function requireUuid(value) {
  const id = value.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('Paste a complete UUID, not an email address or project name.');
  }
  return id;
}
function reportTest(label, data, error, expectedCode) {
  const expected = error?.code === expectedCode;
  el('testResult').textContent = `${label}\n${expected ? 'EXPECTED REJECTION' : 'UNEXPECTED RESULT — inspect the details'}\n` +
    (error ? describe(error) : JSON.stringify(data, null, 2));
}
el('loginForm').addEventListener('submit', e => {
  e.preventDefault(); action(async () => {
    const { data, error } = await authClient.auth.signInWithPassword({
      email: el('email').value.trim(), password: el('password').value
    });
    if (error) throw error;
    el('password').value = '';
    receiveSession(data.session);
  });
});
el('signOut').addEventListener('click', () => action(async () => {
  const { error } = await authClient.auth.signOut(); if (error) throw error;
  receiveSession(null);
}));
el('taskForm').addEventListener('submit', e => {
  e.preventDefault(); action(async () => {
    const title = el('title').value.trim();
    if (!title) throw new Error('Enter a task title.');
    const { error } = await db.from('demo_tasks').insert({
      project_id: el('project').value, owner_id: currentUser.id, title
    });
    if (error) throw error;
    el('title').value = ''; status('Task saved. Refreshing the list…');
    await loadTasks(); status('Task saved and read back from Supabase.');
  });
});
el('reconnect').addEventListener('click', () => startLive());
el('refresh').addEventListener('click', () => action(async () => {
  await loadTasks(); status('Tasks refreshed from Supabase.');
}));
el('foreignKeyTest').addEventListener('click', () => action(async () => {
  const { data, error } = await db.from('demo_tasks').insert({
    project_id: '00000000-0000-0000-0000-000000000000',
    owner_id: currentUser.id, title: 'Intentional foreign key check'
  }).select();
  reportTest('Missing project check — expected PostgreSQL code 23503', data, error, '23503');
}));
el('readOther').addEventListener('click', () => action(async () => {
  const id = requireUuid(el('otherTask').value);
  const { data, error } = await db.from('demo_tasks').select('id,title,owner_id').eq('id', id);
  if (error) throw error;
  el('testResult').textContent = data.length === 0
    ? 'No rows returned. Expected for a known existing task owned by the other user. Confirm that this ID really exists: a missing ID also returns [].'
    : 'Rows returned. This is expected for your own task, but NOT for another user’s task.\n' + JSON.stringify(data, null, 2);
}));
el('writeOther').addEventListener('click', () => action(async () => {
  const owner = requireUuid(el('otherOwner').value);
  if (owner === currentUser.id) throw new Error('Use the OTHER test user’s ID.');
  const { data, error } = await db.from('demo_tasks').insert({
    project_id: el('project').value, owner_id: owner, title: 'Intentional ownership check'
  }).select();
  reportTest('Other owner check — expected PostgreSQL code 42501', data, error, '42501');
}));
action(async () => {
  const config = window.DEMO_CONFIG;
  if (!window.supabase) throw new Error('Supabase SDK did not load. Check your internet connection or CDN access.');
  if (!config || config.url.includes('PASTE_') || config.key.includes('PASTE_')) {
    throw new Error('First replace the two placeholders in config.js, then reload this page.');
  }
  if (config.key.startsWith('sb_secret_')) throw new Error('Use a publishable key, never a secret key.');
  // Only this client owns persistent login and refresh state.
  authClient = window.supabase.createClient(config.url, config.key);
  // The data client takes the actual current user JWT from the Auth event.
  // It does not create a second persistent Auth instance or infer the user
  // from an identity label. PostgreSQL still validates JWTs and enforces RLS.
  db = window.supabase.createClient(config.url, config.key, {
    accessToken: async () => activeSession?.access_token || null
  });
  authClient.auth.onAuthStateChange((_event, session) => receiveSession(session));
  const revision = authRevision;
  const { data, error } = await authClient.auth.getSession();
  if (error) throw error;
  // Do not let an older startup read overwrite a newer cross-tab event.
  if (revision === authRevision) receiveSession(data.session);
});
