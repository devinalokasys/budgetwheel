// No auth flow exists yet (see docs/db-design.md's "Not yet done"), so the
// app runs as a fixed demo identity rather than a real logged-in user.
// These match the seeded users in src/lib/db/seed.ts.
export const CURRENT_CONSUMER_ID = 'user-private-1'
export const CURRENT_DEALER_ID = 'user-dealer-1'
