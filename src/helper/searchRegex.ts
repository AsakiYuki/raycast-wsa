export function safeSearchRegex(search: string) {
	search = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
	return new RegExp(`(^${search})|( ${search})`, "i")
}
