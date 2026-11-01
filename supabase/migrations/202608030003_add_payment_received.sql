alter table public.orders
  add column if not exists payment_received boolean not null default false;

update public.orders
set payment_received = true
where venmo_paid = true or cash_paid = true;
