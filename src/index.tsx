import {
  ActionPanel,
  List,
  LocalStorage,
  closeMainWindow,
  Icon,
  Action,
  open
} from "@raycast/api"
import { useEffect, useState } from "react"
import { runAppleScript } from "run-applescript"
import Database from "better-sqlite3"
import os from "os"
import { State } from "./typing"
import { getLocalDateFromDB } from "./utils"
const dbOpt = {
  fileMustExist: true,
  readonly: true
  //   verbose: console.log
}

const mndb = new Database(
  `${os.homedir()}/Library/Containers/QReader.MarginStudyMac/Data/Library/Application Support/QReader.MarginNoteMac/MarginNotes.sqlite`,
  dbOpt
)

export default function Command() {
  const [state, setState] = useState<State>({
    notebooks: [],
    loading: true
  })

  function getNotebookInfo(result: string) {
    const ids = result.split(", ")

    setState({
      notebooks: ids.map(k => {
        const res = mndb
          .prepare(`SELECT * FROM ZTOPIC WHERE ZTOPICID='${k}'`)
          .get()
        return {
          id: res.ZTOPICID,
          title: res.ZTITLE,
          lastVisit: getLocalDateFromDB(res.ZLASTVISIT),
          created: getLocalDateFromDB(res.ZDATE),
          tags:
            res.ZTAGLIST?.split("|").map((k: string) => {
              const tag = mndb
                .prepare(`SELECT ZTAGNAME FROM ZBOOKTAG WHERE ZTAGID='${k}'`)
                .get()?.ZTAGNAME
              return tag?.replace(/^.*\$/, "")
            }) ?? []
        }
      }),
      loading: false
    })
  }

  async function checkCachedNotebook() {
    const cachedNotebook = (await LocalStorage.getItem("mnnotebooks")) as string
    if (cachedNotebook) getNotebookInfo(cachedNotebook)
    fetchItems()
  }

  async function fetchItems() {
    const script = `
      tell application "MarginNote 3"
        set res to {}
        set nbs to (search notebook "" type MindMapNotebook)
        repeat with n in nbs
          set end of res to (id) of n
        end repeat
        return res
      end tell
    `
    const res = await runAppleScript(script)
    getNotebookInfo(res)

    // setState({ notebookids, loading: false })
    // await LocalStorage.setItem("mnnotebooks", res)
  }

  async function openNote(id: string) {
    await closeMainWindow()
    open(`marginnote3app://notebook/${id}`)
  }

  useEffect(() => {
    // checkCachedNotebook()
    fetchItems()
  }, [])

  return (
    <List isLoading={state.loading}>
      {state.notebooks.map((k, i) => (
        <List.Item
          key={i}
          icon="marginnote.png"
          title={k.title}
          actions={
            <ActionPanel title="Actions">
              <Action
                title="Open in MarginNote"
                icon={Icon.BlankDocument}
                onAction={() => openNote(k.id)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
