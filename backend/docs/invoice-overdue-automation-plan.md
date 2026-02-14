# Invoice Overdue Automation Plan

## Goal
Automatically move invoices from `SENT` to `OVERDUE` when `dueDate` passes, while preserving strict tenant isolation and auditability.

## Recommended approach
1. Run a scheduled job every 15 minutes (cron/worker).
2. Execute scoped batched updates keyed by `organizationId` then `id`:
   - iterate organizations in stable order
   - within each organization, update in `id` batches (cursor pagination)
   - `status = OVERDUE`
   - where `status = SENT` and `dueDate < now()`.
3. Write audit events for each affected invoice transition (`SENT -> OVERDUE`) with timestamp and actor `system`.

## Operational safeguards
1. Keep updates idempotent by filtering only `status = SENT`.
2. Use tenant-first batching (`organizationId` -> `id`) to avoid long global locks.
3. Add metrics:
   - number of invoices transitioned
   - last successful run time
   - job duration / failures
4. Alert if job has not completed successfully within expected interval.

## Future integration points
1. Trigger notification workflow when invoice becomes overdue.
2. Optional grace period support per organization (`dueDate + graceDays`).
