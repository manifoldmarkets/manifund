-- Transfer the Falcon Fund project (and its past txns) from Marcus Abramovitch's
-- personal account to the dedicated fund account (falcon@manifund.org).
--
-- Project:        ebbcd92e-e49f-c4ea-b69f-cb38fc9313fd  (falcon-fund)
-- Old owner:      b11620f2-fdc7-414c-8a63-9ddee17ee669  (MarcusAbramovitch)
-- New owner:      03df2bff-4bb5-436c-9b2d-9bbdf5efc2ed  (falcon-fund / falcon@manifund.org)
--
-- Moves: project ownership, the 15 incoming donation txns ($40,525 of cash
-- balance), and the 10M-share mint cert txn. Intentionally left alone: the
-- signed grant agreement (names Marcus personally), Marcus's comments, and his
-- $7.5k regrantor grant to Tarbell (not a Falcon Fund grant).
--
-- To reverse: re-run the same three UPDATEs with the two profile ids swapped.

do $$
declare
  n int;
begin
  update projects
  set creator = '03df2bff-4bb5-436c-9b2d-9bbdf5efc2ed'
  where id = 'ebbcd92e-e49f-c4ea-b69f-cb38fc9313fd'
    and creator = 'b11620f2-fdc7-414c-8a63-9ddee17ee669';
  get diagnostics n = row_count;
  assert n = 1, format('expected to update 1 project, got %s', n);

  update txns
  set to_id = '03df2bff-4bb5-436c-9b2d-9bbdf5efc2ed'
  where project = 'ebbcd92e-e49f-c4ea-b69f-cb38fc9313fd'
    and type = 'project donation'
    and to_id = 'b11620f2-fdc7-414c-8a63-9ddee17ee669';
  get diagnostics n = row_count;
  assert n = 15, format('expected to update 15 donation txns, got %s', n);

  update txns
  set to_id = '03df2bff-4bb5-436c-9b2d-9bbdf5efc2ed'
  where project = 'ebbcd92e-e49f-c4ea-b69f-cb38fc9313fd'
    and type = 'mint cert'
    and to_id = 'b11620f2-fdc7-414c-8a63-9ddee17ee669';
  get diagnostics n = row_count;
  assert n = 1, format('expected to update 1 mint cert txn, got %s', n);
end $$;
