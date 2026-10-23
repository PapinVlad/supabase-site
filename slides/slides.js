// Generated from the Google Slides deck. Do not edit by hand.
window.SLIDES = [
 {
  "n": 1,
  "title": "Supabase",
  "group": "purpose",
  "speaker": "Vladyslav Papin",
  "notes": "Hello everyone. We are Group B, and today we are introducing Supabase. We will explain its main technologies, show evidence from our example, and evaluate when it is useful.\n\nLet's start with a simple question: why does a web page need a backend at all?",
  "image": "slides/slide-01.webp"
 },
 {
  "n": 2,
  "title": "Why a frontend needs a backend",
  "group": "purpose",
  "speaker": "Vladyslav Papin",
  "notes": "A web page can display a form, but a shared application needs more than a user interface. It must recognise users, store data beyond one browser, and decide who can access that data. Sometimes it also needs to show changes made elsewhere. We could build and maintain services for these jobs ourselves. Backend as a Service, or BaaS, provides reusable services that our application can call. We still design the application and its access rules.\n\nSupabase is one platform that provides these services. Let's look at what it is made of.",
  "image": "slides/slide-02.webp"
 },
 {
  "n": 3,
  "title": "Supabase starts with PostgreSQL",
  "group": "purpose",
  "speaker": "Vladyslav Papin",
  "notes": "Supabase is built around PostgreSQL, a relational database. Around that core, it brings together open-source tools for common backend tasks. Auth manages sign-in and sessions. The Data API uses PostgREST to make database operations available through HTTP. Realtime can deliver database changes through WebSockets. The platform also provides file Storage and Edge Functions for server-side logic, and Studio is the dashboard we use to manage the project. Our example uses Auth, the Data API and Realtime, but not Storage or Edge Functions. Supabase is offered as a hosted service, and it can also be self-hosted.\n\nNow, where does each part run in our example?",
  "image": "slides/slide-03.webp"
 },
 {
  "n": 4,
  "title": "Where our code runs",
  "group": "purpose",
  "speaker": "Vladyslav Papin",
  "notes": "This diagram shows where our example runs. The browser runs our HTML, CSS and JavaScript, including the Supabase JavaScript client. Signing in sends a request to Auth. Task reads and writes go through the Data API. PostgreSQL stores the data and applies row-level security, which controls access to individual rows. Realtime keeps a WebSocket open for live updates; Stanley will show how that works. The local Python server only serves our frontend files. It does not store tasks or decide who may read them. We have no custom application server, but we still have a backend: Supabase provides it.\n\nEverything you have just seen sits on top of PostgreSQL. [Member 2] will now show how our data is structured and how the browser reaches it.",
  "image": "slides/slide-04.webp"
 },
 {
  "n": 5,
  "title": "Relational data",
  "group": "data",
  "speaker": "[Name 2]",
  "notes": "",
  "image": "slides/slide-05.webp"
 },
 {
  "n": 6,
  "title": "Data API",
  "group": "data",
  "speaker": "[Name 2]",
  "notes": "",
  "image": "slides/slide-06.webp"
 },
 {
  "n": 7,
  "title": "Data constraints",
  "group": "data",
  "speaker": "[Name 2]",
  "notes": "",
  "image": "slides/slide-07.webp"
 },
 {
  "n": 8,
  "title": "Identity and permission",
  "group": "access",
  "speaker": "[Name 3]",
  "notes": "",
  "image": "slides/slide-08.webp"
 },
 {
  "n": 9,
  "title": "Database access",
  "group": "access",
  "speaker": "[Name 3]",
  "notes": "",
  "image": "slides/slide-09.webp"
 },
 {
  "n": 10,
  "title": "Access proof",
  "group": "access",
  "speaker": "[Name 3]",
  "notes": "",
  "image": "slides/slide-10.webp"
 },
 {
  "n": 11,
  "title": "Push and polling",
  "group": "realtime",
  "speaker": "Stanley Khumalo",
  "notes": "",
  "image": "slides/slide-11.webp"
 },
 {
  "n": 12,
  "title": "Event flow",
  "group": "realtime",
  "speaker": "Stanley Khumalo",
  "notes": "",
  "image": "slides/slide-12.webp"
 },
 {
  "n": 13,
  "title": "Two windows",
  "group": "realtime",
  "speaker": "Stanley Khumalo",
  "notes": "",
  "image": "slides/slide-13.webp"
 },
 {
  "n": 14,
  "title": "Recorded example",
  "group": "evaluation",
  "speaker": "[Name 5]",
  "notes": "",
  "image": "slides/slide-14.webp"
 },
 {
  "n": 15,
  "title": "Work and cost",
  "group": "evaluation",
  "speaker": "[Name 5]",
  "notes": "",
  "image": "slides/slide-15.webp"
 },
 {
  "n": 16,
  "title": "Verdict",
  "group": "evaluation",
  "speaker": "[Name 5]",
  "notes": "",
  "image": "slides/slide-16.webp"
 },
 {
  "n": 17,
  "title": "References",
  "group": "evaluation",
  "speaker": "[Name 5]",
  "notes": "Everything we have shown is based on these sources, mainly the official Supabase and PostgreSQL documentation. The full list with links is on our website.",
  "image": "slides/slide-17.webp"
 },
 {
  "n": 18,
  "title": "Thank you",
  "group": "evaluation",
  "speaker": "[Name 5]",
  "notes": "Thank you for listening. Our website and the step-by-step tutorial are linked here, and we are happy to take your questions.",
  "image": "slides/slide-18.webp"
 },
 {
  "n": 19,
  "title": "Supabase or Firebase?",
  "group": "backup",
  "speaker": "Q&A backup slide",
  "notes": "Why Supabase and not Firebase?\n\nBoth are managed backends. The main difference is the data model. Supabase is PostgreSQL, so we work with tables, joins and SQL, and our access rules are RLS policies inside the database. Firebase's main database, Firestore, stores documents in collections and uses Security Rules. Supabase is open source and can be self-hosted; Firebase runs only on Google. Firebase now also offers PostgreSQL through SQL Connect, so the gap is smaller than it was. We chose Supabase because our data is relational.",
  "image": "slides/slide-19.webp"
 },
 {
  "n": 20,
  "title": "Is the key in our page a leak?",
  "group": "backup",
  "speaker": "Q&A backup slide",
  "notes": "Your key is visible in the page source. Isn't that a leak?\n\nThat is the publishable key, and Supabase says it is safe to expose. It only maps a request to the anon or authenticated role, and RLS then decides which rows each user can see. The secret key is different: it bypasses RLS, so it belongs only on a server, and browsers are refused with 401. The real risk is a table without a policy, not a visible key.",
  "image": "slides/slide-20.webp"
 },
 {
  "n": 21,
  "title": "What about edits and deletes?",
  "group": "backup",
  "speaker": "Q&A backup slide",
  "notes": "What happens when a task is edited or deleted?\n\nOur example only grants and listens for INSERT, so edits made in the dashboard need Refresh. To support them we would grant UPDATE and DELETE, add owner policies for both, and subscribe to all events with event star. One caveat from the Supabase docs: Realtime cannot apply RLS to DELETE events, because the row no longer exists. Our design already handles that: after every event we run a fresh SELECT, which goes through RLS.",
  "image": "slides/slide-21.webp"
 },
 {
  "n": 22,
  "title": "Can we leave Supabase?",
  "group": "backup",
  "speaker": "Q&A backup slide",
  "notes": "What if we want to leave Supabase later?\n\nThe data is ordinary PostgreSQL, so we can export it with supabase db dump or pg_dump. The services are open source, so we could also run the same stack ourselves with Docker. Then security, HTTPS, email, updates and backups become our job. The parts that would need rework are Supabase-specific: the auth.users table, auth.uid() in our policies and the supabase-js calls.",
  "image": "slides/slide-22.webp"
 },
 {
  "n": 23,
  "title": "Server logic and growth",
  "group": "backup",
  "speaker": "Q&A backup slide",
  "notes": "Where does server-side logic go, and does it scale?\n\nCode that must not run in the browser, for example a payment call with a secret key, goes into Edge Functions: server-side TypeScript on Deno, run close to the user. For live updates, Postgres Changes checks every event for every subscriber, so the Supabase docs recommend Broadcast above about 3,000 subscribers to the same changes. On cost, the Free plan covers our example; Pro starts at 25 dollars a month plus usage.",
  "image": "slides/slide-23.webp"
 }
];
