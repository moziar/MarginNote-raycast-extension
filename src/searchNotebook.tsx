import {
  ActionPanel,
  List,
  closeMainWindow,
  Icon,
  Action,
  Detail,
  environment
} from "@raycast/api"
import { existsSync, readJsonSync } from "fs-extra"
import { homedir } from "os"
import React, { useEffect, useState } from "react"
import { runAppleScript } from "run-applescript"
import { pathToFileURL } from "url"
import { Notebook, NotebookFilter, SearchNotebookState } from "./typings"

const dataPath = `${homedir()}/Library/Containers/QReader.MarginStudyMac/Data/Library/MarginNote Extensions/marginnote.extension.ohmymn/raycast.json`
async function openNotebook(id: string) {
  await closeMainWindow()
  const script = `
    on openNotebook()
      open location "marginnote3app://notebook/${id}"
    end openNotebook

    on openMN()
      tell application "MarginNote 3" to activate
      delay 3
      tell application "System Events"
        tell process "MarginNote 3"
          key code 36
        end tell
      end tell
      delay 0.5
      openNotebook()
    end openMN

    on isRunning(appName)
      tell application "System Events"
        return (name of processes contains appName)
      end tell
    end isRunning

    on isActive(appName)
      tell application "System Events"
        return (name of first process whose frontmost is true) contains appName
      end tell
    end isActive


    if isRunning("MarginNote 3") and not isActive("MarginNote 3") then
    	tell application "MarginNote 3" to activate
      openNotebook()
    else if isRunning("MarginNote 3") then
      openNotebook()
    else
      openMN()
    end if
    `
  runAppleScript(script)
}

const today = new Date()
const [day, month, year] = [
  today.getDate(),
  today.getMonth() + 1,
  today.getFullYear()
]

function fetchData() {
  try {
    if (!existsSync(dataPath)) throw "not found raycast.json"
    const notebooks = readJsonSync(dataPath, "utf8") as Notebook[]
    return notebooks.sort((m, n) => (m.lastVisit < n.lastVisit ? 1 : -1))
  } catch (error) {
    console.log(error)
  }
}

export default function () {
  const [state, setState] = useState<SearchNotebookState>({
    notebooks: [],
    loading: true
  })

  const [filter, setFileter] = useState<NotebookFilter>("all")

  useEffect(() => {
    setState({
      notebooks: fetchData(),
      loading: false
    })
  }, [])

  return state.notebooks ? (
    <List
      isLoading={state.loading}
      searchBarPlaceholder="Search Notebook in MarginNote"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Notebook Type"
          storeValue={true}
          onChange={k => {
            setFileter(k as NotebookFilter)
          }}
        >
          {[
            ["all", "All"],
            ["mindmap", "MindMap"],
            ["flashcard", "FlashCard"]
          ].map(k => {
            return <List.Dropdown.Item key={k[0]} title={k[1]} value={k[0]} />
          })}
        </List.Dropdown>
      }
    >
      {state.notebooks
        .reduce(
          (acc, cur) => {
            const [y, m, d] = cur.lastVisit
              .match(/(\d+)\-(\d+)\-(\d+) /)!
              .slice(1, 4)
              .map(k => Number(k))
            if (y === year && m === month && d === day) {
              acc[0].push(cur)
            } else if (y === year && m === month && d === day - 1) {
              acc[1].push(cur)
            } else if (y === year && m === month) {
              acc[2].push(cur)
            } else if (y === year) {
              acc[3].push(cur)
            } else {
              acc[4].push(cur)
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
            "this month",
            "this year",
            "older"
          ]
          if (m.length === 0) return null
          return (
            <List.Section key={i} title={sections[i]}>
              {m
                .filter(
                  k =>
                    filter === "all" ||
                    (filter === "mindmap" && k.type === 1) ||
                    (filter === "flashcard" && k.type === 2)
                )
                .map((k, j) => (
                  <List.Item
                    key={i * 100 + j}
                    icon={k.type === 1 ? "mindmap.png" : "flashcard.png"}
                    title={k.title}
                    accessoryTitle={
                      k.type === 1
                        ? "MindMap"
                        : k.type === 2
                        ? "FlashCard"
                        : "Document"
                    }
                    actions={<Actions notebook={k} />}
                  />
                ))}
            </List.Section>
          )
        })}
    </List>
  ) : (
    <NotFound />
  )
}

const Actions: React.FC<{ notebook: Notebook }> = ({ notebook }) => {
  return (
    <ActionPanel title="Actions">
      <Action
        title="Open in MarginNote"
        icon="marginnote.png"
        onAction={() => openNotebook(notebook.id)}
      />
      <Action.CopyToClipboard
        title="Copy Link"
        icon={Icon.Clipboard}
        content={`marginnote3app://notebook/${notebook.id}`}
      />
      <Action.CopyToClipboard
        title="Copy Link（Markdown Style）"
        icon={Icon.Clipboard}
        shortcut={{
          modifiers: ["cmd", "shift"],
          key: "enter"
        }}
        content={`[${notebook.title}](marginnote3app://notebook/${notebook.id})`}
      />
    </ActionPanel>
  )
}

const NotFound = () => {
  const image = pathToFileURL(`${environment.assetsPath}/followme.gif`).href
  return (
    <Detail
      markdown={`# ⚠️ Not found data source from MarginNote.\n ## Please install MarginNote v3.7.19 and OhMyMN v4.1.0, and then follow the GIF \n > Unfortunately, OhMyMN only supports Chinese now. But English will be supported later. \n\n![](${image})`}
      actions={
        <ActionPanel title="Actions">
          <Action.OpenInBrowser
            title="Download OhMyMN"
            icon={Icon.AppWindow}
            url="https://bbs.marginnote.cn/t/topic/20501"
          />
        </ActionPanel>
      }
    />
  )
}