-- Table already exists, skip creation
-- create table if not exists public.rewrite_versions (...existing...);

-- Create index for better query performance
create index if not exists idx_rewrite_versions_job_id on public.rewrite_versions (job_id);
create index if not exists idx_rewrite_versions_version_number on public.rewrite_versions (job_id, version_number desc);

-- Enable RLS
alter table public.rewrite_versions enable row level security;

-- Create additional RLS policies (insert policy already exists)
-- Add select policy if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'rewrite_versions' 
    and policyname = 'Users can view rewrite versions for their own reports'
  ) then
    create policy "Users can view rewrite versions for their own reports" on public.rewrite_versions
      for select
      using (
        job_id in (
          select id from public.reports 
          where userid = auth.uid()
        )
      );
  end if;
end $$;

-- Add update policy if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'rewrite_versions' 
    and policyname = 'Users can update rewrite versions for their own reports'
  ) then
    create policy "Users can update rewrite versions for their own reports" on public.rewrite_versions
      for update
      using (
        job_id in (
          select id from public.reports 
          where userid = auth.uid()
        )
      );
  end if;
end $$;

-- Add delete policy if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'rewrite_versions' 
    and policyname = 'Users can delete rewrite versions for their own reports'
  ) then
    create policy "Users can delete rewrite versions for their own reports" on public.rewrite_versions
      for delete
      using (
        job_id in (
          select id from public.reports 
          where userid = auth.uid()
        )
      );
  end if;
end $$;

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on public.rewrite_versions to anon, authenticated;
grant usage, select on sequence public.rewrite_versions_version_number_seq to anon, authenticated;
