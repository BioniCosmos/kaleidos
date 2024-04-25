import ShortUniqueId from 'https://esm.sh/short-unique-id@5.0.3'
import { useRef } from 'preact/hooks'
import type { UploadEventMap } from './UploadEvent.ts'

export function redirect(path: string) {
  return new Response(null, {
    status: 303,
    headers: { Location: encodeURI(path) },
  })
}

export interface Timestamp {
  year: string
  month: string
  day: string
  time: number
}

export function getTime(date = new Date()): Timestamp {
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const time = date.getTime()
  return { year, month, day, time }
}

export const randomId = new ShortUniqueId().randomUUID

export function sendJSON(
  target: 'album' | 'image',
  method: string,
  value: unknown
) {
  return () =>
    fetch(`/${target}`, {
      method,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(value),
    }).then((value) => location.assign(value.url))
}

export function setToArray<T>(set: Set<T>) {
  return Array.from(set.values())
}

// References:
// https://github.com/Tinkerforge/esp32-firmware/blob/d5f5c2e760dacaff7804304e7655982be779498d/software/web/src/ts/util.ts#L599
// https://jser.dev/2023-04-25-how-does-useid-work/
let _id = 0
export function useId() {
  return useRef(`KRI-${_id++}`).current
}

export function getProgress(
  processProgress: UploadEventMap['progress'] | null,
  transferProgress?: Pick<ProgressEvent, 'loaded' | 'total'> | null,
  round = false
) {
  const getPercent = (percent: number): `${number}%` =>
    `${round ? Math.round(percent) : percent}%`

  const { completed: processCompleted, total: processTotal } =
    processProgress ?? { completed: 0, total: 1 }
  if (transferProgress === undefined) {
    const percent = (processCompleted / processTotal) * 100
    return getPercent(percent)
  }

  const { loaded: transferLoaded, total: transferTotal } = transferProgress ?? {
    loaded: 0,
    total: 1,
  }
  const percent =
    (transferLoaded / transferTotal) * 50 +
    (processCompleted / processTotal) * 50
  return getPercent(percent)
}
