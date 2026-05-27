-- Arthilles - Simple WhatsApp Bot MVP
-- Run this in Supabase SQL Editor (free plan)

create extension if not exists "pgcrypto";

-- Companies (simple - one company for MVP)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz default now()
);

-- Admin users
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  email text unique not null,
  password_hash text not null,
  role text default 'admin',
  created_at timestamptz default now()
);

-- Clients who talked to the bot
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  full_name text,
  phone text not null,
  created_at timestamptz default now(),
  unique (company_id, phone)
);

-- All messages (inbound + outbound)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  phone text not null,
  direction text check (direction in ('inbound','outbound')),
  body text not null,
  created_at timestamptz default now()
);

-- Appointments collected by the bot
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  client_id uuid references public.clients(id),
  service text,
  preferred_date text,
  preferred_time text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Unknown questions (for human follow-up)
create table if not exists public.unknown_questions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  phone text not null,
  question text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Simple bot session state (for multi-turn like appointment collection)
create table if not exists public.conversation_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  phone text not null,
  state text default 'greeting',
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique (company_id, phone)
);

-- Seed one demo company
insert into public.companies (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Minha Empresa', 'minha-empresa')
on conflict (id) do nothing;

-- Seed admin (password will be set via AUTH_SECRET + ADMIN_PASSWORD in backend)
-- You will create the real hash via the backend or update manually after first deploy
insert into public.app_users (company_id, email, password_hash, role)
values (
  '00000000-0000-0000-0000-000000000001',
  'admin@arthilles.local',
  'REPLACE_AFTER_DEPLOY',
  'admin'
)
on conflict (email) do nothing;

-- Basic indexes
create index if not exists idx_messages_company on public.messages(company_id, created_at desc);
create index if not exists idx_appointments_company on public.appointments(company_id, created_at desc);
create index if not exists idx_unknown_company on public.unknown_questions(company_id, created_at desc);
create index if not exists idx_sessions_phone on public.conversation_sessions(company_id, phone);
