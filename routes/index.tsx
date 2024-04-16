import { type PageProps } from '$fresh/server.ts'
import Albums from '../islands/Albums.tsx'
import { type Album } from '../lib/db.ts'
import type { State } from './_middleware.ts'

export default function Index({ state }: PageProps<unknown, State>) {
  const { db, user } = state
  const { id: userId } = user

  const albums = db.queryEntries<Album>(
    'SELECT * FROM albums WHERE userId = :userId',
    { userId }
  )
  return <Albums albums={albums} />
}
