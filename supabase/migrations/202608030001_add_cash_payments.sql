alter table public.orders
  add column if not exists cash_paid boolean not null default false;

alter table public.orders
  drop constraint if exists orders_single_payment_method;

alter table public.orders
  add constraint orders_single_payment_method
  check (not (venmo_paid and cash_paid));
