// One-time production seed. Uses the Admin SDK (a service account key),
// which bypasses firestore.rules entirely — the whole reason this is a
// separate script instead of reusing the client-side seedIfEmpty() that
// localProvider uses: real security rules correctly reject an anonymous
// client trying to write another user's data, seed data included.
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json npx tsx scripts/seedFirestore.ts
//
// Get serviceAccountKey.json from the Firebase console: Project Settings
// -> Service Accounts -> Generate new private key. Never commit it
// (covered by .gitignore's serviceAccountKey*.json pattern).

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import {
  buildSeedImages,
  seedDealerProfiles,
  seedListingSpecs,
  seedTradeSubmissions,
  seedUsers,
} from '../src/lib/db/seed'

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!credentialsPath) {
  console.error(
    'Missing GOOGLE_APPLICATION_CREDENTIALS. Usage:\n' +
      '  GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json npx tsx scripts/seedFirestore.ts',
  )
  process.exit(1)
}

initializeApp({ credential: cert(credentialsPath) })
const db = getFirestore()

async function main() {
  const metaRef = db.doc('meta/status')
  const meta = await metaRef.get()
  if (meta.exists && meta.data()?.seeded) {
    console.log('Already seeded (meta/status.seeded is true) — nothing to do.')
    return
  }

  const batch = db.batch()

  for (const user of seedUsers) batch.set(db.doc(`users/${user.id}`), user)
  for (const profile of seedDealerProfiles) {
    batch.set(db.doc(`dealerProfiles/${profile.userId}`), profile)
  }
  for (const spec of seedListingSpecs) {
    batch.set(db.doc(`carfaxReports/${spec.carfax.id}`), spec.carfax)
  }
  for (const spec of seedListingSpecs) {
    const primaryImageId = spec.images.length > 0 ? `img-${spec.listing.id}-0` : null
    batch.set(db.doc(`listings/${spec.listing.id}`), { ...spec.listing, primaryImageId })
  }
  for (const image of buildSeedImages()) {
    batch.set(db.doc(`images/${image.id}`), image)
  }
  for (const submission of seedTradeSubmissions) {
    batch.set(db.doc(`tradeSubmissions/${submission.id}`), submission)
  }
  batch.set(metaRef, { seeded: true })

  await batch.commit()
  console.log(
    `Seeded ${seedUsers.length} users, ${seedDealerProfiles.length} dealer profiles, ` +
      `${seedListingSpecs.length} listings, ${seedTradeSubmissions.length} trade submissions.`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
