import { walk } from '$std/fs/mod.ts'
import { hash } from 'argon2'
import { Client } from 'https://deno.land/x/mysql@v2.12.1/mod.ts'
import { ImagePath } from './ImagePath.ts'
import { type Album, type Image, type User } from './db.ts'
import { State } from './routes/_middleware.ts'
import { getTime } from './utils.ts'

console.log('Starting the migration…')

const client = await new Client().connect({
  password: '123456',
  db: 'chevereto',
})
const { db } = new State(null, false)

console.log('Databases connected')

interface OriginalUser {
  user_username: string
  user_name: string | null
  user_is_admin: boolean
}

const defaultPassword = hash('123456')

const users: User[] = (
  (await client.query('SELECT * FROM chv_users')) as OriginalUser[]
).map(({ user_username: id, user_name, user_is_admin: isAdmin }) => {
  return {
    id,
    password: defaultPassword,
    name: user_name ?? '',
    isAdmin,
  } satisfies User
})

users.forEach((user) => {
  db.query('INSERT INTO users VALUES (:id, :password, :name, :isAdmin)', user)
})

interface OriginalAlbum {
  album_id: number
  album_name: string
  album_user_id: number
}

const albums: Album[] = await Promise.all(
  ((await client.query('SELECT * FROM chv_albums')) as OriginalAlbum[]).map(
    async ({ album_id: id, album_name: name, album_user_id }) => {
      const userId = await findUserNameById(album_user_id)
      return { id, name, userId } satisfies Album
    }
  )
)

albums.forEach((album) => {
  db.query('INSERT INTO albums VALUES (:id, :name, :userId)', album)
})

interface OriginalImage {
  image_id: number
  image_name: string
  image_extension: string
  image_date: Date
  image_user_id: number
  image_album_id: number
  image_size: number
}

const images: Image[] = await Promise.all(
  ((await client.query('SELECT * FROM chv_images')) as OriginalImage[]).map(
    async ({
      image_id: id,
      image_name: name,
      image_extension: ext,
      image_date,
      image_user_id,
      image_album_id: albumId,
      image_size: size,
    }) => {
      const time = getTime(image_date)
      const date = time.time
      const userId = await findUserNameById(image_user_id)
      const path = (await ImagePath.from(`${name}.${ext}`, time)).toString()
      return {
        id,
        name,
        ext,
        date,
        userId,
        albumId,
        path,
        size,
      } satisfies Image
    }
  )
)

images.forEach((image) => {
  db.query(
    `
    INSERT INTO images VALUES (
      :id,
      :name,
      :ext,
      :date,
      :userId,
      :albumId,
      :path,
      :size
    )
    `,
    image
  )
})

await client.close()
db.close()

console.log('Database migration successful')

for await (const entry of walk('images/raw/', {
  match: [/\.(md|th)\./, /\.fasthttp\.gz/, /\.htaccess/],
})) {
  await Deno.remove(entry.path)
}

const emptyDirs = Array.of<string>()
for await (const entry of walk('images/raw/')) {
  if (
    entry.isDirectory &&
    (await Array.fromAsync(Deno.readDir(entry.path))).length === 0
  ) {
    emptyDirs.push(entry.path)
  }
}
await Promise.all(emptyDirs.map((emptyDir) => Deno.remove(emptyDir)))

console.log('Cache cleaned')
console.log('Done.')

async function findUserNameById(userId: number) {
  return (
    (await client.query(
      'SELECT user_username FROM chv_users WHERE user_id = ?',
      [userId]
    )) as Pick<OriginalUser, 'user_username'>[]
  )[0].user_username
}
