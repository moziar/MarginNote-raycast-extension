import { useEffect, useState } from "react"
import { MNDatebase, loadDatabase } from "../utils"

export function useDatebase(): [MNDatebase | undefined, Error | undefined] {
  const [database, setDatabase] = useState<MNDatebase>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const connect = async () => {
      try {
        setDatabase(await loadDatabase())
      } catch {
        setError(
          new Error(
            "Couldn't load MarginNote database. Make sure you have MarginNote installed."
          )
        )
      }
    }
    connect()

    return () => database?.close()
  }, [])

  return [database, error]
}
