export function safeStringRegex(search: string) {
  return search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function safeSearchRegex(search: string) {
  search = safeStringRegex(search);
  return new RegExp(`(^${search})|( ${search})`, "i");
}
