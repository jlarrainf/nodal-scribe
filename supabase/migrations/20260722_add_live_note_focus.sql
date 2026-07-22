alter table public.profiles
	add column if not exists live_note_focus text not null default '';
