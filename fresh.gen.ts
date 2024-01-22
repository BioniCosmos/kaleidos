// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_app from "./routes/_app.tsx";
import * as $_middleware from "./routes/_middleware.tsx";
import * as $album_id_ from "./routes/album/[id].tsx";
import * as $album_index from "./routes/album/index.tsx";
import * as $error from "./routes/error.tsx";
import * as $image_id_ from "./routes/image/[id].tsx";
import * as $image_index from "./routes/image/index.ts";
import * as $images from "./routes/images.ts";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";

import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_app.tsx": $_app,
    "./routes/_middleware.tsx": $_middleware,
    "./routes/album/[id].tsx": $album_id_,
    "./routes/album/index.tsx": $album_index,
    "./routes/error.tsx": $error,
    "./routes/image/[id].tsx": $image_id_,
    "./routes/image/index.ts": $image_index,
    "./routes/images.ts": $images,
    "./routes/index.tsx": $index,
    "./routes/login.tsx": $login,
  },
  islands: {},
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
