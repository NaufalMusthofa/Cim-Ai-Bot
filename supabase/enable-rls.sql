begin;

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.subscriptions enable row level security;
alter table public.followup_jobs enable row level security;
alter table public.webhook_events enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists contacts_select_own on public.contacts;
drop policy if exists contacts_insert_own on public.contacts;
drop policy if exists contacts_update_own on public.contacts;
drop policy if exists contacts_delete_own on public.contacts;

create policy contacts_select_own
on public.contacts
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = contacts.profile_id
      and profiles.id = (select auth.uid())
  )
);

create policy contacts_insert_own
on public.contacts
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy contacts_update_own
on public.contacts
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy contacts_delete_own
on public.contacts
for delete
to authenticated
using (profile_id = (select auth.uid()));

drop policy if exists conversations_select_own on public.conversations;
drop policy if exists conversations_insert_own on public.conversations;
drop policy if exists conversations_update_own on public.conversations;
drop policy if exists conversations_delete_own on public.conversations;

create policy conversations_select_own
on public.conversations
for select
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = conversations.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy conversations_insert_own
on public.conversations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.contacts
    where contacts.id = conversations.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy conversations_update_own
on public.conversations
for update
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = conversations.contact_id
      and contacts.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.contacts
    where contacts.id = conversations.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy conversations_delete_own
on public.conversations
for delete
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = conversations.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

drop policy if exists messages_select_own on public.messages;
drop policy if exists messages_insert_own on public.messages;
drop policy if exists messages_update_own on public.messages;
drop policy if exists messages_delete_own on public.messages;

create policy messages_select_own
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = messages.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy messages_insert_own
on public.messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.contacts
    where contacts.id = messages.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy messages_update_own
on public.messages
for update
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = messages.contact_id
      and contacts.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.contacts
    where contacts.id = messages.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy messages_delete_own
on public.messages
for delete
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = messages.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

drop policy if exists memories_select_own on public.memories;
drop policy if exists memories_insert_own on public.memories;
drop policy if exists memories_update_own on public.memories;
drop policy if exists memories_delete_own on public.memories;

create policy memories_select_own
on public.memories
for select
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = memories.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy memories_insert_own
on public.memories
for insert
to authenticated
with check (
  exists (
    select 1
    from public.contacts
    where contacts.id = memories.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy memories_update_own
on public.memories
for update
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = memories.contact_id
      and contacts.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.contacts
    where contacts.id = memories.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy memories_delete_own
on public.memories
for delete
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = memories.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

drop policy if exists subscriptions_select_own on public.subscriptions;
drop policy if exists subscriptions_insert_own on public.subscriptions;
drop policy if exists subscriptions_update_own on public.subscriptions;
drop policy if exists subscriptions_delete_own on public.subscriptions;

create policy subscriptions_select_own
on public.subscriptions
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy subscriptions_insert_own
on public.subscriptions
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy subscriptions_update_own
on public.subscriptions
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy subscriptions_delete_own
on public.subscriptions
for delete
to authenticated
using (profile_id = (select auth.uid()));

drop policy if exists followup_jobs_select_own on public.followup_jobs;
drop policy if exists followup_jobs_insert_own on public.followup_jobs;
drop policy if exists followup_jobs_update_own on public.followup_jobs;
drop policy if exists followup_jobs_delete_own on public.followup_jobs;

create policy followup_jobs_select_own
on public.followup_jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = followup_jobs.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy followup_jobs_insert_own
on public.followup_jobs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.contacts
    where contacts.id = followup_jobs.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy followup_jobs_update_own
on public.followup_jobs
for update
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = followup_jobs.contact_id
      and contacts.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.contacts
    where contacts.id = followup_jobs.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

create policy followup_jobs_delete_own
on public.followup_jobs
for delete
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = followup_jobs.contact_id
      and contacts.profile_id = (select auth.uid())
  )
);

drop policy if exists webhook_events_select_own on public.webhook_events;
drop policy if exists webhook_events_insert_own on public.webhook_events;
drop policy if exists webhook_events_update_own on public.webhook_events;
drop policy if exists webhook_events_delete_own on public.webhook_events;

create policy webhook_events_select_own
on public.webhook_events
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy webhook_events_insert_own
on public.webhook_events
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy webhook_events_update_own
on public.webhook_events
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy webhook_events_delete_own
on public.webhook_events
for delete
to authenticated
using (profile_id = (select auth.uid()));

commit;
