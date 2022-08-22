import {
  ActionPanel,
  List,
  closeMainWindow,
  Icon,
  Action,
  LocalStorage,
  Clipboard
} from "@raycast/api"
import { useEffect, useState } from "react"
import { runAppleScript } from "run-applescript"
import { Notebook, State } from "./typing"

export default function Command() {
  const [state, setState] = useState<State>({
    notebooks: [],
    loading: true
  })

  async function openNotebook(id: string) {
    await closeMainWindow()
    const script = `
    on openMN()
      tell application "MarginNote 3" to activate
      delay 3
      tell application "System Events"
        tell process "MarginNote 3"
          key code 36
        end tell
      end tell
      delay 0.5
      open location "marginnote3app://notebook/${id}"
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
      tell application "System Events"
        tell process "MarginNote 3"
          key code 36
        end tell
      end tell
      delay 0.5
      open location "marginnote3app://notebook/${id}"
    else if isRunning("MarginNote 3") then
      open location "marginnote3app://notebook/${id}"
    else
      openMN()
    end if
    `
    runAppleScript(script)
  }

  async function checkCached() {}

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

  async function fetchData() {
    const script = `
tell application "MarginNote 3"
	set res to {}
	set nbs to (search notebook "" type MindMapNotebook)
	repeat with n in nbs
		set d to last visit of n
		set t to {short date string of d, " ", time string of d}
		set end of res to {id of n, title of n, get t as string}
	end repeat
	return res
end tell
    `
    const res = (await runAppleScript(script)).split(", ")
    const data = res
      .reduce((acc, cur, i) => {
        switch (i % 3) {
          case 0:
            acc.push({
              id: cur,
              title: "",
              lastVisit: ""
            })
            break
          case 1:
            acc[acc.length - 1].title = cur
            break
          case 2:
            acc[acc.length - 1].lastVisit = cur
        }
        return acc
      }, [] as Notebook[])
      .sort((m, n) => (m.lastVisit < n.lastVisit ? 1 : -1))
    setState({
      notebooks: data,
      loading: false
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const today = new Date()
  const [day, month, year] = [
    today.getDate(),
    today.getMonth() + 1,
    today.getFullYear()
  ]

  return (
    <List isLoading={state.loading} searchBarPlaceholder="搜索笔记本">
      {state.notebooks
        .reduce(
          (acc, cur) => {
            const [y, m, d] = cur.lastVisit
              .match(/(\d+)\/(\d+)\/(\d+) /)!
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
              {m.map((k, j) => (
                <List.Item
                  key={i * 100 + j}
                  icon="marginnote.png"
                  title={k.title}
                  // subtitle={k.lastVisit}
                  // accessoryTitle={k.lastVisit}
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
