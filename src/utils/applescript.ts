import { getPreferenceValues } from "@raycast/api"
import { runAppleScript } from "run-applescript"
import { escapeDoubleQuote } from "."
import { NewNote, Preferences } from "../typings"

export async function isRunning(appName: string) {
  try {
    const script = `
    tell application "System Events"
      return (name of processes contains "${appName}")
    end tell
  `
    return (await runAppleScript(script)) === "true"
  } catch (err) {
    console.log(err)
    return false
  }
}

export async function restartMN() {
  const { skipAlert, waitingTime } = getPreferenceValues<Preferences>()
  const script = `
    on openMN()
      tell application "MarginNote 3" to activate
      if ${skipAlert} then
        delay ${waitingTime}
        tell application "System Events"
          tell process "MarginNote 3"
            key code 36
          end tell
        end tell
      end if
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

    if isRunning("MarginNote 3") then
      tell application "MarginNote 3" to activate
      repeat until isActive("MarginNote 3")
        delay 0.1
      end repeat
      tell application "MarginNote 3" to quit
      repeat while isRunning("MarginNote 3")
        delay 0.1
      end repeat
      openMN()
    else
      openMN()
    end if
    `
  await runAppleScript(script)
}

export async function openMN() {
  const { skipAlert, waitingTime } = getPreferenceValues<Preferences>()
  const script = `
    tell application "MarginNote 3" to activate
    if ${skipAlert} then
      delay ${waitingTime}
      tell application "System Events"
        tell process "MarginNote 3"
          key code 36
        end tell
      end tell
    end if
    `
  await runAppleScript(script)
}

export async function creatNote(note: NewNote, parentNoteid: string) {
  const { title, excerptText, commentText, tags, link } = note
  runAppleScript(`
  on createNote()
    tell application "MarginNote 3"
      set n to (fetch note "${parentNoteid}")
      if n = missing value then
        set nb to notebook of n
        set nbid to id of nb
        set nn to new note in notebook nbid
        add child notes {nn} target note n
        set title of nn to "${escapeDoubleQuote(title)}"
        set excerpt text of nn to "${escapeDoubleQuote(excerptText)}"
        if "${commentText}" is not "" then
          append text comment "${escapeDoubleQuote(commentText)}" target note nn
        end if
        if "${link}" is not "" then
          append text comment "${escapeDoubleQuote(link)}" target note nn
        end if
        if "${tags}" is not "" then
          append text comment "${escapeDoubleQuote(tags)}" target note nn
        end if
      end if
    end tell
  end createNote
  createNote()`)
}
