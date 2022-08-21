export function getRealUTCDate(num: number) {
  return new Date(num * 1000 + 978307199468)
}

export function getLocalDate(date: Date) {
  return new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000)
}

export function getLocalDateFromDB(num: number) {
  return new Date(
    num * 1000 + 978307199468 - new Date().getTimezoneOffset() * 60 * 1000
  )
}
