import {
  ActionPanel,
  List,
  closeMainWindow,
  Icon,
  Action,
  showToast,
  Toast,
  LocalStorage,
  Clipboard
} from "@raycast/api"
import { useEffect, useState } from "react"
import { runAppleScript } from "run-applescript"
import os, { devNull } from "os"
import { Notebook, State } from "./typing"
import { dateFormat, getLocalDateFromDB } from "./utils"
import { readFileSync } from "fs"
import initSqlJs, { Database, ParamsObject } from "sql.js"
import path from "path"
import open from "open"
import { useDatebase } from "./hooks"

export default function Command() {
  const [state, setState] = useState<State>({
    notebooks: [],
    loading: true
  })

  const [db, error] = useDatebase()

  async function openNotebook(id: string) {
    await closeMainWindow()
    open(`marginnote3app://notebook/${id}`)
  }

  async function checkCached() {
    const cache = (await LocalStorage.getItem("mn-notebookids")) as string
    if (cache) {
      setData(cache.split(", "))
    }
    setData(await getNotebookids())
  }

  function setData(nds: string[]) {
    setState({
      // @ts-ignore
      notebooks: nds.map(k => db!.getNotebook(k)).filter(k => k),
      loading: false
    })
  }

  async function getNotebookids() {
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
    await LocalStorage.setItem("mn-notebookids", res)
    return res.split(", ")
  }

  useEffect(() => {
    if (db) checkCached()
  }, [db])

  if (error) {
    showToast(Toast.Style.Failure, "Something went wrong", error.message)
  }

  const today = new Date()
  const [day, week, month, year] = [
    today.getDate(),
    today.getDay(),
    today.getMonth(),
    today.getFullYear()
  ]
  return (
    <List isLoading={state.loading} searchBarPlaceholder="搜索笔记本">
      {state.notebooks
        .sort((m, n) => n.lastVisit.getTime() - m.lastVisit.getTime())
        // today, yesterday, this week, this month, this year, older
        .reduce(
          (acc, cur) => {
            const [d, w, m, y] = [
              cur.lastVisit.getDate(),
              cur.lastVisit.getDay(),
              cur.lastVisit.getMonth(),
              cur.lastVisit.getFullYear()
            ]
            if (y === year && m === month && w === week && d === day) {
              acc[0].push(cur)
            } else if (
              y === year &&
              m === month &&
              w === week &&
              d === day - 1
            ) {
              acc[1].push(cur)
            } else if (y === year && m === month && w === week) {
              acc[2].push(cur)
            } else if (y === year && m === month) {
              acc[3].push(cur)
            } else if (y === year) {
              acc[4].push(cur)
            } else {
              acc[5].push(cur)
            }
            return acc
          },
          [[], [], [], [], [], []] as [
            Notebook[],
            Notebook[],
            Notebook[],
            Notebook[],
            Notebook[],
            Notebook[]
          ]
        )
        .map((m, i) => {
          const sections = [
            "today",
            "yesterday",
            "this week",
            "this month",
            "this year",
            "older"
          ]
          if (m.length === 0) return null
          return (
            <List.Section key={i} title={sections[i]}>
              {m.map((k, j) => (
                <List.Item
                  key={i * 100 + j}
                  icon="marginnote.png"
                  title={k.title}
                  subtitle={dateFormat(k.lastVisit)}
                  accessoryTitle={k.tags.join(" ")}
                  actions={
                    <ActionPanel title="Actions">
                      <Action
                        title="Open in MarginNote"
                        icon={Icon.BlankDocument}
                        onAction={() => openNotebook(k.id)}
                      />
                      <Action
                        title="Copy Notebook Link"
                        icon={Icon.BlankDocument}
                        onAction={() =>
                          Clipboard.copy(`marginnote3app://notebook/${k.id}`)
                        }
                      />
                      <Action
                        title="Copy Notebook Link（Markdown Style）"
                        icon={Icon.BlankDocument}
                        shortcut={{
                          modifiers: ["cmd"],
                          key: "l"
                        }}
                        onAction={() =>
                          Clipboard.copy(
                            `[${k.title}](marginnote3app://notebook/${k.id})`
                          )
                        }
                      />
                    </ActionPanel>
                  }
                />
              ))}
            </List.Section>
          )
        })}
    </List>
  )
}
