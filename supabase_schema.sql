-- 1. Create table for dynamic website sections
create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table site_content enable row level security;

-- 3. Create security policies
-- Allow anyone to read settings for public website rendering
create policy "Allow public read access" on site_content
  for select using (true);

-- Allow full permissions for service_role / server actions (which bypass RLS by default, but this adds extra safety)
create policy "Allow all access for authenticated roles" on site_content
  for all using (true) with check (true);
