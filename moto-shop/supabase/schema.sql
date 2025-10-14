-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- Profiles (user metadata)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Customers
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  owner uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;
create policy "Customers are viewable by owner" on public.customers
  for select using (auth.uid() = owner);
create policy "Customers are insertable by owner" on public.customers
  for insert with check (auth.uid() = owner);
create policy "Customers are updatable by owner" on public.customers
  for update using (auth.uid() = owner);
create policy "Customers are deletable by owner" on public.customers
  for delete using (auth.uid() = owner);

-- Products (parts, gear)
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  owner uuid not null references auth.users(id) on delete cascade,
  sku text unique,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  cost_cents integer check (cost_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
create policy "Products are viewable by owner" on public.products
  for select using (auth.uid() = owner);
create policy "Products are insertable by owner" on public.products
  for insert with check (auth.uid() = owner);
create policy "Products are updatable by owner" on public.products
  for update using (auth.uid() = owner);
create policy "Products are deletable by owner" on public.products
  for delete using (auth.uid() = owner);

-- Services (labor items)
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  owner uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  rate_cents integer not null check (rate_cents >= 0),
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;
create policy "Services are viewable by owner" on public.services
  for select using (auth.uid() = owner);
create policy "Services are insertable by owner" on public.services
  for insert with check (auth.uid() = owner);
create policy "Services are updatable by owner" on public.services
  for update using (auth.uid() = owner);
create policy "Services are deletable by owner" on public.services
  for delete using (auth.uid() = owner);

-- Quotes
create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  owner uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  status text not null check (status in ('draft','sent','approved','rejected','converted')) default 'draft',
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.quotes enable row level security;
create policy "Quotes are viewable by owner" on public.quotes
  for select using (auth.uid() = owner);
create policy "Quotes are insertable by owner" on public.quotes
  for insert with check (auth.uid() = owner);
create policy "Quotes are updatable by owner" on public.quotes
  for update using (auth.uid() = owner);
create policy "Quotes are deletable by owner" on public.quotes
  for delete using (auth.uid() = owner);

-- Quote line items (products or services)
create table if not exists public.quote_items (
  id uuid primary key default uuid_generate_v4(),
  owner uuid not null references auth.users(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  item_type text not null check (item_type in ('product','service')),
  item_id uuid not null,
  description text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0)
);

alter table public.quote_items enable row level security;
create policy "Quote items are viewable by owner" on public.quote_items
  for select using (auth.uid() = owner);
create policy "Quote items are insertable by owner" on public.quote_items
  for insert with check (auth.uid() = owner);
create policy "Quote items are updatable by owner" on public.quote_items
  for update using (auth.uid() = owner);
create policy "Quote items are deletable by owner" on public.quote_items
  for delete using (auth.uid() = owner);

-- Orders (from converted quotes)
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  owner uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  status text not null check (status in ('open','paid','cancelled')) default 'open',
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
create policy "Orders are viewable by owner" on public.orders
  for select using (auth.uid() = owner);
create policy "Orders are insertable by owner" on public.orders
  for insert with check (auth.uid() = owner);
create policy "Orders are updatable by owner" on public.orders
  for update using (auth.uid() = owner);
create policy "Orders are deletable by owner" on public.orders
  for delete using (auth.uid() = owner);

-- Payments
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  owner uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  method text not null check (method in ('cash','card','bank','other')),
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;
create policy "Payments are viewable by owner" on public.payments
  for select using (auth.uid() = owner);
create policy "Payments are insertable by owner" on public.payments
  for insert with check (auth.uid() = owner);

-- Helper function to keep quote totals in sync
create or replace function public.recalculate_quote_totals() returns trigger as $$
declare
  v_subtotal integer;
  v_tax integer;
  v_total integer;
begin
  select coalesce(sum(line_total_cents), 0) into v_subtotal from public.quote_items where quote_id = new.quote_id;
  v_tax := (v_subtotal * 10) / 100; -- 10% tax example
  v_total := v_subtotal + v_tax;
  update public.quotes set subtotal_cents = v_subtotal, tax_cents = v_tax, total_cents = v_total where id = new.quote_id;
  return null;
end;
$$ language plpgsql;

create trigger quote_items_after_change
after insert or update or delete on public.quote_items
for each row execute function public.recalculate_quote_totals();
