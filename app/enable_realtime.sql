-- Upgrade an existing concept project. Safe to run again.
-- Does not recreate tables, delete records or weaken RLS.
begin;
do $$
begin
 if to_regclass('public.demo_tasks') is null then
  raise exception 'demo_tasks is missing. For a NEW project run setup.sql first.';
 end if;
 if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
  raise exception 'supabase_realtime publication is missing. Check project configuration.';
 end if;
 if not exists (select 1 from pg_publication_tables
   where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'demo_tasks') then
  alter publication supabase_realtime add table public.demo_tasks;
 end if;
end $$;
commit;
-- Expected: a row for public.demo_tasks.
select pubname, schemaname, tablename from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'demo_tasks';
