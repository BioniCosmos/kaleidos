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
