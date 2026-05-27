-- Arthilles - Simple WhatsApp Bot MVP (v1)
-- Cole este arquivo inteiro no SQL Editor do Supabase e execute.

create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz default now()
);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  email text unique not null,
  password_hash text not null,
  role text default 'admin',
  created_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  full_name text,
  phone text not null,
  created_at timestamptz default now(),
  unique (company_id, phone)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  phone text not null,
  direction text check (direction in ('inbound','outbound')),
  body text not null,
  created_at timestamptz default now()
);

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

create table if not exists public.unknown_questions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  phone text not null,
  question text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.conversation_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  phone text not null,
  state text default 'greeting',
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique (company_id, phone)
);

-- Evolution API settings (Opção A - credenciais salvas no painel)
create table if not exists public.evolution_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  api_url text,
  api_key text,
  instance_name text,
  updated_at timestamptz default now()
);

insert into public.companies (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Minha Empresa', 'minha-empresa')
on conflict (id) do nothing;

-- O admin será criado no primeiro login usando ADMIN_EMAIL + ADMIN_PASSWORD do .env
-- (o backend faz a comparação direta no MVP para máxima simplicidade)

create index if not exists idx_messages_company on public.messages(company_id, created_at desc);
create index if not exists idx_appointments_company on public.appointments(company_id, created_at desc);
create index if not exists idx_unknown_company on public.unknown_questions(company_id, created_at desc);
create index if not exists idx_sessions on public.conversation_sessions(company_id, phone);
