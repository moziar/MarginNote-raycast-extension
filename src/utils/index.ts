export * from "./date"
export * from "./applescript"
export * from "./raycast"

export function escapeDoubleQuote(str: string) {
  return str.replace(/"/g, `\\"`)
}

export const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr))
