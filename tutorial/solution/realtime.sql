-- Step 8 of the Group B Supabase tutorial: let Realtime see new rows in demo_tasks.
alter publication supabase_realtime add table public.demo_tasks;

-- Check: this should return one row.
select pubname, schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime' and tablename = 'demo_tasks';
