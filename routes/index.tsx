import { type PageProps } from '$fresh/server.ts'
import { db, type Album } from '../db.ts'
import Albums from '../islands/Albums.tsx'
import type { State } from './_middleware.tsx'

export default function Index({ state }: PageProps<unknown, State>) {
  const { id: userId } = state.user
  const albums = db.queryEntries<Album>(
    'SELECT * FROM albums WHERE userId = :userId',
    { userId }
  )
  return <Albums albums={albums} />
}
