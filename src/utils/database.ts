import { readFileSync } from "fs"
import path from "path"
import { homedir } from "os"
import { environment } from "@raycast/api"
import initSqlJs, { Database } from "sql.js"
import { getLocalDateFromDB } from "./date"

export interface Note {
  id: string
  title: string
  text: string
  modifiedAt: Date
  tags: string[]
  encrypted: boolean
  formattedTags: string
}

const MN_DB_PATH = `${homedir()}/Library/Containers/QReader.MarginStudyMac/Data/Library/Application Support/QReader.MarginNoteMac/MarginNotes.sqlite`

export async function loadDatabase() {
  const wasmBinary = readFileSync(
    path.join(environment.assetsPath, "sql-wasm.wasm")
  )
  const SQL = await initSqlJs({ wasmBinary })
  const db = readFileSync(MN_DB_PATH)
  return new MNDatebase(new SQL.Database(db))
}

export class MNDatebase {
  db: Database

  constructor(database: Database) {
    this.db = database
  }

  close() {
    this.db.close()
  }

  getNotebook(id: string) {
    const stmt = this.db.prepare(
      `SELECT ZTOPICID,ZTITLE,ZLASTVISIT,ZDATE,ZTAGLIST FROM ZTOPIC WHERE ZTOPICID='${id}'`
    )
    let res: any
    while (stmt.step()) res = stmt.getAsObject()
    stmt.free()
    if (!res) return undefined
    return {
      id: res.ZTOPICID,
      title: res.ZTITLE,
      lastVisit: getLocalDateFromDB(res.ZLASTVISIT),
      created: getLocalDateFromDB(res.ZDATE),
      tags:
        res.ZTAGLIST?.split("|").map((k: string) => {
          const stmt = this.db.prepare(
            `SELECT ZTAGNAME FROM ZBOOKTAG WHERE ZTAGID='${k}'`
          )
          let res: any
          while (stmt.step()) {
            res = (stmt.getAsObject()?.ZTAGNAME as string).replace(/^.*\$/, "")
          }
          stmt.free()
          return res
        }) ?? []
    }
  }
}
