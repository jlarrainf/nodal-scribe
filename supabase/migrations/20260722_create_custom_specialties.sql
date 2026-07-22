create table if not exists public.custom_specialties (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	name text not null,
	base_template text not null default 'general_soap',
	fields jsonb not null default '[]'::jsonb,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.custom_specialties enable row level security;

drop policy if exists "custom_specialties_select_own" on public.custom_specialties;
create policy "custom_specialties_select_own"
	on public.custom_specialties
	for select
	using (auth.uid() = user_id);

drop policy if exists "custom_specialties_insert_own" on public.custom_specialties;
create policy "custom_specialties_insert_own"
	on public.custom_specialties
	for insert
	with check (auth.uid() = user_id);

drop policy if exists "custom_specialties_update_own" on public.custom_specialties;
create policy "custom_specialties_update_own"
	on public.custom_specialties
	for update
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

drop policy if exists "custom_specialties_delete_own" on public.custom_specialties;
create policy "custom_specialties_delete_own"
	on public.custom_specialties
	for delete
	using (auth.uid() = user_id);

create or replace function public.set_custom_specialties_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists set_custom_specialties_updated_at on public.custom_specialties;
create trigger set_custom_specialties_updated_at
	before update on public.custom_specialties
	for each row
	execute function public.set_custom_specialties_updated_at();
