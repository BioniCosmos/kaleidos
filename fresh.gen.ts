// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_app from "./routes/_app.tsx";
import * as $_layout from "./routes/_layout.tsx";
import * as $_middleware from "./routes/_middleware.ts";
import * as $album_id_ from "./routes/album/[id].tsx";
import * as $album_index from "./routes/album/index.ts";
import * as $error from "./routes/error.tsx";
import * as $image_id_ from "./routes/image/[id].tsx";
import * as $image_index from "./routes/image/index.ts";
import * as $images from "./routes/images.ts";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $logout from "./routes/logout.ts";
import * as $settings_index from "./routes/settings/index.tsx";
import * as $settings_password from "./routes/settings/password.ts";
import * as $settings_profile from "./routes/settings/profile.ts";
import * as $AlbumInfo from "./islands/AlbumInfo.tsx";
import * as $Albums from "./islands/Albums.tsx";
import * as $DeleteSelection from "./islands/DeleteSelection.tsx";
import * as $ImageInfo from "./islands/ImageInfo.tsx";
import * as $ImageLink from "./islands/ImageLink.tsx";
import * as $Images from "./islands/Images.tsx";
import * as $NewAlbum from "./islands/NewAlbum.tsx";
import * as $UploadImage from "./islands/UploadImage.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_app.tsx": $_app,
    "./routes/_layout.tsx": $_layout,
    "./routes/_middleware.ts": $_middleware,
    "./routes/album/[id].tsx": $album_id_,
    "./routes/album/index.ts": $album_index,
    "./routes/error.tsx": $error,
    "./routes/image/[id].tsx": $image_id_,
    "./routes/image/index.ts": $image_index,
    "./routes/images.ts": $images,
    "./routes/index.tsx": $index,
    "./routes/login.tsx": $login,
    "./routes/logout.ts": $logout,
    "./routes/settings/index.tsx": $settings_index,
    "./routes/settings/password.ts": $settings_password,
    "./routes/settings/profile.ts": $settings_profile,
  },
  islands: {
    "./islands/AlbumInfo.tsx": $AlbumInfo,
    "./islands/Albums.tsx": $Albums,
    "./islands/DeleteSelection.tsx": $DeleteSelection,
    "./islands/ImageInfo.tsx": $ImageInfo,
    "./islands/ImageLink.tsx": $ImageLink,
    "./islands/Images.tsx": $Images,
    "./islands/NewAlbum.tsx": $NewAlbum,
    "./islands/UploadImage.tsx": $UploadImage,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
