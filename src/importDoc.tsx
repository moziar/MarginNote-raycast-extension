import {
  ActionPanel,
  List,
  Icon,
  Action,
  trash,
  LocalStorage,
  confirmAlert,
  showToast
} from "@raycast/api"
import { homedir } from "os"
import { useEffect, useState } from "react"
import { runAppleScriptSync } from "run-applescript"
import fg, { Entry } from "fast-glob"
import { Doc, SearchDocState } from "./typings"
import { copyFile, existsSync, PathLike, statSync } from "fs-extra"
import { isRunning, openMN, restartMN } from "./utils/applescript"

const home = homedir()
const docPath = `${home}/Library/Containers/QReader.MarginStudyMac/Data/Documents`

async function fetchData(): Promise<Doc[]> {
  return (
    await fg([`${home}/**/*.{pdf,epub}`], {
      deep: 5,
      onlyFiles: true,
      followSymbolicLinks: false,
      ignore: [
        "**/node_modules/**/*",
        "**/.git/**/*",
        "**/*.app/**/*",
        "**/*.marginbackupall/**/*"
      ],
      suppressErrors: true,
      objectMode: true
    })
  ).sort((a, b) => (a.path < b.path ? -1 : 1))
}

function getAllFolder(): Entry[] {
  return fg.sync([`${docPath}/**/*`], {
    deep: 5,
    onlyDirectories: true,
    followSymbolicLinks: false,
    ignore: [
      "**/node_modules/**/*",
      "**/.git/**/*",
      "**/*.app/**/*",
      "**/*.marginbackupall/**/*"
    ],
    suppressErrors: true,
    objectMode: true
  })
}

function moveToTrash(path: PathLike | PathLike[]) {
  trash(path)
  showToast({
    title:
      Array.isArray(path) && path.length > 1
        ? "Moved items to Trash"
        : "Moved item to Trash"
  })
}

function copyToMN(doc: Doc | Doc[]) {
  ;(Array.isArray(doc) ? doc : [doc]).forEach(k => {
    const dest = `${docPath}/${k.name}`
    if (
      !existsSync(dest) ||
      statSync(k.path).atimeMs !== statSync(dest).atimeMs
    )
      copyFile(
        k.path,
        existsSync(dest) ? dest.replace(/\.(\w+)$/, "(new).$1") : dest,
        err => {
          console.log(err)
        }
      )
  })
}

async function updateData() {
  if (await isRunning("MarginNote 3")) {
    if (
      await confirmAlert({
        title: "MarginNote 3 is Running",
        message:
          "You must restart MarginNote to ensure a successful import. Whether to restart now ?",
        icon: "marginnote.png"
      })
    ) {
      restartMN()
    }
  } else if (
    await confirmAlert({
      title: "Imported successfully",
      message: "Whether to open MarginNote now ?",
      icon: "marginnote.png"
    })
  ) {
    openMN()
  }
}

export default function () {
  const [state, setState] = useState<SearchDocState>({
    docs: [],
    loading: true
  })

  const [selectedList, setSelectedList] = useState<number[]>([])
  const folders = getAllFolder()

  async function checkCache() {
    const cache = (await LocalStorage.getItem("marginnote-docs")) as string
    let docs: Doc[]
    if (cache) {
      docs = JSON.parse(cache)
      setState({
        docs,
        loading: false
      })
    }

    docs = await fetchData()

    setState({
      docs,
      loading: false
    })

    LocalStorage.setItem("marginnote-docs", JSON.stringify(docs))
  }

  useEffect(() => {
    checkCache()
  }, [])

  return (
    <List
      isLoading={state.loading}
      searchBarPlaceholder="Find and Choose Document to Import"
    >
      {state.docs.map((doc, index) => {
        const accessoryTitle = doc.path
          .replace(home, "~")
          .replace("/" + doc.name, "")
        return (
          <List.Item
            key={index}
            icon={selectedList.includes(index) ? Icon.Checkmark : Icon.Circle}
            title={doc.name}
            accessoryTitle={accessoryTitle}
            keywords={accessoryTitle.split("/")}
            actions={
              <ActionPanel title="Actions">
                <Action
                  title="Toggle the Selection"
                  icon={Icon.CheckCircle}
                  onAction={() => {
                    if (selectedList.includes(index))
                      setSelectedList([
                        ...selectedList.filter(m => m !== index)
                      ])
                    else setSelectedList([...selectedList, index])
                    runAppleScriptSync(`
                      tell application "System Events"
                        tell process "Raycast"
                          key code 125
                        end tell
                      end tell
                    `)
                  }}
                />
                <ActionPanel.Section title="Support Muilt File">
                  <ActionPanel.Submenu
                    title="Import to MarginNote"
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                    icon="marginnote.png"
                  >
                    {[{ name: "🏠 Home", path: docPath }, ...folders].map(
                      (folder, q) => (
                        <Action
                          title={folder.name}
                          key={q}
                          onAction={async () => {
                            copyToMN(
                              selectedList.length
                                ? selectedList.map(k => state.docs[k])
                                : doc
                            )
                            setSelectedList([])
                            updateData()
                          }}
                        ></Action>
                      )
                    )}
                  </ActionPanel.Submenu>

                  <ActionPanel.Submenu
                    title="Move to MarginNote"
                    icon="marginnote.png"
                    shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                  >
                    {[{ name: "🏠 Home", path: docPath }, ...folders].map(
                      (folder, q) => (
                        <Action
                          title={folder.name}
                          key={q}
                          onAction={async () => {
                            copyToMN(
                              selectedList.length
                                ? selectedList.map(k => state.docs[k])
                                : doc
                            )
                            setSelectedList([])
                            moveToTrash(
                              selectedList.length
                                ? selectedList.map(k => state.docs[k].path)
                                : doc.path
                            )
                            const docs = state.docs.filter((k, i) =>
                              selectedList.length
                                ? !selectedList.includes(i)
                                : i !== index
                            )
                            setState({
                              ...state,
                              docs
                            })
                            LocalStorage.setItem(
                              "marginnote-docs",
                              JSON.stringify(docs)
                            )
                            updateData()
                          }}
                        ></Action>
                      )
                    )}
                  </ActionPanel.Submenu>
                  <Action.Trash
                    paths={
                      selectedList.length
                        ? selectedList.map(k => state.docs[k].path)
                        : doc.path
                    }
                    shortcut={{ modifiers: ["cmd", "shift"], key: "x" }}
                    onTrash={() => {
                      setSelectedList([])
                      const docs = state.docs.filter((k, i) =>
                        selectedList.length
                          ? !selectedList.includes(i)
                          : i !== index
                      )
                      setState({
                        ...state,
                        docs
                      })
                      LocalStorage.setItem(
                        "marginnote-docs",
                        JSON.stringify(docs)
                      )
                    }}
                  />
                </ActionPanel.Section>

                <SingleFileAction Document={doc} />
              </ActionPanel>
            }
          />
        )
      })}
    </List>
  )
}

const SingleFileAction: React.FC<{ Document: Doc }> = ({ Document: doc }) => {
  return (
    <ActionPanel.Section title="Single File (No Need to Select)">
      <Action.ShowInFinder path={doc.path} />
      <Action.OpenWith
        path={doc.path}
        shortcut={{ modifiers: ["cmd"], key: "o" }}
      />
      <Action.CopyToClipboard
        title="Copy Name"
        content={doc.name}
        shortcut={{ modifiers: ["cmd"], key: "." }}
      />
      <Action.CopyToClipboard
        title="Copy Path"
        content={doc.path}
        shortcut={{ modifiers: ["cmd", "shift"], key: "." }}
      />
    </ActionPanel.Section>
  )
}
