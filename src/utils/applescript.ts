import { runAppleScript } from "run-applescript"

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

export async function restartMN(skipAlert = true) {
  const script = `
    on openMN()
      tell application "MarginNote 3" to activate
      if ${skipAlert} then
        delay 3
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

export async function openMN(skipAlert = true) {
  const script = `
    tell application "MarginNote 3" to activate
    if ${skipAlert} then
      delay 3
      tell application "System Events"
        tell process "MarginNote 3"
          key code 36
        end tell
      end tell
    end if
    `
  await runAppleScript(script)
}
