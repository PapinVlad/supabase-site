-- Step 2 of the Group B Supabase tutorial. Run once in a NEW project (SQL Editor).
-- Creates two tables, turns on Row Level Security and adds the access rules.
begin;

-- Shared reference data: every signed-in user can read the project names.
create table public.demo_projects (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 1 and 80)
);

-- Each task belongs to one project and one user.
create table public.demo_tasks (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.demo_projects(id),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  title      text not null check (char_length(btrim(title)) between 1 and 120),
  created_at timestamptz not null default now()
);
create index demo_tasks_owner_idx on public.demo_tasks(owner_id);
create index demo_tasks_project_idx on public.demo_tasks(project_id);

-- Row Level Security: nothing is reachable through the API until a policy allows it.
alter table public.demo_projects enable row level security;
alter table public.demo_tasks enable row level security;

-- Grants: which operations each role may run at all. Signed-out users get nothing.
revoke all on public.demo_projects, public.demo_tasks from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.demo_projects to authenticated;
grant select, insert on public.demo_tasks to authenticated;

-- Policies: which rows.
create policy "Signed in users read demo projects"
  on public.demo_projects for select to authenticated
  using (true);

create policy "Users read their own demo tasks"
  on public.demo_tasks for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Users insert their own demo tasks"
  on public.demo_tasks for insert to authenticated
  with check ((select auth.uid()) = owner_id);

insert into public.demo_projects(name)
  values ('Presentation research'), ('Tutorial preparation');

commit;
