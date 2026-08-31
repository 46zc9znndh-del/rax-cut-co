-- RAX Cut Co. — full Supabase schema
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.orders (
  id text primary key,
  order_number text not null unique,
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  status text not null check (status in ('paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  customer_email text not null,
  customer_name text,
  customer_phone text,
  shipping_address jsonb,
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  shipping numeric(10, 2) not null,
  total numeric(10, 2) not null,
  currency text not null default 'USD',
  tracking_number text,
  admin_notes text,
  confirmation_email_sent_at timestamptz,
  admin_email_sent_at timestamptz,
  shipped_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_state (key, value)
values ('orders', '{"nextOrderNumber": 1001}'::jsonb)
on conflict (key) do nothing;

create table if not exists public.cms_documents (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.app_state enable row level security;
alter table public.cms_documents enable row level security;

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = excluded.public;

-- Server uses SUPABASE_SECRET_KEY (bypasses RLS). No public table policies needed.
