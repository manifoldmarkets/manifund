-- Drop get_user_balances: broken since profiles.id became uuid (the function
-- still declared `id integer`, so every call errored) and no longer referenced
-- anywhere — the MCP server now computes balances via calculateUserBalance.

drop function if exists public.get_user_balances();
